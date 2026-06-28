import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  sendOtp,
  verifyOtp,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ─── Public Routes ─────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);

// ─── Protected Routes ──────────────────────────────────
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);

export default router;
