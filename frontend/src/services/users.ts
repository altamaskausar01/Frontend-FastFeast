import { get, post, patch } from './api';
import type { UserProfile } from '@/types';

export interface UserDTO extends UserProfile {
  _id: string;
  isAdmin: boolean;
  isCanteenOwner: boolean;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  totalSaved: number;
}

export interface ProfileResponse {
  user: UserDTO;
  stats: UserStats;
}

export interface AdminStats {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalCanteens: number;
    totalRevenue: number;
  };
  recentOrders: import('./orders').OrderDTO[];
}

export function getUserProfile() {
  return get<ProfileResponse>('/users/profile');
}

export function updateUserProfile(data: Partial<{ name: string; email: string; phone: string }>) {
  return patch<{ user: UserDTO }>('/users/profile', data);
}

export function addWalletBalance(amount: number) {
  return post<{ walletBalance: number }>('/users/wallet', { amount });
}

export function getUserOrders(params?: Record<string, string>) {
  return get<import('./orders').OrderDTO[]>('/users/orders', { params });
}

export function getAllUsers(params?: Record<string, string>) {
  return get<UserDTO[]>('/users/admin/users', { params });
}

export function getAdminStats() {
  return get<AdminStats>('/users/admin/stats');
}
