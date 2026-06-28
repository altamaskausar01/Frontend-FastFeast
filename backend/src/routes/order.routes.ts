import { Router } from 'express';
import {
  placeOrder,
  getOrders,
  getOrderById,
  getOrdersByCanteen,
  updateOrderStatus,
  getActiveOrders,
  cancelOrder,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ─── All routes require authentication ─────────────────
router.use(authenticate);

router.post('/', placeOrder);
router.get('/', getOrders);
router.get('/active', getActiveOrders);
router.get('/canteen/:canteenId', getOrdersByCanteen);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);

export default router;
