import { get, post } from './api';
import type { Offer } from '@/types';

export interface OfferDTO {
  _id: string;
  title: string;
  discount: string;
  description: string;
  validUntil: string;
  code: string;
  gradient: string;
  claimed: number;
  maxClaims?: number;
  isActive: boolean;
}

export function normalizeOffer(dto: OfferDTO): Offer {
  return {
    id: dto._id,
    title: dto.title,
    discount: dto.discount,
    description: dto.description,
    validUntil: dto.validUntil,
    code: dto.code,
    gradient: dto.gradient,
    claimed: dto.claimed > 0,
  };
}

export function getOffers() {
  return get<OfferDTO[]>('/offers');
}

export function claimOffer(code: string) {
  return post<{ offer: OfferDTO; discount: string }>(`/offers/claim/${code}`);
}

export interface CouponDTO {
  _id: string;
  code: string;
  discount: string;
  description: string;
  minOrder: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export function getCoupons() {
  return get<CouponDTO[]>('/offers/coupons');
}

export function validateCoupon(code: string, orderValue?: number) {
  return get<{ coupon: CouponDTO; discountAmount: number }>(
    `/offers/coupons/validate/${code}`,
    { params: orderValue ? { orderValue: String(orderValue) } : undefined }
  );
}
