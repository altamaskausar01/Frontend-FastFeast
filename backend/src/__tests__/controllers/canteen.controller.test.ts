import { Response, NextFunction } from 'express';
import { Canteen, MenuItem, Order } from '../../models';
import {
  getAllCanteens,
  getCanteenById,
  getCanteenWithMenu,
  createCanteen,
  updateCanteen,
  deleteCanteen,
  getDashboardStats,
} from '../../controllers/canteen.controller';
import type { AuthRequest } from '../../middleware/auth.middleware';

jest.mock('../../models', () => ({
  Canteen: {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  MenuItem: {
    find: jest.fn(),
  },
  Order: {
    countDocuments: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock('../../utils/generateToken', () => ({
  generateTokenWithUser: jest.fn(() => 'mock-jwt-token'),
}));

describe('canteen controller', () => {
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

  describe('getAllCanteens', () => {
    it('should return paginated canteens', async () => {
      const mockCanteens = [
        { _id: 'c1', name: 'Main Canteen', rating: 4.5 },
        { _id: 'c2', name: 'Cafe Brew', rating: 4.7 },
      ];

      (Canteen.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockCanteens),
      });
      (Canteen.countDocuments as jest.Mock).mockResolvedValue(10);

      await getAllCanteens(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockCanteens,
          meta: expect.objectContaining({
            page: 1,
            limit: 20,
            total: 10,
          }),
        })
      );
    });

    it('should apply search filter when query param is provided', async () => {
      mockReq.query = { search: 'cafe' };

      const mockSortFn = jest.fn().mockReturnThis();
      const mockSkipFn = jest.fn().mockReturnThis();
      const mockLimitFn = jest.fn().mockResolvedValue([]);

      (Canteen.find as jest.Mock).mockReturnValue({
        sort: mockSortFn,
        skip: mockSkipFn,
        limit: mockLimitFn,
      });

      await getAllCanteens(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Canteen.find).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          $text: { $search: 'cafe' },
        })
      );
    });

    it('should apply tag filter when tag param is provided', async () => {
      mockReq.query = { tag: 'north-indian' };
      (Canteen.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (Canteen.countDocuments as jest.Mock).mockResolvedValue(0);

      await getAllCanteens(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Canteen.find).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: { $in: ['north-indian'] },
        })
      );
    });

    it('should sort ascending when order param is asc', async () => {
      mockReq.query = { sort: 'name', order: 'asc' };
      const sortMock = jest.fn().mockReturnThis();
      (Canteen.find as jest.Mock).mockReturnValue({
        sort: sortMock,
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (Canteen.countDocuments as jest.Mock).mockResolvedValue(0);

      await getAllCanteens(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(sortMock).toHaveBeenCalledWith({ name: 1 });
    });
  });

  describe('getCanteenById', () => {
    it('should return a canteen by ID', async () => {
      mockReq.params = { id: 'canteen_1' };
      const mockCanteen = { _id: 'canteen_1', name: 'Main Canteen', rating: 4.5 };

      (Canteen.findById as jest.Mock).mockResolvedValue(mockCanteen);

      await getCanteenById(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Canteen.findById).toHaveBeenCalledWith('canteen_1');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockCanteen,
        })
      );
    });

    it('should return 404 when canteen is not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      (Canteen.findById as jest.Mock).mockResolvedValue(null);

      await getCanteenById(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'Canteen not found' })
      );
    });
  });

  describe('getCanteenWithMenu', () => {
    it('should return canteen with its menu items', async () => {
      mockReq.params = { id: 'canteen_1' };
      const mockCanteen = { _id: 'canteen_1', name: 'Main Canteen' };
      const mockMenuItems = [
        { _id: 'm1', name: 'Burger', price: 120 },
        { _id: 'm2', name: 'Fries', price: 60 },
      ];

      (Canteen.findById as jest.Mock).mockResolvedValue(mockCanteen);
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockMenuItems),
      });

      await getCanteenWithMenu(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            canteen: mockCanteen,
            menuItems: mockMenuItems,
          },
        })
      );
    });

    it('should return 404 when canteen is not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      (Canteen.findById as jest.Mock).mockResolvedValue(null);

      await getCanteenWithMenu(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('createCanteen', () => {
    const validBody = {
      name: 'New Canteen',
      bannerImage: 'https://example.com/banner.jpg',
      description: 'A new canteen',
      tags: ['south-indian'],
    };

    it('should create canteen when user is admin', async () => {
      mockReq.user = { _id: 'admin_1', isAdmin: true, isCanteenOwner: false } as any;
      mockReq.body = validBody;
      (Canteen.create as jest.Mock).mockResolvedValue({
        _id: 'new_canteen',
        ...validBody,
        isActive: true,
      });

      await createCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Canteen.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Canteen created successfully',
        })
      );
    });

    it('should create canteen when user is canteen owner', async () => {
      mockReq.user = { _id: 'owner_1', isAdmin: false, isCanteenOwner: true } as any;
      mockReq.body = validBody;
      (Canteen.create as jest.Mock).mockResolvedValue({
        _id: 'new_canteen',
        ...validBody,
        isActive: true,
      });

      await createCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Canteen.create).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: 'owner_1' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return 403 when user is neither admin nor owner', async () => {
      mockReq.user = { _id: 'user_1', isAdmin: false, isCanteenOwner: false } as any;
      mockReq.body = validBody;

      await createCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403, message: 'Only admins and canteen owners can create canteens' })
      );
    });
  });

  describe('updateCanteen', () => {
    it('should update canteen successfully', async () => {
      mockReq.params = { id: 'canteen_1' };
      mockReq.body = { name: 'Updated Canteen' };
      (Canteen.findById as jest.Mock).mockResolvedValue({
        _id: 'canteen_1',
        ownerId: 'user_1',
      });
      (Canteen.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: 'canteen_1',
        name: 'Updated Canteen',
      });

      await updateCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Canteen.findByIdAndUpdate).toHaveBeenCalledWith(
        'canteen_1',
        { name: 'Updated Canteen' },
        expect.objectContaining({ new: true })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Canteen updated successfully' })
      );
    });

    it('should return 403 when non-admin tries to update another owners canteen', async () => {
      mockReq.params = { id: 'canteen_2' };
      mockReq.body = { name: 'Hacked' };
      (Canteen.findById as jest.Mock).mockResolvedValue({
        _id: 'canteen_2',
        ownerId: 'other_owner',
      });

      await updateCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('should return 404 when canteen to update is not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { name: 'Ghost' };
      (Canteen.findById as jest.Mock).mockResolvedValue(null);

      await updateCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'Canteen not found' })
      );
    });
  });

  describe('deleteCanteen', () => {
    it('should soft-delete canteen when user is admin', async () => {
      mockReq.user = { _id: 'admin_1', isAdmin: true } as any;
      mockReq.params = { id: 'canteen_1' };
      (Canteen.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: 'canteen_1',
        name: 'Old Canteen',
      });

      await deleteCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Canteen.findByIdAndUpdate).toHaveBeenCalledWith(
        'canteen_1',
        { isActive: false }
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Canteen deactivated successfully' })
      );
    });

    it('should return 403 when non-admin tries to delete', async () => {
      mockReq.user = { _id: 'user_1', isAdmin: false } as any;
      mockReq.params = { id: 'canteen_1' };

      await deleteCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403, message: 'Only admins can delete canteens' })
      );
    });

    it('should return 404 when canteen to delete is not found', async () => {
      mockReq.user = { _id: 'admin_1', isAdmin: true } as any;
      mockReq.params = { id: 'nonexistent' };
      (Canteen.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await deleteCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats for admin', async () => {
      mockReq.user = { _id: 'admin_1', isAdmin: true, isCanteenOwner: false } as any;
      mockReq.params = { id: 'canteen_1' };

      const mockCanteens = [{ _id: 'canteen_1' }];
      (Canteen.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockCanteens),
      });
      (Order.countDocuments as jest.Mock).mockResolvedValue(50);

      const mockOrderChain = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([{ _id: 'o1', userId: { name: 'User' } }]),
      };
      (Order.find as jest.Mock).mockReturnValue(mockOrderChain);

      await getDashboardStats(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Canteen.find).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'canteen_1' })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            totalCanteens: 1,
            totalOrders: 50,
          }),
        })
      );
    });

    it('should return 403 when user is not admin or owner', async () => {
      mockReq.user = { _id: 'user_1', isAdmin: false, isCanteenOwner: false } as any;

      await getDashboardStats(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403, message: 'Access denied' })
      );
    });
  });
});
