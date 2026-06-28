import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../models';
import { authenticate, optionalAuth, requireAdmin, requireCanteenOwner } from '../../middleware/auth.middleware';
import type { AuthRequest } from '../../middleware/auth.middleware';
import { ApiError } from '../../utils/ApiError';

// Mock the User model
jest.mock('../../models', () => ({
  User: {
    findById: jest.fn(),
  },
}));

describe('auth middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockReq = {
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

  describe('authenticate', () => {
    it('should call next with unauthorized error when no token is provided', async () => {
      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Access denied. No token provided.',
        })
      );
    });

    it('should call next with unauthorized for invalid token format', async () => {
      mockReq.headers = { authorization: 'InvalidFormat token123' };

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Access denied. No token provided.',
        })
      );
    });

    it('should return unauthorized when token is invalid/expired', async () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid or expired token.',
        })
      );
    });

    it('should return unauthorized when user is not found', async () => {
      const token = jwt.sign(
        { userId: 'nonexistent-id' },
        process.env.JWT_SECRET || 'test-jwt-secret'
      );
      mockReq.headers = { authorization: `Bearer ${token}` };
      (User.findById as jest.Mock).mockResolvedValue(null);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'User not found. Token may be invalid.',
        })
      );
    });

    it('should set req.user and call next on success', async () => {
      const mockUser = { _id: 'user123', name: 'Test User', email: 'test@test.com' };
      const token = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET || 'test-jwt-secret'
      );
      mockReq.headers = { authorization: `Bearer ${token}` };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('optionalAuth', () => {
    it('should continue without error when no token is provided', async () => {
      await optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should silently ignore invalid tokens', async () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      await optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should set req.user when valid token is provided', async () => {
      const mockUser = { _id: 'user123', name: 'Test User' };
      const token = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET || 'test-jwt-secret'
      );
      mockReq.headers = { authorization: `Bearer ${token}` };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireAdmin', () => {
    it('should call next with forbidden when user is not admin', () => {
      mockReq.user = { isAdmin: false } as any;

      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Admin access required.',
        })
      );
    });

    it('should call next with forbidden when user is undefined', () => {
      mockReq.user = undefined;

      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('should call next without error when user is admin', () => {
      mockReq.user = { isAdmin: true } as any;

      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireCanteenOwner', () => {
    it('should call next with forbidden when user is neither owner nor admin', () => {
      mockReq.user = { isAdmin: false, isCanteenOwner: false } as any;

      requireCanteenOwner(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Canteen owner access required.',
        })
      );
    });

    it('should allow canteen owners through', () => {
      mockReq.user = { isAdmin: false, isCanteenOwner: true } as any;

      requireCanteenOwner(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow admins through', () => {
      mockReq.user = { isAdmin: true, isCanteenOwner: false } as any;

      requireCanteenOwner(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
