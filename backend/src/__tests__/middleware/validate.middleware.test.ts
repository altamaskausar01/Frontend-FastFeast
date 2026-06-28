import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateBody, validateQuery, validateParams } from '../../middleware/validate.middleware';

describe('validate middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('validate', () => {
    it('should pass valid body through', () => {
      const schema = z.object({
        name: z.string().min(2),
        age: z.number().min(0),
      });

      mockReq.body = { name: 'John', age: 25 };

      validate({ body: schema })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.body).toEqual({ name: 'John', age: 25 });
    });

    it('should strip unknown fields from body', () => {
      const schema = z.object({
        name: z.string(),
      });

      mockReq.body = { name: 'John', extraField: 'should be removed' };

      validate({ body: schema })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body).toEqual({ name: 'John' });
    });

    it('should reject invalid body with 400 error', () => {
      const schema = z.object({
        email: z.string().email(),
      });

      mockReq.body = { email: 'not-an-email' };

      validate({ body: schema })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const errorArg = (mockNext as jest.Mock).mock.calls[0][0];
      expect(errorArg.statusCode).toBe(400);
      expect(errorArg.message).toContain('email');
    });

    it('should validate query parameters', () => {
      const schema = z.object({
        page: z.coerce.number().int().positive(),
        limit: z.coerce.number().int().max(100),
      });

      mockReq.query = { page: '1', limit: '20' };

      validate({ query: schema })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate params', () => {
      const schema = z.object({
        id: z.string().length(24),
      });

      mockReq.params = { id: '507f1f77bcf86cd799439011' };

      validate({ params: schema })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should skip validation when no schema is provided', () => {
      validate({})(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateBody', () => {
    it('should be a convenience wrapper for body validation', () => {
      const schema = z.object({ key: z.string() });
      const middleware = validateBody(schema);

      mockReq.body = { key: 'value' };
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateQuery', () => {
    it('should be a convenience wrapper for query validation', () => {
      const schema = z.object({ search: z.string().optional() });
      const middleware = validateQuery(schema);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateParams', () => {
    it('should be a convenience wrapper for params validation', () => {
      const schema = z.object({ id: z.string() });
      const middleware = validateParams(schema);

      mockReq.params = { id: 'test123' };
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
