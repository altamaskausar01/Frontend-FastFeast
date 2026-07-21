import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ScreenName, TabName, CartItem, Order, MenuItem } from '@/types';
import { userProfile } from '@/data/mockData';
import { getStoredToken, removeToken, storeToken } from '@/services/api';

interface AppState {
  screen: ScreenName;
  prevScreen: ScreenName | null;
  activeTab: TabName;
  selectedCanteenId: string | null;
  cart: CartItem[];
  orders: Order[];
  activeOrderId: string | null;
  tokenNumber: string;
  isOnboarded: boolean;
  isLoggedIn: boolean;
  token: string | null;
  toast: { message: string; type: 'success' | 'warning' | 'error' } | null;
  user: typeof userProfile;
  navDirection: 'push' | 'pop' | 'modal';
}

type Action =
  | { type: 'NAVIGATE'; screen: ScreenName; direction?: 'push' | 'pop' | 'modal' }
  | { type: 'SET_TAB'; tab: TabName }
  | { type: 'SELECT_CANTEEN'; id: string }
  | { type: 'ADD_TO_CART'; item: CartItem }
  | { type: 'REMOVE_FROM_CART'; itemId: string }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ACTIVE_ORDER'; orderId: string; token: string }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'SET_TOKEN'; token: string | null }
  | { type: 'LOGIN'; name: string; phone: string; email: string }
  | { type: 'LOGOUT' }
  | { type: 'SHOW_TOAST'; message: string; toastType: 'success' | 'warning' | 'error' }
  | { type: 'HIDE_TOAST' }
  | { type: 'REORDER'; order: Order }
  | { type: 'SET_ORDER_STATUS'; orderId: string; status: Order['status'] }
  | { type: 'UPDATE_WALLET'; amount: number }
  | { type: 'ADD_ORDER'; order: Order }
  | { type: 'SET_ORDERS'; orders: Order[] }
  | { type: 'SET_USER'; user: typeof userProfile };

const storedToken = getStoredToken();

const initialState: AppState = {
  screen: 'splash',
  prevScreen: null,
  activeTab: 'home',
  selectedCanteenId: null,
  cart: [],
  orders: [],
  activeOrderId: null,
  tokenNumber: '',
  isOnboarded: false,
  isLoggedIn: !!storedToken,
  token: storedToken,
  toast: null,
  user: { ...userProfile },
  navDirection: 'push',
};

