import { Response, NextFunction } from 'express';
import { Offer, Coupon } from '../../models';
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  claimOffer,
  getCoupons,
  validateCoupon,
  createCoupon,
} from '../../controllers/offer.controller';
import type { AuthRequest } from '../../middleware/auth.middleware';

jest.mock('../../models', () => ({
  Offer: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  Coupon: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe('offer controller', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { _id: 'user_1', isAdmin: false } as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  const sampleOffer = {
    _id: 'offer_1',
    title: 'Summer Special',
    discount: '20% Off',
    description: 'Get 20% off on all burgers',
    validUntil: '2026-08-01',
    code: 'SUMMER20',
    gradient: 'from-orange-500 to-pink-500',
    isActive: true,
    claimed: 5,
    maxClaims: 100,
    minOrderValue: 0,
  };

  const sampleCoupon = {
    _id: 'coupon_1',
    code: 'WELCOME10',
    discount: '10% Off',
    description: 'Welcome discount for new users',
    minOrder: 100,
    discountType: 'percentage',
    discountValue: 10,
    maxUses: 1000,
    usedCount: 50,
    isActive: true,
    expiresAt: new Date('2026-12-31'),
  };

  describe('getOffers', () => {
    it('should return all active offers sorted by newest first', async () => {
      const mockOffers = [sampleOffer];
      (Offer.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockOffers),
      });

      await getOffers(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Offer.find).toHaveBeenCalledWith({ isActive: true });
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockOffers })
      );
    });

    it('should return empty array when no offers exist', async () => {
      (Offer.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await getOffers(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: [] })
      );
    });
  });

  describe('createOffer', () => {
    const validBody = {
      title: 'New Offer',
      discount: '15% Off',
      description: 'Description',
      validUntil: '2026-09-01',
      code: 'NEW15',
      gradient: 'from-blue-500 to-purple-500',
    };

    it('should create an offer and return 201', async () => {
      mockReq.body = validBody;
      (Offer.findOne as jest.Mock).mockResolvedValue(null);
      (Offer.create as jest.Mock).mockResolvedValue({
        _id: 'new_offer',
        ...validBody,
        isActive: true,
        claimed: 0,
      });

      await createOffer(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Offer.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Offer created successfully',
        })
      );
    });

    it('should return 409 when offer code already exists', async () => {
      mockReq.body = validBody;
      (Offer.findOne as jest.Mock).mockResolvedValue(sampleOffer);

      await createOffer(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 409 })
      );
    });
  });

  describe('updateOffer', () => {
    it('should update an offer successfully', async () => {
      mockReq.params = { id: 'offer_1' };
      mockReq.body = { discount: '25% Off' };
      (Offer.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...sampleOffer,
        discount: '25% Off',
      });

      await updateOffer(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Offer.findByIdAndUpdate).toHaveBeenCalledWith(
        'offer_1',
        { discount: '25% Off' },
        expect.objectContaining({ new: true })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Offer updated successfully' })
      );
    });

    it('should return 404 when offer to update is not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { discount: '25% Off' };
      (Offer.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await updateOffer(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'Offer not found' })
      );
    });
  });

  describe('deleteOffer', () => {
    it('should deactivate an offer successfully', async () => {
      mockReq.params = { id: 'offer_1' };
      (Offer.findByIdAndUpdate as jest.Mock).mockResolvedValue(sampleOffer);

      await deleteOffer(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Offer.findByIdAndUpdate).toHaveBeenCalledWith(
        'offer_1',
        { isActive: false }
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Offer deactivated successfully',
        })
      );
    });

    it('should return 404 when offer to delete is not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      (Offer.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await deleteOffer(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('claimOffer', () => {
    it('should claim an offer successfully', async () => {
      mockReq.params = { code: 'SUMMER20' };
      const mockOffer = {
        ...sampleOffer,
        claimed: 5,
        save: jest.fn().mockResolvedValue(true),
      };
      (Offer.findOne as jest.Mock).mockResolvedValue(mockOffer);

      await claimOffer(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockOffer.claimed).toBe(6);
      expect(mockOffer.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Offer "Summer Special" claimed!',
        })
      );
    });

    it('should return 404 when offer code is not found', async () => {
      mockReq.params = { code: 'INVALID' };
      (Offer.findOne as jest.Mock).mockResolvedValue(null);

      await claimOffer(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Offer not found or expired',
        })
      );
    });

    it('should return 400 when max claims reached', async () => {
      mockReq.params = { code: 'LIMITED' };
      const mockOffer = {
        ...sampleOffer,
        claimed: 100,
        maxClaims: 100,
        save: jest.fn(),
      };
      (Offer.findOne as jest.Mock).mockResolvedValue(mockOffer);

      await claimOffer(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Offer has reached maximum claims',
        })
      );
    });
  });

  describe('getCoupons', () => {
    it('should return active, non-expired coupons', async () => {
      const mockCoupons = [sampleCoupon];
      (Coupon.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCoupons),
      });

      await getCoupons(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Coupon.find).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockCoupons })
      );
    });
  });

  describe('validateCoupon', () => {
    it('should validate a valid percentage coupon', async () => {
      mockReq.params = { code: 'WELCOME10' };
      mockReq.query = { orderValue: '500' };
      (Coupon.findOne as jest.Mock).mockResolvedValue(sampleCoupon);

      await validateCoupon(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Coupon.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'WELCOME10' })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            coupon: sampleCoupon,
            discountAmount: 50, // 10% of 500
          }),
        })
      );
    });

    it('should validate a valid fixed discount coupon', async () => {
      mockReq.params = { code: 'FLAT50' };
      mockReq.query = { orderValue: '300' };
      const fixedCoupon = { ...sampleCoupon, code: 'FLAT50', discountType: 'fixed', discountValue: 50 };
      (Coupon.findOne as jest.Mock).mockResolvedValue(fixedCoupon);

      await validateCoupon(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ discountAmount: 50 }),
        })
      );
    });

    it('should return 404 for invalid coupon', async () => {
      mockReq.params = { code: 'INVALID' };
      (Coupon.findOne as jest.Mock).mockResolvedValue(null);

      await validateCoupon(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'Invalid or expired coupon' })
      );
    });

    it('should return 400 when coupon max uses reached', async () => {
      mockReq.params = { code: 'EXHAUSTED' };
      (Coupon.findOne as jest.Mock).mockResolvedValue({
        ...sampleCoupon,
        code: 'EXHAUSTED',
        usedCount: 1000,
        maxUses: 1000,
      });

      await validateCoupon(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, message: 'Coupon has reached maximum usage' })
      );
    });

    it('should return 400 when order value is below minimum', async () => {
      mockReq.params = { code: 'WELCOME10' };
      mockReq.query = { orderValue: '50' };
      (Coupon.findOne as jest.Mock).mockResolvedValue(sampleCoupon);

      await validateCoupon(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Minimum order value of ₹100 required',
        })
      );
    });
  });

  describe('createCoupon', () => {
    const validBody = {
      code: 'NEWUSER',
      discount: '₹50 Off',
      description: 'New user discount',
      discountType: 'fixed' as const,
      discountValue: 50,
      minOrder: 200,
      maxUses: 500,
    };

    it('should create a coupon and return 201', async () => {
      mockReq.body = validBody;
      (Coupon.findOne as jest.Mock).mockResolvedValue(null);
      (Coupon.create as jest.Mock).mockResolvedValue({
        _id: 'new_coupon',
        ...validBody,
        isActive: true,
        usedCount: 0,
      });

      await createCoupon(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Coupon.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Coupon created successfully',
        })
      );
    });

    it('should return 409 when coupon code already exists', async () => {
      mockReq.body = validBody;
      (Coupon.findOne as jest.Mock).mockResolvedValue(sampleCoupon);

      await createCoupon(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 409 })
      );
    });

    it('should parse expiresAt string to Date', async () => {
      mockReq.body = { ...validBody, expiresAt: '2026-12-31' };
      (Coupon.findOne as jest.Mock).mockResolvedValue(null);
      (Coupon.create as jest.Mock).mockResolvedValue({ _id: 'new_coupon', ...validBody });

      await createCoupon(mockReq as AuthRequest, mockRes as Response, mockNext);

      const createArg = (Coupon.create as jest.Mock).mock.calls[0][0];
      expect(createArg.expiresAt).toBeInstanceOf(Date);
    });
  });
});
