import { get, post, patch } from './api';
import type { Order, CartItem } from '@/types';

export interface PlaceOrderRequest {
  canteenId: string;
  items: {
    menuItemId: string;
    quantity: number;
    spiceLevel?: string;
    specialNotes?: string;
  }[];
  paymentMethod: string;
  notes?: string;
}

export interface OrderDTO {
  _id: string;
  token: string;
  userId: string;
  canteenId: string;
  canteenName: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    spiceLevel?: string;
    specialNotes?: string;
  }[];
  subtotal: number;
  gst: number;
  platformFee: number;
  discount: number;
  finalTotal: number;
  status: Order['status'];
  paymentMethod: string;
  estimatedTime: string;
  queuePosition?: number;
  notes?: string;
  isGroupOrder: boolean;
  createdAt: string;
}

export function normalizeOrder(dto: OrderDTO): Order {
  return {
    id: dto._id,
    token: dto.token,
    canteenId: dto.canteenId,
    canteenName: dto.canteenName,
    items: dto.items.map((item) => ({
      id: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || '',
      description: item.specialNotes || '',
      canteenId: dto.canteenId,
      category: '',
      prepTime: '',
      isVeg: true,
      inStock: true,
    })) as CartItem[],
    total: dto.subtotal,
    gst: dto.gst,
    platformFee: dto.platformFee,
    discount: dto.discount,
    finalTotal: dto.finalTotal,
    status: dto.status,
    paymentMethod: dto.paymentMethod,
    createdAt: dto.createdAt,
    estimatedTime: dto.estimatedTime,
    queuePosition: dto.queuePosition,
  };
}

export function placeOrder(data: PlaceOrderRequest) {
  return post<OrderDTO>('/orders', data);
}

export function getOrders(params?: Record<string, string>) {
  return get<OrderDTO[]>('/orders', { params });
}

export function getActiveOrders() {
  return get<OrderDTO[]>('/orders/active');
}

export function getOrderById(id: string) {
  return get<OrderDTO>(`/orders/${id}`);
}

export function updateOrderStatus(id: string, status: string) {
  return patch<OrderDTO>(`/orders/${id}/status`, { status });
}

export function cancelOrder(id: string) {
  return patch<OrderDTO>(`/orders/${id}/cancel`);
}
