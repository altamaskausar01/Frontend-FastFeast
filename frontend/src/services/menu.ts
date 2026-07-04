import { get, post, patch, del } from './api';
import type { MenuItem } from '@/types';

export interface MenuItemDTO extends Omit<MenuItem, 'id' | 'canteenId'> {
  _id: string;
  /** Can be a plain string ID or a populated canteen object from Mongoose */
  canteenId: string | { _id: string; id?: string; name?: string };
  sortOrder?: number;
  customizationOptions?: {
    name: string;
    type: 'single' | 'multi';
    options: { label: string; price: number }[];
  }[];
}

/** Safely extract a string ID from a value that could be a string or populated object */
export function extractStringId(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    return (value as { _id?: string; id?: string })._id
      || (value as { _id?: string; id?: string }).id
      || '';
  }
  return String(value ?? '');
}

export function normalizeMenuItem(dto: MenuItemDTO): MenuItem {
  return {
    id: dto._id,
    canteenId: extractStringId(dto.canteenId),
    category: dto.category,
    name: dto.name,
    description: dto.description,
    price: dto.price,
    prepTime: dto.prepTime,
    image: dto.image,
    isVeg: dto.isVeg,
    inStock: dto.inStock,
    isTrending: dto.isTrending,
    isFast: dto.isFast,
  };
}

export function getMenuItems(params?: Record<string, string>) {
  return get<MenuItemDTO[]>('/menu', { params });
}

export function getMenuItemById(id: string) {
  return get<MenuItemDTO>(`/menu/${id}`);
}

export function getTrendingItems(limit = 10) {
  return get<MenuItemDTO[]>('/menu/trending', { params: { limit: String(limit) } });
}

export function getFastItems(limit = 10) {
  return get<MenuItemDTO[]>('/menu/fast', { params: { limit: String(limit) } });
}

export function getMenuByCanteen(canteenId: string) {
  return get<{ items: MenuItemDTO[]; grouped: Record<string, MenuItemDTO[]> }>(
    `/menu/canteen/${canteenId}`
  );
}

export function createMenuItem(data: Partial<MenuItemDTO>) {
  return post<MenuItemDTO>('/menu', data);
}

export function updateMenuItem(id: string, data: Partial<MenuItemDTO>) {
  return patch<MenuItemDTO>(`/menu/${id}`, data);
}

export function deleteMenuItem(id: string) {
  return del<null>(`/menu/${id}`);
}
