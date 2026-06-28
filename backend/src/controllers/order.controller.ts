import { Response } from 'express';
import { z } from 'zod';
import { Order, MenuItem, Canteen, User } from '../models';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth.middleware';
import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  PLATFORM_FEE,
  GST_RATE,
  DISCOUNT_THRESHOLD,
  DISCOUNT_AMOUNT,
  ORDER_STATUS,
} from '../utils/constants';

// ─── Validation Schemas ─────────────────────────────────

const placeOrderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  spiceLevel: z.enum(['mild', 'medium', 'hot']).optional(),
  customizations: z.array(z.string()).optional(),
  specialNotes: z.string().max(300).optional(),
});

const placeOrderSchema = z.object({
  canteenId: z.string(),
  items: z
    .array(placeOrderItemSchema)
    .min(1, 'Order must have at least one item'),
  paymentMethod: z.enum(['UPI', 'Wallet', 'Counter']),
  notes: z.string().max(300).optional(),
  isGroupOrder: z.boolean().optional(),
  groupOrderId: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUS.RECEIVED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED,
  ]),
});

// ─── Controllers ────────────────────────────────────────

export const placeOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = placeOrderSchema.parse(req.body);

    // Validate canteen exists
    const canteen = await Canteen.findById(data.canteenId);
    if (!canteen) {
      throw ApiError.notFound('Canteen not found');
    }

    // Fetch menu items and build order items
    const menuItemIds = data.items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      canteenId: data.canteenId,
    });

    if (menuItems.length !== data.items.length) {
      throw ApiError.badRequest('Some menu items not found in this canteen');
    }

    const menuItemMap = new Map(
      menuItems.map((m) => [m._id.toString(), m])
    );

    let subtotal = 0;
    const orderItems = data.items.map((item) => {
      const menuItem = menuItemMap.get(item.menuItemId)!;
      const lineTotal = menuItem.price * item.quantity;
      subtotal += lineTotal;

      return {
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        image: menuItem.image,
        spiceLevel: item.spiceLevel,
        customizations: item.customizations,
        specialNotes: item.specialNotes,
      };
    });

    // Calculate pricing
    const gst = Math.round(subtotal * GST_RATE);
    const discount = subtotal > DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0;
    const finalTotal = subtotal + gst + PLATFORM_FEE - discount;

    // Calculate queue position
    const queueAhead = await Order.countDocuments({
      canteenId: data.canteenId,
      status: { $in: ['received', 'preparing'] },
    });

    // Create order
    const order = await Order.create({
      userId: req.user!._id,
      canteenId: data.canteenId,
      canteenName: canteen.name,
      items: orderItems,
      subtotal,
      gst,
      platformFee: PLATFORM_FEE,
      discount,
      finalTotal,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      isGroupOrder: data.isGroupOrder || false,
      groupOrderId: data.groupOrderId,
      queuePosition: queueAhead + 1,
      estimatedTime: canteen.avgWaitTime || '15-20 min',
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user!._id, {
      $inc: { totalOrders: 1, totalSaved: discount },
    });

    res.status(201).json(
      ApiResponse.success(order, 'Order placed successfully')
    );
  }
);

export const getOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit as string) || DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      userId: req.user!._id,
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json(ApiResponse.paginated(orders, page, limit, total));
  }
);

export const getOrderById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Users can only view their own orders, admins/owners can view any
    if (
      order.userId.toString() !== req.user!._id.toString() &&
      !req.user?.isAdmin &&
      !req.user?.isCanteenOwner
    ) {
      throw ApiError.forbidden('You can only view your own orders');
    }

    res.json(ApiResponse.success(order));
  }
);

export const getOrdersByCanteen = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { canteenId } = req.params;

    const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit as string) || DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { canteenId };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name phone'),
      Order.countDocuments(filter),
    ]);

    res.json(ApiResponse.paginated(orders, page, limit, total));
  }
);

export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const order = await Order.findById(id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      received: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['completed'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw ApiError.badRequest(
        `Cannot transition from "${order.status}" to "${status}"`
      );
    }

    order.status = status as typeof order.status;
    await order.save();

    res.json(ApiResponse.success(order, `Order ${status}`));
  }
);

export const getActiveOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const filter: Record<string, unknown> = {
      userId: req.user!._id,
      status: { $in: ['received', 'preparing', 'ready'] },
    };

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(ApiResponse.success(orders));
  }
);

export const cancelOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.userId.toString() !== req.user!._id.toString()) {
      throw ApiError.forbidden('You can only cancel your own orders');
    }

    if (order.status !== 'received') {
      throw ApiError.badRequest(
        'Can only cancel orders that are still being processed'
      );
    }

    order.status = 'cancelled';
    await order.save();

    res.json(ApiResponse.success(order, 'Order cancelled successfully'));
  }
);
