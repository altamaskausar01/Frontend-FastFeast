import { Response, NextFunction } from 'express';
import { Order, MenuItem, Canteen, User } from '../../models';
import {
  placeOrder,
  updateOrderStatus,
  cancelOrder,
  getOrders,
  getOrderById,
  getOrdersByCanteen,
  getActiveOrders,
} from '../../controllers/order.controller';
import type { AuthRequest } from '../../middleware/auth.middleware';

// Mock all model dependencies
jest.mock('../../models', () => ({
  Order: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
  },
  MenuItem: {
    find: jest.fn(),
  },
  Canteen: {
    findById: jest.fn(),
  },
  User: {
    findByIdAndUpdate: jest.fn(),
  },
}));

describe('order controller', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;
  const mockUserId = 'user_123';
  const mockMenuItemId = 'menu_item_1';
  const mockCanteenId = 'canteen_1';
  const mockOrderId = 'order_1';

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: {
        _id: mockUserId,
        name: 'Test User',
        email: 'test@test.com',
        phone: '+91 9876543210',
        isAdmin: false,
      } as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('placeOrder', () => {
    const validOrderBody = {
      canteenId: mockCanteenId,
      items: [
        {
          menuItemId: mockMenuItemId,
          quantity: 2,
        },
      ],
      paymentMethod: 'UPI',
    };

    it('should place an order successfully', async () => {
      mockReq.body = validOrderBody;

      const mockCanteen = {
        _id: mockCanteenId,
        name: 'Test Canteen',
        avgWaitTime: '5 min',
      };

      const mockMenuItem = {
        _id: mockMenuItemId,
        name: 'Cheese Burger',
        price: 120,
        image: 'burger.jpg',
        canteenId: mockCanteenId,
        isVeg: false,
        inStock: true,
      };

      (Canteen.findById as jest.Mock).mockResolvedValue(mockCanteen);
      (MenuItem.find as jest.Mock).mockResolvedValue([mockMenuItem]);
      (Order.countDocuments as jest.Mock).mockResolvedValue(3);
      (Order.create as jest.Mock).mockResolvedValue({
        _id: 'new_order',
        token: 'A-042',
        userId: mockUserId,
        canteenId: mockCanteenId,
        canteenName: 'Test Canteen',
        items: [
          {
            menuItemId: mockMenuItemId,
            name: 'Cheese Burger',
            price: 120,
            quantity: 2,
            image: 'burger.jpg',
          },
        ],
        subtotal: 240,
        gst: 12,
        platformFee: 5,
        discount: 20,
        finalTotal: 237,
        paymentMethod: 'UPI',
        queuePosition: 4,
        status: 'received',
        estimatedTime: '5 min',
      });

      await placeOrder(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Canteen.findById).toHaveBeenCalledWith(mockCanteenId);
      expect(MenuItem.find).toHaveBeenCalled();
      expect(Order.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Order placed successfully',
        })
      );
    });

    it('should return 404 when canteen is not found', async () => {
      mockReq.body = validOrderBody;
      (Canteen.findById as jest.Mock).mockResolvedValue(null);

      await placeOrder(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'Canteen not found' })
      );
    });

    it('should return 400 when menu items are not found', async () => {
      mockReq.body = validOrderBody;
      (Canteen.findById as jest.Mock).mockResolvedValue({
        _id: mockCanteenId,
        name: 'Test Canteen',
        avgWaitTime: '5 min',
      });
      (MenuItem.find as jest.Mock).mockResolvedValue([]);

      await placeOrder(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, message: expect.stringContaining('menu items not found') })
      );
    });

    it('should apply discount for orders over 200', async () => {
      mockReq.body = {
        ...validOrderBody,
        items: [{ menuItemId: mockMenuItemId, quantity: 3 }],
      };

      (Canteen.findById as jest.Mock).mockResolvedValue({
        _id: mockCanteenId,
        name: 'Test Canteen',
        avgWaitTime: '5 min',
      });
      (MenuItem.find as jest.Mock).mockResolvedValue([{ _id: mockMenuItemId, name: 'Samosa', price: 50, image: 's.jpg', canteenId: mockCanteenId }]);
      (Order.countDocuments as jest.Mock).mockResolvedValue(0);

      await placeOrder(mockReq as AuthRequest, mockRes as Response, mockNext);

      const orderCall = (Order.create as jest.Mock).mock.calls[0][0];
      expect(orderCall.discount).toBe(0);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      mockReq.params = { id: mockOrderId };
      mockReq.body = { status: 'preparing' };

      const mockOrder = {
        _id: mockOrderId,
        status: 'received',
        save: jest.fn().mockResolvedValue(true),
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await updateOrderStatus(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockOrder.status).toBe('preparing');
      expect(mockOrder.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Order preparing',
        })
      );
    });

    it('should reject invalid status transitions', async () => {
      mockReq.params = { id: mockOrderId };
      mockReq.body = { status: 'completed' };

      const mockOrder = {
        _id: mockOrderId,
        status: 'received',
        save: jest.fn(),
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await updateOrderStatus(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, message: expect.stringContaining('Cannot transition') })
      );
    });

    it('should return 404 for non-existent order', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { status: 'preparing' };

      (Order.findById as jest.Mock).mockResolvedValue(null);

      await updateOrderStatus(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order that is still being received', async () => {
      mockReq.params = { id: mockOrderId };

      const mockOrder = {
        _id: mockOrderId,
        userId: mockUserId,
        status: 'received',
        save: jest.fn().mockResolvedValue(true),
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await cancelOrder(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockOrder.status).toBe('cancelled');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Order cancelled successfully',
        })
      );
    });

    it('should reject cancellation if order is already being prepared', async () => {
      mockReq.params = { id: mockOrderId };

      const mockOrder = {
        _id: mockOrderId,
        userId: mockUserId,
        status: 'preparing',
        save: jest.fn(),
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await cancelOrder(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, message: expect.stringContaining('still being processed') })
      );
    });

    it('should return 404 when order to cancel is not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      (Order.findById as jest.Mock).mockResolvedValue(null);

      await cancelOrder(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'Order not found' })
      );
    });

    it('should return 403 when cancelling another users order', async () => {
      mockReq.params = { id: mockOrderId };
      const mockOrder = {
        _id: mockOrderId,
        userId: 'other_user',
        status: 'received',
        save: jest.fn(),
      };
      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await cancelOrder(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403, message: 'You can only cancel your own orders' })
      );
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders for the current user', async () => {
      const mockOrders = [
        { _id: 'o1', finalTotal: 240, status: 'completed' },
        { _id: 'o2', finalTotal: 120, status: 'received' },
      ];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockOrders),
      });
      (Order.countDocuments as jest.Mock).mockResolvedValue(2);

      await getOrders(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Order.find).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUserId })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockOrders,
          meta: expect.objectContaining({ total: 2 }),
        })
      );
    });
  });

  describe('getOrderById', () => {
    it('should return an order by ID for the owner', async () => {
      mockReq.params = { id: 'order_1' };
      const mockOrder = { _id: 'order_1', userId: mockUserId, finalTotal: 240 };
      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await getOrderById(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Order.findById).toHaveBeenCalledWith('order_1');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockOrder })
      );
    });

    it('should return 404 when order is not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      (Order.findById as jest.Mock).mockResolvedValue(null);

      await getOrderById(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'Order not found' })
      );
    });

    it('should return 403 when another user tries to view the order', async () => {
      mockReq.params = { id: 'order_1' };
      const mockOrder = { _id: 'order_1', userId: 'other_user', finalTotal: 240 };
      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await getOrderById(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('should allow admin to view any order', async () => {
      mockReq.user = { _id: 'admin_1', isAdmin: true } as any;
      mockReq.params = { id: 'order_1' };
      const mockOrder = { _id: 'order_1', userId: 'other_user', finalTotal: 240 };
      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await getOrderById(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockOrder })
      );
    });
  });

  describe('getOrdersByCanteen', () => {
    it('should return paginated orders for a canteen with populated user info', async () => {
      mockReq.params = { canteenId: 'canteen_1' };
      const mockOrders = [
        { _id: 'o1', finalTotal: 240, userId: { name: 'User1' } },
      ];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockOrders),
      });
      (Order.countDocuments as jest.Mock).mockResolvedValue(1);

      await getOrdersByCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Order.find).toHaveBeenCalledWith(
        expect.objectContaining({ canteenId: 'canteen_1' })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockOrders,
          meta: expect.objectContaining({ total: 1 }),
        })
      );
    });
  });

  describe('getActiveOrders', () => {
    it('should return active orders for the current user', async () => {
      const mockOrders = [
        { _id: 'o1', status: 'preparing' },
        { _id: 'o2', status: 'ready' },
      ];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockOrders),
      });

      await getActiveOrders(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Order.find).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          status: { $in: ['received', 'preparing', 'ready'] },
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockOrders })
      );
    });
  });
});
