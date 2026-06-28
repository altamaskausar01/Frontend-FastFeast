import { ApiError } from '../../utils/ApiError';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create an error with the given status code and message', () => {
      const error = new ApiError(400, 'Bad request');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });

    it('should set isOperational to true by default', () => {
      const error = new ApiError(500, 'Server error');
      expect(error.isOperational).toBe(true);
    });

    it('should allow isOperational to be set to false', () => {
      const error = new ApiError(500, 'Internal error', false);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('static factory methods', () => {
    describe('badRequest', () => {
      it('should create a 400 error', () => {
        const error = ApiError.badRequest('Invalid input');
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Invalid input');
      });
    });

    describe('unauthorized', () => {
      it('should create a 401 error with default message', () => {
        const error = ApiError.unauthorized();
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Unauthorized');
      });

      it('should create a 401 error with custom message', () => {
        const error = ApiError.unauthorized('Invalid token');
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Invalid token');
      });
    });

    describe('forbidden', () => {
      it('should create a 403 error with default message', () => {
        const error = ApiError.forbidden();
        expect(error.statusCode).toBe(403);
        expect(error.message).toBe('Forbidden');
      });
    });

    describe('notFound', () => {
      it('should create a 404 error with default message', () => {
        const error = ApiError.notFound();
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Resource not found');
      });
    });

    describe('conflict', () => {
      it('should create a 409 error', () => {
        const error = ApiError.conflict('Email already exists');
        expect(error.statusCode).toBe(409);
        expect(error.message).toBe('Email already exists');
      });
    });

    describe('tooMany', () => {
      it('should create a 429 error with default message', () => {
        const error = ApiError.tooMany();
        expect(error.statusCode).toBe(429);
        expect(error.message).toBe('Too many requests');
      });
    });

    describe('internal', () => {
      it('should create a 500 error with isOperational false', () => {
        const error = ApiError.internal('Database error');
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Database error');
        expect(error.isOperational).toBe(false);
      });
    });
  });

  describe('prototype chain', () => {
    it('should work with instanceof checks', () => {
      const error = ApiError.notFound();
      expect(error instanceof ApiError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should have a stack trace', () => {
      const error = ApiError.internal('Test');
      expect(error.stack).toBeDefined();
    });
  });
});
