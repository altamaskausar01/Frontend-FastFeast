import { Response } from 'express';
import { z } from 'zod';
import { Offer, Coupon } from '../models';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth.middleware';

// ─── Validation Schemas ─────────────────────────────────

const createOfferSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  discount: z.string().min(1),
  description: z.string().min(1).trim(),
  validUntil: z.string().min(1),
  code: z.string().min(1).max(20).trim().toUpperCase(),
  gradient: z.string().optional(),
  maxClaims: z.number().int().positive().optional(),
  minOrderValue: z.number().min(0).optional(),
  canteenId: z.string().optional(),
});

const createCouponSchema = z.object({
  code: z.string().min(1).max(20).trim().toUpperCase(),
  discount: z.string().min(1),
  description: z.string().min(1).trim(),
  minOrder: z.number().min(0).optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
});

// ─── Offer Controllers ──────────────────────────────────

export const getOffers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const offers = await Offer.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json(ApiResponse.success(offers));
  }
);

export const createOffer = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = createOfferSchema.parse(req.body);

    const existing = await Offer.findOne({ code: data.code });
    if (existing) {
      throw ApiError.conflict('An offer with this code already exists');
    }

    const offer = await Offer.create(data);

    res.status(201).json(
      ApiResponse.success(offer, 'Offer created successfully')
    );
  }
);

export const updateOffer = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = createOfferSchema.partial().parse(req.body);

    const offer = await Offer.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!offer) {
      throw ApiError.notFound('Offer not found');
    }

    res.json(ApiResponse.success(offer, 'Offer updated successfully'));
  }
);

export const deleteOffer = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const offer = await Offer.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });

    if (!offer) {
      throw ApiError.notFound('Offer not found');
    }

    res.json(ApiResponse.success(null, 'Offer deactivated successfully'));
  }
);

export const claimOffer = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { code } = req.params;

    const offer = await Offer.findOne({ code, isActive: true });
    if (!offer) {
      throw ApiError.notFound('Offer not found or expired');
    }

    if (offer.maxClaims && offer.claimed >= offer.maxClaims) {
      throw ApiError.badRequest('Offer has reached maximum claims');
    }

    offer.claimed += 1;
    await offer.save();

    res.json(
      ApiResponse.success(
        { offer, discount: offer.discount },
        `Offer "${offer.title}" claimed!`
      )
    );
  }
);

// ─── Coupon Controllers ─────────────────────────────────

export const getCoupons = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    }).sort({ createdAt: -1 });

    res.json(ApiResponse.success(coupons));
  }
);

export const validateCoupon = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const code = req.params.code as string;
    const { orderValue } = req.query;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    });

    if (!coupon) {
      throw ApiError.notFound('Invalid or expired coupon');
    }

    if (coupon.usedCount >= coupon.maxUses) {
      throw ApiError.badRequest('Coupon has reached maximum usage');
    }

    const orderTotal = parseInt(orderValue as string) || 0;
    if (orderTotal < coupon.minOrder) {
      throw ApiError.badRequest(
        `Minimum order value of ₹${coupon.minOrder} required`
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    } else {
      discountAmount = Math.round((orderTotal * coupon.discountValue) / 100);
    }

    res.json(
      ApiResponse.success(
        { coupon, discountAmount },
        'Coupon applied successfully'
      )
    );
  }
);

export const createCoupon = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = createCouponSchema.parse(req.body);

    const existing = await Coupon.findOne({ code: data.code });
    if (existing) {
      throw ApiError.conflict('A coupon with this code already exists');
    }

    const couponData: Record<string, unknown> = { ...data };
    if (data.expiresAt) {
      couponData.expiresAt = new Date(data.expiresAt);
    }

    const coupon = await Coupon.create(couponData);

    res.status(201).json(
      ApiResponse.success(coupon, 'Coupon created successfully')
    );
  }
);
