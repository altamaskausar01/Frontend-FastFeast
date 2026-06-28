import { Router } from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getTrendingItems,
  getFastItems,
  getMenuByCanteen,
} from '../controllers/menu.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ─── Public Routes ─────────────────────────────────────
router.get('/', getMenuItems);
router.get('/trending', getTrendingItems);
router.get('/fast', getFastItems);
router.get('/canteen/:canteenId', getMenuByCanteen);
router.get('/:id', getMenuItemById);

// ─── Protected Routes ──────────────────────────────────
router.post('/', authenticate, createMenuItem);
router.patch('/:id', authenticate, updateMenuItem);
router.delete('/:id', authenticate, deleteMenuItem);

export default router;
