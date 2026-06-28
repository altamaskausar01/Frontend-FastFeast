import { Response } from 'express';
import { z } from 'zod';
import { User, Order } from '../models';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth.middleware';

// ─── Validation ────────────────────────────────────────

const updateUserSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/)
    .optional(),
});

const addWalletSchema = z.object({
  amount: z.number().int().min(1, 'Amount must be at least ₹1'),
});

// ─── Controllers ────────────────────────────────────────

export const getUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user!._id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const orderStats = await Order.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$finalTotal' },
          totalSaved: { $sum: '$discount' },
        },
      },
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      totalSaved: 0,
    };

    res.json(
      ApiResponse.success({
        user,
        stats,
      })
    );
  }
);

export const updateUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = updateUserSchema.parse(req.body);

    if (data.email) {
      const existing = await User.findOne({
        email: data.email,
        _id: { $ne: req.user!._id },
      });
      if (existing) {
        throw ApiError.conflict('Email is already in use');
      }
    }

    if (data.phone) {
      const existing = await User.findOne({
        phone: data.phone,
        _id: { $ne: req.user!._id },
      });
      if (existing) {
        throw ApiError.conflict('Phone number is already in use');
      }
    }

    const user = await User.findByIdAndUpdate(req.user!._id, data, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json(ApiResponse.success(user, 'Profile updated successfully'));
  }
);

export const addWalletBalance = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { amount } = addWalletSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $inc: { walletBalance: amount } },
      { new: true }
    );

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json(
      ApiResponse.success(
        { walletBalance: user.walletBalance },
        `₹${amount} added to wallet`
      )
    );
  }
);

export const getUserOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit as string) || 20)
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

// ─── Admin: User Management ─────────────────────────────

export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      throw ApiError.forbidden('Admin access required');
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit as string) || 20)
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json(ApiResponse.paginated(users, page, limit, total));
  }
);

export const getAdminStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      throw ApiError.forbidden('Admin access required');
    }

    const [totalUsers, totalOrders, totalCanteens, revenue] =
      await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        (await import('../models/Canteen')).Canteen.countDocuments({
          isActive: true,
        }),
        Order.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: '$finalTotal' },
            },
          },
        ]),
      ]);

    const totalRevenue = revenue[0]?.total || 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name')
      .populate('canteenId', 'name');

    res.json(
      ApiResponse.success({
        stats: {
          totalUsers,
          totalOrders,
          totalCanteens,
          totalRevenue,
        },
        recentOrders,
      })
    );
  }
);
