import { Response } from 'express';
import { z } from 'zod';
import { User } from '../models';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { generateTokenWithUser } from '../utils/generateToken';
import type { AuthRequest } from '../middleware/auth.middleware';

// ─── Validation Schemas ─────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string().email('Please provide a valid email').trim().toLowerCase(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Please provide a valid phone number'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Please provide a valid phone number'),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Please provide a valid phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim()
    .optional(),
});

// ─── Controllers ────────────────────────────────────────

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, phone, password } = registerSchema.parse(req.body);

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Phone';
    throw ApiError.conflict(`${field} is already registered`);
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
  });

  const token = generateTokenWithUser(user);

  res.status(201).json(
    ApiResponse.success(
      {
        user,
        token,
      },
      'Account created successfully'
    )
  );
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateTokenWithUser(user);

  res.json(
    ApiResponse.success({ user, token }, 'Login successful')
  );
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json(ApiResponse.success({ user }));
});

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const schema = z.object({
      name: z.string().min(2).max(50).trim().optional(),
      phone: z
        .string()
        .regex(/^\+?[1-9]\d{9,14}$/)
        .optional(),
    });

    const updates = schema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.user!._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json(ApiResponse.success({ user }, 'Profile updated'));
  }
);

export const sendOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { phone } = sendOtpSchema.parse(req.body);

  // In production, integrate with an SMS provider (Twilio, etc.)
  const mockOtp = '123456';
  console.log(`[DEV] OTP for ${phone}: ${mockOtp}`);

  res.json(
    ApiResponse.success(
      { otpSent: true, expiresIn: 300 },
      'OTP sent successfully'
    )
  );
});

export const verifyOtp = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { phone, otp, name } = verifyOtpSchema.parse(req.body);

    // In production, verify OTP with your SMS provider
    if (otp !== '123456') {
      throw ApiError.badRequest('Invalid OTP');
    }

    let user = await User.findOne({ phone });

    if (!user) {
      if (!name) {
        throw ApiError.badRequest('Name is required for new users');
      }

      const email = `${name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/(^\.|\.$)/g, '')}@fastfeast.app`;

      user = await User.create({
        name,
        phone,
        email,
        password: `temp-${Date.now()}`,
      });
    }

    const token = generateTokenWithUser(user);

    res.json(ApiResponse.success({ user, token }, 'OTP verified successfully'));
  }
);
