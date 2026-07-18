import { get, post, patch, del } from './api';
import type { Canteen } from '@/types';

// The backend returns _id as the identifier, but our frontend uses `id`.
// This helper normalizes MongoDB documents to frontend types.
export interface CanteenDTO extends Omit<Canteen, 'id'> {
  _id: string;
  description?: string;
  isActive?: boolean;
  logoImage?: string;
  contactPhone?: string;
  address?: string;
  openingHours?: string;
}

export function normalizeCanteen(dto: CanteenDTO): Canteen {
  return {
    id: dto._id,
    name: dto.name,
    rating: dto.rating,
    ratingCount: String(dto.ratingCount || 0),
    tags: dto.tags || [],
    rushLevel: dto.rushLevel || 'low',
    avgWaitTime: dto.avgWaitTime || '5 min',
    bannerImage: dto.bannerImage,
    categories: dto.categories || ['All'],
  };
}

export interface CanteenWithMenu {
  canteen: CanteenDTO;
  menuItems: import('./menu').MenuItemDTO[];
}

export function getAllCanteens(params?: Record<string, string>) {
  return get<CanteenDTO[]>('/canteens', { params });
}

export function getCanteenById(id: string) {
  return get<CanteenDTO>(`/canteens/${id}`);
}

export function getCanteenWithMenu(id: string) {
  return get<CanteenWithMenu>(`/canteens/${id}/menu`);
}

export function createCanteen(data: Partial<CanteenDTO>) {
  return post<CanteenDTO>('/canteens', data);
}

export function updateCanteen(id: string, data: Partial<CanteenDTO>) {
  return patch<CanteenDTO>(`/canteens/${id}`, data);
}

export function deleteCanteen(id: string) {
  return del<null>(`/canteens/${id}`);
}
