import {
  ORDER_STATUS,
  RUSH_LEVELS,
  SPICE_LEVELS,
  PAYMENT_METHODS,
  PLATFORM_FEE,
  GST_RATE,
  DISCOUNT_THRESHOLD,
  DISCOUNT_AMOUNT,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from '../../utils/constants';

describe('constants', () => {
  describe('ORDER_STATUS', () => {
    it('should have all order statuses', () => {
      expect(ORDER_STATUS.RECEIVED).toBe('received');
      expect(ORDER_STATUS.PREPARING).toBe('preparing');
      expect(ORDER_STATUS.READY).toBe('ready');
      expect(ORDER_STATUS.COMPLETED).toBe('completed');
      expect(ORDER_STATUS.CANCELLED).toBe('cancelled');
    });
  });

  describe('RUSH_LEVELS', () => {
    it('should have all rush levels', () => {
      expect(RUSH_LEVELS).toEqual(['low', 'medium', 'high']);
    });
  });

  describe('SPICE_LEVELS', () => {
    it('should have all spice levels', () => {
      expect(SPICE_LEVELS).toEqual(['mild', 'medium', 'hot']);
    });
  });

  describe('PAYMENT_METHODS', () => {
    it('should have all payment methods', () => {
      expect(PAYMENT_METHODS).toEqual(['UPI', 'Wallet', 'Counter']);
    });
  });

  describe('pricing constants', () => {
    it('should have a platform fee of ₹5', () => {
      expect(PLATFORM_FEE).toBe(5);
    });

    it('should have a GST rate of 5%', () => {
      expect(GST_RATE).toBe(0.05);
    });

    it('should have a discount threshold of ₹200', () => {
      expect(DISCOUNT_THRESHOLD).toBe(200);
    });

    it('should have a discount amount of ₹20', () => {
      expect(DISCOUNT_AMOUNT).toBe(20);
    });
  });

  describe('pagination constants', () => {
    it('should have a default page of 1', () => {
      expect(DEFAULT_PAGE).toBe(1);
    });

    it('should have a default limit of 20', () => {
      expect(DEFAULT_LIMIT).toBe(20);
    });

    it('should have a max limit of 100', () => {
      expect(MAX_LIMIT).toBe(100);
    });
  });
});
