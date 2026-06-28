import { Response, NextFunction } from 'express';
import { User } from '../../models';
import {
  register,
  login,
  getMe,
  sendOtp,
  verifyOtp,
  updateProfile,
} from '../../controllers/auth.controller';
import type { AuthRequest } from '../../middleware/auth.middleware';

// Mock all dependencies
jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('../../utils/generateToken', () => ({
  generateTokenWithUser: jest.fn(() => 'mock-jwt-token'),
}));

describe('auth controller', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockReq = {
      body: {},
      headers: {},
      user: undefined,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validBody = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+919876543210',
      password: 'password123',
    };

    it('should register a new user and return 201 with token', async () => {
      mockReq.body = validBody;
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        _id: 'new_user_id',
        name: 'Test User',
        email: 'test@example.com',
        phone: '+919876543210',
        isAdmin: false,
        isCanteenOwner: false,
      });

      await register(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            token: 'mock-jwt-token',
            user: expect.objectContaining({
              name: 'Test User',
              email: 'test@example.com',
            }),
          }),
          message: 'Account created successfully',
        })
      );
    });

    it('should return 409 when email already exists', async () => {
      mockReq.body = validBody;
      (User.findOne as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        phone: '+919876543210',
      });

      await register(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          message: 'Email is already registered',
        })
      );
    });

    it('should return 409 when phone already exists', async () => {
      mockReq.body = validBody;
      (User.findOne as jest.Mock).mockResolvedValue({
        email: 'other@example.com',
        phone: '+919876543210',
      });

      await register(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          message: 'Phone is already registered',
        })
      );
    });
  });

  describe('login', () => {
    const validBody = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully and return token', async () => {
      mockReq.body = validBody;
      const mockUser = {
        _id: 'user_id',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
        isCanteenOwner: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await login(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
        })
      );
    });

    it('should return 401 for invalid email', async () => {
      mockReq.body = validBody;
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await login(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid email or password',
        })
      );
    });

    it('should return 401 for wrong password', async () => {
      mockReq.body = validBody;
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await login(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  describe('sendOtp', () => {
    it('should send OTP and return success', async () => {
      mockReq.body = { phone: '+919876543210' };

      await sendOtp(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            otpSent: true,
            expiresIn: 300,
          }),
        })
      );
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and login existing user', async () => {
      mockReq.body = { phone: '+919876543210', otp: '123456' };
      const mockUser = {
        _id: 'user_id',
        name: 'Existing User',
        email: 'existing@fastfeast.app',
        phone: '+919876543210',
        isAdmin: false,
        isCanteenOwner: false,
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await verifyOtp(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            token: 'mock-jwt-token',
            user: mockUser,
          }),
        })
      );
    });

    it('should create a new user if not found', async () => {
      mockReq.body = { phone: '+919876543210', otp: '123456', name: 'New User' };
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        _id: 'new_user',
        name: 'New User',
        email: 'new.user@fastfeast.app',
        phone: '+919876543210',
      });

      await verifyOtp(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(User.create).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it('should return 400 for invalid OTP', async () => {
      mockReq.body = { phone: '+919876543210', otp: '000000' };

      await verifyOtp(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Invalid OTP',
        })
      );
    });

    it('should return 400 when name is not provided for new user', async () => {
      mockReq.body = { phone: '+919876543210', otp: '123456' };
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await verifyOtp(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Name is required for new users',
        })
      );
    });
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      mockReq.user = { _id: 'user_1', name: 'Test User' } as any;
      (User.findById as jest.Mock).mockResolvedValue({
        _id: 'user_1',
        name: 'Test User',
        email: 'test@example.com',
      });

      await getMe(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(User.findById).toHaveBeenCalledWith('user_1');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({ name: 'Test User' }),
          }),
        })
      );
    });

    it('should return 404 when user is not found', async () => {
      mockReq.user = { _id: 'nonexistent' } as any;
      (User.findById as jest.Mock).mockResolvedValue(null);

      await getMe(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'User not found' })
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      mockReq.user = { _id: 'user_1' } as any;
      mockReq.body = { name: 'Updated Name' };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: 'user_1',
        name: 'Updated Name',
        email: 'test@example.com',
      });

      await updateProfile(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user_1',
        { name: 'Updated Name' },
        expect.objectContaining({ new: true })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Profile updated',
        })
      );
    });

    it('should return 400 for invalid phone format', async () => {
      mockReq.user = { _id: 'user_1' } as any;
      mockReq.body = { phone: 'invalid-phone' };

      await updateProfile(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const errorArg = (mockNext as jest.Mock).mock.calls[0][0];
      expect(errorArg.name).toBe('ZodError');
    });
  });
});
