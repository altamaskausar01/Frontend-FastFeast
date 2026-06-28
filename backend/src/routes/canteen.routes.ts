import { Router } from 'express';
import {
  getAllCanteens,
  getCanteenById,
  getCanteenWithMenu,
  createCanteen,
  updateCanteen,
  deleteCanteen,
  getDashboardStats,
} from '../controllers/canteen.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// ─── Public Routes ─────────────────────────────────────
router.get('/', getAllCanteens);
router.get('/:id', getCanteenById);
router.get('/:id/menu', getCanteenWithMenu);

// ─── Protected Routes ──────────────────────────────────
router.post('/', authenticate, createCanteen);
router.patch('/:id', authenticate, updateCanteen);
router.delete('/:id', authenticate, requireAdmin, deleteCanteen);
router.get('/:id/dashboard', authenticate, getDashboardStats);

export default router;
