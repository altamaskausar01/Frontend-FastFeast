import { Response, NextFunction } from 'express';
import { User, Order } from '../../models';
import {
  getUserProfile,
  updateUserProfile,
  addWalletBalance,
  getUserOrders,
  getAllUsers,
  getAdminStats,
} from '../../controllers/user.controller';
import type { AuthRequest } from '../../middleware/auth.middleware';

// Mock both the barrel and direct Canteen import for dynamic import in getAdminStats
jest.mock('../../models', () => ({
  User: {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
  },
  Order: {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

// Mock the dynamic import path used by getAdminStats
jest.mock('../../models/Canteen', () => ({
  Canteen: {
    countDocuments: jest.fn(),
  },
}));

describe('user controller', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;
  const mockUserId = 'user_123';

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: {
        _id: mockUserId,
        name: 'Test User',
        email: 'test@example.com',
        phone: '+919876543210',
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

  const mockUser = {
    _id: mockUserId,
    name: 'Test User',
    email: 'test@example.com',
    phone: '+919876543210',
    isAdmin: false,
    isCanteenOwner: false,
    walletBalance: 500,
    totalOrders: 10,
    totalSaved: 100,
    createdAt: new Date('2026-01-01'),
  };

  describe('getUserProfile', () => {
    it('should return user profile with order stats', async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Order.aggregate as jest.Mock).mockResolvedValue([
        {
          totalOrders: 10,
          totalSpent: 2500,
          totalSaved: 100,
        },
      ]);

      await getUserProfile(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Order.aggregate).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: mockUser,
            stats: expect.objectContaining({
              totalOrders: 10,
              totalSpent: 2500,
              totalSaved: 100,
            }),
          }),
        })
      );
    });

    it('should return zero stats when no orders exist', async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Order.aggregate as jest.Mock).mockResolvedValue([]);

      await getUserProfile(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stats: { totalOrders: 0, totalSpent: 0, totalSaved: 0 },
          }),
        })
      );
    });

    it('should return 404 when user is not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await getUserProfile(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('updateUserProfile', () => {
    it('should update user name successfully', async () => {
      mockReq.body = { name: 'Updated Name' };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });

      await updateUserProfile(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        { name: 'Updated Name' },
        expect.objectContaining({ new: true })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Profile updated successfully',
        })
      );
    });

    it('should return 409 when email is already in use', async () => {
      mockReq.body = { email: 'existing@example.com' };
      (User.findOne as jest.Mock).mockResolvedValue({
        _id: 'other_user',
        email: 'existing@example.com',
      });

      await updateUserProfile(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 409, message: 'Email is already in use' })
      );
    });

    it('should return 409 when phone is already in use', async () => {
      mockReq.body = { phone: '+919999999999' };
      // When only phone is in body, email check is skipped, so findOne is called once for phone
      (User.findOne as jest.Mock).mockResolvedValue({
        _id: 'other_user',
        phone: '+919999999999',
      });

      await updateUserProfile(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 409, message: 'Phone number is already in use' })
      );
    });

    it('should return 404 when user to update is not found', async () => {
      mockReq.body = { name: 'Updated' };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await updateUserProfile(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'User not found' })
      );
    });
  });

  describe('addWalletBalance', () => {
    it('should add balance to wallet successfully', async () => {
      mockReq.body = { amount: 200 };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockUser,
        walletBalance: 700,
      });

      await addWalletBalance(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        { $inc: { walletBalance: 200 } },
        { new: true }
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { walletBalance: 700 },
          message: '₹200 added to wallet',
        })
      );
    });

    it('should return 400 when amount is less than 1', async () => {
      mockReq.body = { amount: 0 };

      await addWalletBalance(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const errorArg = (mockNext as jest.Mock).mock.calls[0][0];
      expect(errorArg.name).toBe('ZodError');
    });

    it('should return 404 when user is not found', async () => {
      mockReq.body = { amount: 100 };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await addWalletBalance(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'User not found' })
      );
    });
  });

  describe('getUserOrders', () => {
    it('should return paginated user orders', async () => {
      const mockOrders = [
        { _id: 'order_1', finalTotal: 240, status: 'completed' },
        { _id: 'order_2', finalTotal: 120, status: 'received' },
      ];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockOrders),
      });
      (Order.countDocuments as jest.Mock).mockResolvedValue(2);

      await getUserOrders(mockReq as AuthRequest, mockRes as Response, mockNext);

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

    it('should filter by status when provided', async () => {
      mockReq.query = { status: 'received' };
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (Order.countDocuments as jest.Mock).mockResolvedValue(0);

      await getUserOrders(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Order.find).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUserId, status: 'received' })
      );
    });

    it('should return empty array when user has no orders', async () => {
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (Order.countDocuments as jest.Mock).mockResolvedValue(0);

      await getUserOrders(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: [], meta: expect.objectContaining({ total: 0 }) })
      );
    });
  });

  describe('getAllUsers', () => {
    beforeEach(() => {
      mockReq.user = { ...mockReq.user, isAdmin: true } as any;
    });

    it('should return paginated users for admin', async () => {
      const mockUsers = [
        { _id: 'u1', name: 'User 1', email: 'u1@test.com' },
        { _id: 'u2', name: 'User 2', email: 'u2@test.com' },
      ];
      (User.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockUsers),
      });
      (User.countDocuments as jest.Mock).mockResolvedValue(2);

      await getAllUsers(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUsers,
          meta: expect.objectContaining({ total: 2 }),
        })
      );
    });

    it('should apply search filter when provided', async () => {
      mockReq.query = { search: 'john' };
      (User.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (User.countDocuments as jest.Mock).mockResolvedValue(0);

      await getAllUsers(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ name: { $regex: 'john', $options: 'i' } }),
          ]),
        })
      );
    });

    it('should return 403 when user is not admin', async () => {
      mockReq.user = { ...mockReq.user, isAdmin: false } as any;

      await getAllUsers(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403, message: 'Admin access required' })
      );
    });
  });

  describe('getAdminStats', () => {
    beforeEach(() => {
      mockReq.user = { ...mockReq.user, isAdmin: true } as any;
    });

    it('should return admin stats and recent orders', async () => {
      const mockRecentOrders = [
        { _id: 'o1', finalTotal: 240, userId: { name: 'User' }, canteenId: { name: 'Canteen' } },
      ];

      (User.countDocuments as jest.Mock).mockResolvedValue(50);
      (Order.countDocuments as jest.Mock).mockResolvedValue(200);
      const { Canteen } = require('../../models/Canteen');
      (Canteen.countDocuments as jest.Mock).mockResolvedValue(10);
      (Order.aggregate as jest.Mock).mockResolvedValue([
        { total: 50000 },
      ]);

      // Order.find has a chain: find().sort().limit().populate().populate()
      // Use a thenable object so populate returns an object with another populate
      const mockOrderChain = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        then: (resolve: (v: typeof mockRecentOrders) => void) => resolve(mockRecentOrders),
      };
      (Order.find as jest.Mock).mockReturnValue(mockOrderChain);

      await getAdminStats(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            stats: expect.objectContaining({
              totalUsers: 50,
              totalOrders: 200,
              totalCanteens: 10,
              totalRevenue: 50000,
            }),
          }),
        })
      );
    });

    it('should return 0 revenue when no orders exist', async () => {
      (User.countDocuments as jest.Mock).mockResolvedValue(0);
      (Order.countDocuments as jest.Mock).mockResolvedValue(0);
      const { Canteen } = require('../../models/Canteen');
      (Canteen.countDocuments as jest.Mock).mockResolvedValue(0);
      (Order.aggregate as jest.Mock).mockResolvedValue([]);

      const mockOrderChain = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        then: (resolve: (v: never[]) => void) => resolve([]),
      };
      (Order.find as jest.Mock).mockReturnValue(mockOrderChain);

      await getAdminStats(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stats: expect.objectContaining({
              totalRevenue: 0,
            }),
          }),
        })
      );
    });

    it('should return 403 when user is not admin', async () => {
      mockReq.user = { ...mockReq.user, isAdmin: false } as any;

      await getAdminStats(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403, message: 'Admin access required' })
      );
    });
  });
});