const tabScreenMap: Record<TabName, ScreenName> = {
  home: 'home',
  orders: 'orders',
  offers: 'offers',
  group: 'groupOrder',
  profile: 'profile',
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'NAVIGATE': {
      const dir = action.direction || 'push';
      return {
        ...state,
        prevScreen: state.screen,
        screen: action.screen,
        navDirection: dir,
      };
    }
    case 'SET_TAB': {
      const screen = tabScreenMap[action.tab];
      return {
        ...state,
        activeTab: action.tab,
        prevScreen: state.screen,
        screen,
        navDirection: 'pop',
      };
    }
    case 'SELECT_CANTEEN':
      return { ...state, selectedCanteenId: action.id };
    case 'ADD_TO_CART': {
      const existing = state.cart.find(i => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, cart: [...state.cart, { ...action.item, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => i.id !== action.itemId) };
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return { ...state, cart: state.cart.filter(i => i.id !== action.itemId) };
      }
      return {
        ...state,
        cart: state.cart.map(i =>
          i.id === action.itemId ? { ...i, quantity: action.quantity } : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SET_ACTIVE_ORDER':
      return { ...state, activeOrderId: action.orderId, tokenNumber: action.token };
    case 'COMPLETE_ONBOARDING':
      return { ...state, isOnboarded: true, screen: 'login' };
    case 'SET_TOKEN':
      return { ...state, token: action.token, isLoggedIn: !!action.token };
    case 'LOGIN':
      return {
        ...state,
        isLoggedIn: true,
        activeTab: 'home',
        prevScreen: state.screen,
        screen: 'home',
        user: {
          ...state.user,
          name: action.name,
          phone: action.phone,
          email: action.email,
        },
        navDirection: 'push',
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        token: null,
        tokenNumber: '',
        activeOrderId: null,
        cart: [],
        orders: [],
        activeTab: 'home',
        prevScreen: state.screen,
        screen: 'login',
        user: { ...userProfile },
        navDirection: 'pop',
      };
    case 'SHOW_TOAST':
      return { ...state, toast: { message: action.message, type: action.toastType } };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    case 'REORDER':
      return { ...state, cart: [...state.cart, ...action.order.items] };
    case 'SET_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.orderId ? { ...o, status: action.status } : o
        ),
      };
    case 'UPDATE_WALLET':
      return { ...state, user: { ...state.user, walletBalance: state.user.walletBalance + action.amount } };
    case 'ADD_ORDER':
      return { ...state, orders: [action.order, ...state.orders] };
    case 'SET_ORDERS':
      return { ...state, orders: action.orders };
    case 'SET_USER':
      return { ...state, user: action.user };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  navigate: (screen: ScreenName, direction?: 'push' | 'pop' | 'modal') => void;
  goBack: () => void;
  addToCart: (itemId: string, preloadedItem?: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
  cartTotal: number;
  cartCount: number;
  /** Perform a full login: store token, fetch profile, navigate home */
  loginWithToken: (token: string, user: { name: string; phone: string; email: string }) => void;
  /** Clear all auth state and navigate to login */
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const navigate = useCallback((screen: ScreenName, direction?: 'push' | 'pop' | 'modal') => {
    dispatch({ type: 'NAVIGATE', screen, direction: direction || 'push' });
  }, []);

  const goBack = useCallback(() => {
    const backMap: Record<ScreenName, ScreenName> = {
      splash: 'splash',
      onboarding: 'splash',
      login: 'login',
      home: 'home',
      canteenDetail: 'home',
      cart: 'canteenDetail',
      payment: 'cart',
      orderSuccess: 'payment',
      orderTracking: 'orderSuccess',
      orders: 'orders',
      groupOrder: 'groupOrder',
      offers: 'offers',
      profile: 'profile',
      canteenDashboard: 'canteenDashboard',
      admin: 'admin',
    };
    dispatch({ type: 'NAVIGATE', screen: backMap[state.screen] || 'home', direction: 'pop' });
  }, [state.screen]);

  const addToCart = useCallback((itemId: string, preloadedItem?: CartItem) => {
    const handleAdd = (item: MenuItem) => {
      if (state.cart.length > 0 && state.cart[0].canteenId !== item.canteenId) {
        dispatch({ type: 'SHOW_TOAST', message: 'Cart cleared for new canteen order', toastType: 'warning' });
        setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
        dispatch({ type: 'CLEAR_CART' });
        dispatch({ type: 'ADD_TO_CART', item: { ...item, quantity: 1 } });
      } else {
        dispatch({ type: 'ADD_TO_CART', item: { ...item, quantity: 1 } });
      }
    };

    if (preloadedItem) {
      handleAdd(preloadedItem);
      return;
    }
    // Fallback: fetch item from API
    import('@/services/menu').then(async ({ getMenuItemById, normalizeMenuItem }) => {
      try {
        const res = await getMenuItemById(itemId);
        const item = normalizeMenuItem(res.data);
        handleAdd(item);
      } catch {
        // Item not found via API; silently fail
      }
    });
  }, [state.cart]);

  const removeFromCart = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', itemId });
  }, []);

  const updateQuantity = useCallback((itemId: string, qty: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', itemId, quantity: qty });
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    dispatch({ type: 'SHOW_TOAST', message, toastType: type });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
  }, []);

  const loginWithToken = useCallback((
    token: string,
    user: { name: string; phone: string; email: string }
  ) => {
    storeToken(token);
    dispatch({ type: 'SET_TOKEN', token });
    dispatch({ type: 'LOGIN', name: user.name, phone: user.phone, email: user.email });
  }, []);

  const logout = useCallback(() => {
    removeToken();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const cartTotal = state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AppContext.Provider value={{
      state, dispatch, navigate, goBack, addToCart, removeFromCart,
      updateQuantity, showToast, cartTotal, cartCount,
      loginWithToken, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
