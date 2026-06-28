export const ORDER_STATUS = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const RUSH_LEVELS = ['low', 'medium', 'high'] as const;
export type RushLevel = (typeof RUSH_LEVELS)[number];

export const SPICE_LEVELS = ['mild', 'medium', 'hot'] as const;
export type SpiceLevel = (typeof SPICE_LEVELS)[number];

export const PAYMENT_METHODS = ['UPI', 'Wallet', 'Counter'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PLATFORM_FEE = 5;
export const GST_RATE = 0.05;
export const DISCOUNT_THRESHOLD = 200;
export const DISCOUNT_AMOUNT = 20;

export const ORDER_TOKEN_PREFIX = 'A-';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
