import { Response } from 'express';
import { z } from 'zod';
import { Canteen, MenuItem, Order } from '../models';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth.middleware';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../utils/constants';

// ─── Validation Schemas ─────────────────────────────────

const createCanteenSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  tags: z.array(z.string()).optional(),
  rushLevel: z.enum(['low', 'medium', 'high']).optional(),
  avgWaitTime: z.string().optional(),
  bannerImage: z.string().url('Must be a valid URL'),
  logoImage: z.string().url('Must be a valid URL').optional(),
  categories: z.array(z.string()).optional(),
  contactPhone: z.string().optional(),
  address: z.string().trim().optional(),
  openingHours: z.string().trim().optional(),
});

const updateCanteenSchema = createCanteenSchema.partial();

// ─── Controllers ────────────────────────────────────────

export const getAllCanteens = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit as string) || DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isActive: true };

    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag] };
    }

    const sortField = (req.query.sort as string) || 'rating';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const [canteens, total] = await Promise.all([
      Canteen.find(filter)
        .sort({ [sortField]: sortOrder, name: 1 })
        .skip(skip)
        .limit(limit),
      Canteen.countDocuments(filter),
    ]);

    res.json(ApiResponse.paginated(canteens, page, limit, total));
  }
);

export const getCanteenById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const canteen = await Canteen.findById(id);
    if (!canteen) {
      throw ApiError.notFound('Canteen not found');
    }

    res.json(ApiResponse.success(canteen));
  }
);

export const getCanteenWithMenu = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const canteen = await Canteen.findById(id);
    if (!canteen) {
      throw ApiError.notFound('Canteen not found');
    }

    const menuItems = await MenuItem.find({ canteenId: id })
      .sort({ category: 1, sortOrder: 1, name: 1 });

    res.json(
      ApiResponse.success({
        canteen,
        menuItems,
      })
    );
  }
);

export const createCanteen = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.isAdmin && !req.user?.isCanteenOwner) {
      throw ApiError.forbidden('Only admins and canteen owners can create canteens');
    }

    const data = createCanteenSchema.parse(req.body);

    const canteen = await Canteen.create({
      ...data,
      ownerId: req.user?.isAdmin ? undefined : req.user!._id,
    });

    res.status(201).json(
      ApiResponse.success(canteen, 'Canteen created successfully')
    );
  }
);

export const updateCanteen = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const data = updateCanteenSchema.parse(req.body);

    const canteen = await Canteen.findById(id);
    if (!canteen) {
      throw ApiError.notFound('Canteen not found');
    }

    // Only admin or owner can update
    if (
      !req.user?.isAdmin &&
      canteen.ownerId?.toString() !== req.user!._id.toString()
    ) {
      throw ApiError.forbidden('You can only update your own canteen');
    }

    const updated = await Canteen.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    res.json(ApiResponse.success(updated, 'Canteen updated successfully'));
  }
);

export const deleteCanteen = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user?.isAdmin) {
      throw ApiError.forbidden('Only admins can delete canteens');
    }

    const canteen = await Canteen.findByIdAndUpdate(id, { isActive: false });
    if (!canteen) {
      throw ApiError.notFound('Canteen not found');
    }

    res.json(ApiResponse.success(null, 'Canteen deactivated successfully'));
  }
);

export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user?.isAdmin && !req.user?.isCanteenOwner) {
      throw ApiError.forbidden('Access denied');
    }

    const filter: Record<string, unknown> = {};
    if (id) {
      filter._id = id;
    }
    if (req.user?.isCanteenOwner && !req.user?.isAdmin) {
      filter.ownerId = req.user._id;
    }

    const canteens = await Canteen.find(filter).select('_id');
    const canteenIds = canteens.map((c) => c._id);

    const [totalOrders, recentOrders] = await Promise.all([
      Order.countDocuments({ canteenId: { $in: canteenIds } }),
      Order.find({ canteenId: { $in: canteenIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name'),
    ]);

    res.json(
      ApiResponse.success({
        totalCanteens: canteens.length,
        totalOrders,
        recentOrders,
      })
    );
  }
);
