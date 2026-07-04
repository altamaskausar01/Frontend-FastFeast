export interface Canteen {
  id: string;
  name: string;
  rating: number;
  ratingCount: string;
  tags: string[];
  rushLevel: 'low' | 'medium' | 'high';
  avgWaitTime: string;
  bannerImage: string;
  categories: string[];
}

export interface MenuItem {
  id: string;
  canteenId: string;
  category: string;
  name: string;
  description: string;
  price: number;
  prepTime: string;
  image: string;
  isVeg: boolean;
  inStock: boolean;
  isTrending?: boolean;
  isFast?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  customizations?: string[];
  spiceLevel?: 'mild' | 'medium' | 'hot';
}

export interface Order {
  id: string;
  token: string;
  canteenId: string;
  canteenName: string;
  items: CartItem[];
  total: number;
  gst: number;
  platformFee: number;
  discount: number;
  finalTotal: number;
  status: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  estimatedTime: string;
  queuePosition?: number;
}

export interface Offer {
  id: string;
  title: string;
  discount: string;
  description: string;
  validUntil: string;
  code: string;
  gradient: string;
  claimed?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  streakDays: number;
  totalOrders: number;
  totalSaved: number;
}

export interface DashboardOrder {
  id: string;
  token: string;
  items: { name: string; qty: number }[];
  status: 'new' | 'preparing' | 'ready';
  timeAgo: string;
  total: number;
  notes?: string;
  orderType: 'regular' | 'group';
}

export type ScreenName = 
  | 'splash' | 'onboarding' | 'login' | 'home' | 'canteenDetail' | 'cart' 
  | 'payment' | 'orderSuccess' | 'orderTracking' | 'orders' 
  | 'groupOrder' | 'offers' | 'profile' | 'canteenDashboard' | 'admin';

export type TabName = 'home' | 'orders' | 'offers' | 'group' | 'profile';
