import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'canteen_owner';
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function generateTokenWithUser(user: {
  _id: mongoose.Types.ObjectId | string;
  email: string;
  isAdmin: boolean;
  isCanteenOwner: boolean;
}): string {
  const role = user.isAdmin
    ? 'admin'
    : user.isCanteenOwner
    ? 'canteen_owner'
    : 'user';

  return generateToken({
    userId: String(user._id),
    email: user.email,
    role,
  });
}
