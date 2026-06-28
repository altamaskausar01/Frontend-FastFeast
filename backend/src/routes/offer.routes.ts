import { Router } from 'express';
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  claimOffer,
  getCoupons,
  validateCoupon,
  createCoupon,
} from '../controllers/offer.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// ─── Offer Routes ──────────────────────────────────────
router.get('/', getOffers);
router.post('/claim/:code', authenticate, claimOffer);
router.post('/', authenticate, requireAdmin, createOffer);
router.patch('/:id', authenticate, requireAdmin, updateOffer);
router.delete('/:id', authenticate, requireAdmin, deleteOffer);

// ─── Coupon Routes ─────────────────────────────────────
router.get('/coupons', getCoupons);
router.post('/coupons', authenticate, requireAdmin, createCoupon);
router.get('/coupons/validate/:code', authenticate, validateCoupon);

export default router;
