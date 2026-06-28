import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import type { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  userId: string;
}

export const authenticate = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw ApiError.unauthorized('User not found. Token may be invalid.');
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized('Invalid or expired token.');
    }
  }
);

export const optionalAuth = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
        }
      } catch {
        // Silently ignore invalid tokens for optional auth
      }
    }

    next();
  }
);

export const requireAdmin = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user?.isAdmin) {
      next(ApiError.forbidden('Admin access required.'));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const requireCanteenOwner = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user?.isCanteenOwner && !req.user?.isAdmin) {
      next(ApiError.forbidden('Canteen owner access required.'));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};
