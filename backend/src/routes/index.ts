import { Router } from 'express';
import authRoutes from './auth.routes';
import canteenRoutes from './canteen.routes';
import menuRoutes from './menu.routes';
import orderRoutes from './order.routes';
import offerRoutes from './offer.routes';
import userRoutes from './user.routes';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

// ─── Health Check ──────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json(
    ApiResponse.success(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      'FastFeast API is running'
    )
  );
});

// ─── API Routes ────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/canteens', canteenRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/offers', offerRoutes);
router.use('/users', userRoutes);

export default router;
