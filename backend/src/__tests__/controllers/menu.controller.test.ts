import { Response, NextFunction } from 'express';
import { MenuItem } from '../../models';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getTrendingItems,
  getFastItems,
  getMenuByCanteen,
} from '../../controllers/menu.controller';
import type { AuthRequest } from '../../middleware/auth.middleware';

jest.mock('../../models', () => ({
  MenuItem: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

describe('menu controller', () => {
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

  const sampleMenuItem = {
    _id: 'menu_1',
    canteenId: 'canteen_1',
    category: 'Burgers',
    name: 'Cheese Burger',
    description: 'Juicy beef patty with melted cheese',
    price: 120,
    prepTime: '10 min',
    image: 'https://example.com/burger.jpg',
    isVeg: false,
    inStock: true,
    isTrending: true,
    isFast: false,
    sortOrder: 1,
  };

  describe('getMenuItems', () => {
    it('should return paginated menu items', async () => {
      const mockItems = [sampleMenuItem];
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockItems),
      });
      (MenuItem.countDocuments as jest.Mock).mockResolvedValue(1);

      await getMenuItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockItems,
          meta: expect.objectContaining({ page: 1, limit: 20, total: 1 }),
        })
      );
    });

    it('should filter by canteenId when query param is provided', async () => {
      mockReq.query = { canteenId: 'canteen_1' };
      const sortMock = jest.fn().mockReturnThis();
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: sortMock,
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (MenuItem.countDocuments as jest.Mock).mockResolvedValue(0);

      await getMenuItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.find).toHaveBeenCalledWith(
        expect.objectContaining({ canteenId: 'canteen_1' })
      );
    });

    it('should filter by isVeg when query param is provided', async () => {
      mockReq.query = { isVeg: 'true' };
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (MenuItem.countDocuments as jest.Mock).mockResolvedValue(0);

      await getMenuItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.find).toHaveBeenCalledWith(
        expect.objectContaining({ isVeg: true })
      );
    });

    it('should apply text search when search param is provided', async () => {
      mockReq.query = { search: 'burger' };
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (MenuItem.countDocuments as jest.Mock).mockResolvedValue(0);

      await getMenuItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.find).toHaveBeenCalledWith(
        expect.objectContaining({ $text: { $search: 'burger' } })
      );
    });

    it('should filter by category when query param is provided', async () => {
      mockReq.query = { category: 'Burgers' };
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (MenuItem.countDocuments as jest.Mock).mockResolvedValue(0);

      await getMenuItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Burgers' })
      );
    });

    it('should filter by isTrending when query param is provided', async () => {
      mockReq.query = { isTrending: 'true' };
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (MenuItem.countDocuments as jest.Mock).mockResolvedValue(0);

      await getMenuItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.find).toHaveBeenCalledWith(
        expect.objectContaining({ isTrending: true })
      );
    });

    it('should filter by isFast when query param is provided', async () => {
      mockReq.query = { isFast: 'true' };
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (MenuItem.countDocuments as jest.Mock).mockResolvedValue(0);

      await getMenuItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.find).toHaveBeenCalledWith(
        expect.objectContaining({ isFast: true })
      );
    });

    it('should filter by inStock when query param is provided', async () => {
      mockReq.query = { inStock: 'true' };
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (MenuItem.countDocuments as jest.Mock).mockResolvedValue(0);

      await getMenuItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.find).toHaveBeenCalledWith(
        expect.objectContaining({ inStock: true })
      );
    });

    it('should return empty array when no items match', async () => {
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      (MenuItem.countDocuments as jest.Mock).mockResolvedValue(0);

      await getMenuItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [],
          meta: expect.objectContaining({ total: 0 }),
        })
      );
    });
  });

  describe('getMenuItemById', () => {
    it('should return a menu item by ID', async () => {
      mockReq.params = { id: 'menu_1' };
      (MenuItem.findById as jest.Mock).mockResolvedValue(sampleMenuItem);

      await getMenuItemById(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.findById).toHaveBeenCalledWith('menu_1');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: sampleMenuItem })
      );
    });

    it('should return 404 when item is not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      (MenuItem.findById as jest.Mock).mockResolvedValue(null);

      await getMenuItemById(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'Menu item not found' })
      );
    });
  });

  describe('createMenuItem', () => {
    const validBody = {
      canteenId: 'canteen_1',
      category: 'Burgers',
      name: 'Cheese Burger',
      description: 'Juicy beef patty with melted cheese',
      price: 120,
      prepTime: '10 min',
      image: 'https://example.com/burger.jpg',
      isVeg: false,
    };

    it('should create a menu item and return 201', async () => {
      mockReq.body = validBody;
      (MenuItem.create as jest.Mock).mockResolvedValue({
        _id: 'new_menu',
        ...validBody,
        inStock: true,
        isTrending: false,
        isFast: false,
        sortOrder: 0,
      });

      await createMenuItem(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.create).toHaveBeenCalledWith(validBody);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Menu item created successfully',
        })
      );
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.body = { name: 'Incomplete Item' };

      await createMenuItem(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const errorArg = (mockNext as jest.Mock).mock.calls[0][0];
      expect(errorArg.name).toBe('ZodError');
    });
  });

  describe('updateMenuItem', () => {
    it('should update a menu item successfully', async () => {
      mockReq.params = { id: 'menu_1' };
      mockReq.body = { price: 150, inStock: false };
      (MenuItem.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...sampleMenuItem,
        price: 150,
        inStock: false,
      });

      await updateMenuItem(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.findByIdAndUpdate).toHaveBeenCalledWith(
        'menu_1',
        { price: 150, inStock: false },
        expect.objectContaining({ new: true })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Menu item updated successfully',
        })
      );
    });

    it('should return 404 when item to update is not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { price: 150 };
      (MenuItem.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await updateMenuItem(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('deleteMenuItem', () => {
    it('should delete a menu item successfully', async () => {
      mockReq.params = { id: 'menu_1' };
      (MenuItem.findByIdAndDelete as jest.Mock).mockResolvedValue(sampleMenuItem);

      await deleteMenuItem(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.findByIdAndDelete).toHaveBeenCalledWith('menu_1');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Menu item deleted successfully',
        })
      );
    });

    it('should return 404 when item to delete is not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      (MenuItem.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await deleteMenuItem(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('getTrendingItems', () => {
    it('should return trending items with populated canteen', async () => {
      const mockItems = [{ ...sampleMenuItem, canteenId: { _id: 'c_1', name: 'Test Canteen', rating: 4.5 } }];
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockItems),
      });

      await getTrendingItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.find).toHaveBeenCalledWith(
        { isTrending: true, inStock: true }
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockItems })
      );
    });

    it('should apply limit from query param', async () => {
      mockReq.query = { limit: '5' };
      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: sortMock,
        limit: limitMock,
        populate: jest.fn().mockResolvedValue([]),
      });

      await getTrendingItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(limitMock).toHaveBeenCalledWith(5);
    });

    it('should cap limit at 20', async () => {
      mockReq.query = { limit: '100' };
      const limitMock = jest.fn().mockReturnThis();
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: limitMock,
        populate: jest.fn().mockResolvedValue([]),
      });

      await getTrendingItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(limitMock).toHaveBeenCalledWith(20);
    });
  });

  describe('getFastItems', () => {
    it('should return fast items with populated canteen', async () => {
      const mockItems = [sampleMenuItem];
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockItems),
      });

      await getFastItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.find).toHaveBeenCalledWith(
        { isFast: true, inStock: true }
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockItems })
      );
    });

    it('should return empty array when no fast items', async () => {
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
      });

      await getFastItems(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: [] })
      );
    });
  });

  describe('getMenuByCanteen', () => {
    it('should return items grouped by category', async () => {
      mockReq.params = { canteenId: 'canteen_1' };
      const burgerItem = { ...sampleMenuItem, category: 'Burgers', _id: 'm1' };
      const friesItem = { ...sampleMenuItem, category: 'Sides', name: 'Fries', price: 60, _id: 'm2' };
      const mockItems = [burgerItem, friesItem];

      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockItems),
      });

      await getMenuByCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(MenuItem.find).toHaveBeenCalledWith({ canteenId: 'canteen_1' });
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            items: mockItems,
            grouped: {
              Burgers: [burgerItem],
              Sides: [friesItem],
            },
          },
        })
      );
    });

    it('should return empty grouped items when canteen has no menu', async () => {
      mockReq.params = { canteenId: 'empty_canteen' };
      (MenuItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await getMenuByCanteen(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { items: [], grouped: {} },
        })
      );
    });
  });
});
