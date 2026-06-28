import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  addWalletBalance,
  getUserOrders,
  getAllUsers,
  getAdminStats,
} from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// ─── Protected User Routes ─────────────────────────────
router.get('/profile', authenticate, getUserProfile);
router.patch('/profile', authenticate, updateUserProfile);
router.post('/wallet', authenticate, addWalletBalance);
router.get('/orders', authenticate, getUserOrders);

// ─── Admin Routes ──────────────────────────────────────
router.get('/admin/users', authenticate, requireAdmin, getAllUsers);
router.get('/admin/stats', authenticate, requireAdmin, getAdminStats);

export default router;
