import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { errorHandler } from '../../middleware/error.middleware';
import { ApiError } from '../../utils/ApiError';

describe('errorHandler middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('ApiError handling', () => {
    it('should respond with the correct status code and message', () => {
      const error = ApiError.notFound('Canteen not found');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Canteen not found',
      });
    });

    it('should handle bad request errors', () => {
      const error = ApiError.badRequest('Invalid email');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email',
      });
    });

    it('should handle internal server errors as non-operational', () => {
      const error = ApiError.internal('Database failure');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database failure',
      });
    });
  });

  describe('Mongoose ValidationError handling', () => {
    it('should return validation error messages', () => {
      const error = new mongoose.Error.ValidationError();
      error.errors = {
        name: new mongoose.Error.ValidatorError({
          message: 'Name is required',
          path: 'name',
          type: 'required',
          value: undefined,
        }),
        email: new mongoose.Error.ValidatorError({
          message: 'Email must be valid',
          path: 'email',
          type: 'format',
          value: 'invalid',
        }),
      };

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation error',
        errors: expect.arrayContaining(['Name is required', 'Email must be valid']),
      });
    });
  });

  describe('Mongoose CastError handling', () => {
    it('should return a bad request with invalid field info', () => {
      const error = new mongoose.Error.CastError('ObjectId', 'invalid123', '_id');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid _id: invalid123',
      });
    });
  });

  describe('Duplicate key error handling', () => {
    it('should handle MongoDB duplicate key errors', () => {
      const error = new Error('Duplicate key');
      (error as any).code = 11000;
      (error as any).keyValue = { email: 'test@test.com' };

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Duplicate value for email. This email is already in use.',
      });
    });
  });

  describe('Generic error handling', () => {
    it('should return a 500 for unknown errors', () => {
      const error = new Error('Something unexpected happened');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });
});
