import { Response } from 'express';
import { z } from 'zod';
import { MenuItem } from '../models';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth.middleware';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../utils/constants';

// ─── Validation Schemas ─────────────────────────────────

const createMenuItemSchema = z.object({
  canteenId: z.string(),
  category: z.string().min(1).max(50).trim(),
  name: z.string().min(1).max(100).trim(),
  description: z.string().min(1).max(500).trim(),
  price: z.number().min(0, 'Price cannot be negative'),
  originalPrice: z.number().min(0).optional(),
  prepTime: z.string().min(1),
  image: z.string().url('Must be a valid image URL'),
  isVeg: z.boolean(),
  inStock: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isFast: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const updateMenuItemSchema = createMenuItemSchema.partial();

// ─── Controllers ────────────────────────────────────────

export const getMenuItems = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit as string) || DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query.canteenId) {
      filter.canteenId = req.query.canteenId;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.isVeg !== undefined) {
      filter.isVeg = req.query.isVeg === 'true';
    }
    if (req.query.isTrending !== undefined) {
      filter.isTrending = req.query.isTrending === 'true';
    }
    if (req.query.isFast !== undefined) {
      filter.isFast = req.query.isFast === 'true';
    }
    if (req.query.inStock !== undefined) {
      filter.inStock = req.query.inStock === 'true';
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    const sortField = (req.query.sort as string) || 'sortOrder';
    const sortOrder = req.query.order === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      MenuItem.find(filter)
        .sort({ [sortField]: sortOrder, name: 1 })
        .skip(skip)
        .limit(limit),
      MenuItem.countDocuments(filter),
    ]);

    res.json(ApiResponse.paginated(items, page, limit, total));
  }
);

export const getMenuItemById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      throw ApiError.notFound('Menu item not found');
    }
    res.json(ApiResponse.success(item));
  }
);

export const createMenuItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = createMenuItemSchema.parse(req.body);

    const item = await MenuItem.create(data);

    res.status(201).json(
      ApiResponse.success(item, 'Menu item created successfully')
    );
  }
);

export const updateMenuItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = updateMenuItemSchema.parse(req.body);

    const item = await MenuItem.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      throw ApiError.notFound('Menu item not found');
    }

    res.json(ApiResponse.success(item, 'Menu item updated successfully'));
  }
);

export const deleteMenuItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      throw ApiError.notFound('Menu item not found');
    }

    res.json(ApiResponse.success(null, 'Menu item deleted successfully'));
  }
);

export const getTrendingItems = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const limit = Math.min(
      20,
      Math.max(1, parseInt(req.query.limit as string) || 10)
    );

    const items = await MenuItem.find({ isTrending: true, inStock: true })
      .sort({ sortOrder: 1 })
      .limit(limit)
      .populate('canteenId', 'name rating');

    res.json(ApiResponse.success(items));
  }
);

export const getFastItems = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const limit = Math.min(
      20,
      Math.max(1, parseInt(req.query.limit as string) || 10)
    );

    const items = await MenuItem.find({ isFast: true, inStock: true })
      .sort({ sortOrder: 1 })
      .limit(limit)
      .populate('canteenId', 'name rating');

    res.json(ApiResponse.success(items));
  }
);

export const getMenuByCanteen = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { canteenId } = req.params;

    const items = await MenuItem.find({ canteenId })
      .sort({ category: 1, sortOrder: 1, name: 1 });

    // Group items by category
    const grouped: Record<string, typeof items> = {};
    for (const item of items) {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    }

    res.json(ApiResponse.success({ items, grouped }));
  }
);
