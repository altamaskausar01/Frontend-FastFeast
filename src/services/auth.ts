import { get, post, patch } from './api';
import type { UserProfile } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  name?: string;
}

export interface AuthResponse {
  user: UserProfile & { _id: string; isAdmin: boolean; isCanteenOwner: boolean };
  token: string;
}

export interface OtpResponse {
  otpSent: boolean;
  expiresIn: number;
}

// ─── API Calls ─────────────────────────────────────────

export function register(data: RegisterRequest) {
  return post<AuthResponse>('/auth/register', data);
}

export function login(data: LoginRequest) {
  return post<AuthResponse>('/auth/login', data);
}

export function sendOtp(data: SendOtpRequest) {
  return post<OtpResponse>('/auth/otp/send', data);
}

export function verifyOtp(data: VerifyOtpRequest) {
  return post<AuthResponse>('/auth/otp/verify', data);
}

export function getMe() {
  return get<{ user: AuthResponse['user'] }>('/auth/me');
}

export function updateProfile(data: Partial<{ name: string; phone: string }>) {
  return patch<{ user: AuthResponse['user'] }>('/auth/profile', data);
}
