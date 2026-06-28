import type { Canteen, MenuItem, Offer, UserProfile, Order, DashboardOrder } from '@/types';

export const canteens: Canteen[] = [
  {
    id: 'c1',
    name: 'Main Canteen',
    rating: 4.5,
    ratingCount: '1.2k',
    tags: ['Fast', 'Popular'],
    rushLevel: 'low',
    avgWaitTime: '5 min',
    bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    categories: ['All', 'Beverages', 'Snacks', 'Meals', 'Desserts', 'Combos'],
  },
  {
    id: 'c2',
    name: 'South Square',
    rating: 4.2,
    ratingCount: '850',
    tags: ['Budget', 'Veg'],
    rushLevel: 'medium',
    avgWaitTime: '8 min',
    bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    categories: ['All', 'Beverages', 'Snacks', 'Meals', 'Desserts'],
  },
  {
    id: 'c3',
    name: 'Cafe Brew',
    rating: 4.7,
    ratingCount: '2.1k',
    tags: ['Premium', 'Beverages'],
    rushLevel: 'low',
    avgWaitTime: '4 min',
    bannerImage: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
    categories: ['All', 'Beverages', 'Snacks', 'Desserts'],
  },
  {
    id: 'c4',
    name: 'Night Bites',
    rating: 4.0,
    ratingCount: '620',
    tags: ['Late Night', 'Fast'],
    rushLevel: 'high',
    avgWaitTime: '12 min',
    bannerImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
    categories: ['All', 'Snacks', 'Meals', 'Combos'],
  },
];

export const menuItems: MenuItem[] = [
  // Main Canteen
  { id: 'm1', canteenId: 'c1', category: 'Meals', name: 'Cheese Burger', description: 'Juicy beef patty with melted cheese', price: 120, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', isVeg: false, inStock: true, isTrending: true },
  { id: 'm2', canteenId: 'c1', category: 'Meals', name: 'Margherita Pizza', description: 'Fresh mozzarella, basil, tomato sauce', price: 180, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', isVeg: true, inStock: true, isTrending: true },
  { id: 'm3', canteenId: 'c1', category: 'Snacks', name: 'French Fries', description: 'Crispy golden fries with peri-peri seasoning', price: 60, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80', isVeg: true, inStock: true, isFast: true },
  { id: 'm4', canteenId: 'c1', category: 'Beverages', name: 'Cold Coffee', description: 'Iced coffee with whipped cream', price: 80, prepTime: '3 min', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', isVeg: true, inStock: true, isTrending: true, isFast: true },
  { id: 'm5', canteenId: 'c1', category: 'Meals', name: 'Chicken Biryani', description: 'Fragrant basmati rice with tender chicken', price: 150, prepTime: '12 min', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', isVeg: false, inStock: true },
  { id: 'm6', canteenId: 'c1', category: 'Snacks', name: 'Veg Samosa', description: 'Crispy pastry filled with spiced potatoes', price: 15, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', isVeg: true, inStock: true, isFast: true },
  { id: 'm7', canteenId: 'c1', category: 'Combos', name: 'Burger Combo', description: 'Burger + Fries + Coke', price: 199, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80', isVeg: false, inStock: true },
  { id: 'm8', canteenId: 'c1', category: 'Desserts', name: 'Chocolate Brownie', description: 'Warm chocolate brownie with vanilla ice cream', price: 90, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80', isVeg: true, inStock: true },
  // South Square
  { id: 'm9', canteenId: 'c2', category: 'Meals', name: 'Masala Dosa', description: 'Crispy dosa with spiced potato filling', price: 70, prepTime: '8 min', image: 'https://images.unsplash.com/photo-1668236543090-82ebefb0f580?w=400&q=80', isVeg: true, inStock: true, isTrending: true },
  { id: 'm10', canteenId: 'c2', category: 'Meals', name: 'Idli Sambar', description: 'Soft steamed idlis with sambar and chutney', price: 50, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80', isVeg: true, inStock: true, isFast: true },
  { id: 'm11', canteenId: 'c2', category: 'Snacks', name: 'Medu Vada', description: 'Crispy fried lentil donuts', price: 40, prepTime: '6 min', image: 'https://images.unsplash.com/photo-1606491956689-22ea63225580?w=400&q=80', isVeg: true, inStock: true },
  { id: 'm12', canteenId: 'c2', category: 'Beverages', name: 'Filter Coffee', description: 'Traditional South Indian filter coffee', price: 25, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80', isVeg: true, inStock: true, isFast: true },
  { id: 'm13', canteenId: 'c2', category: 'Meals', name: 'Veg Thali', description: 'Rice, dal, 2 sabzi, roti, papad, pickle', price: 100, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80', isVeg: true, inStock: true },
  // Cafe Brew
  { id: 'm14', canteenId: 'c3', category: 'Beverages', name: 'Caramel Latte', description: 'Espresso with steamed milk and caramel', price: 120, prepTime: '4 min', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', isVeg: true, inStock: true, isTrending: true },
  { id: 'm15', canteenId: 'c3', category: 'Beverages', name: 'Cappuccino', description: 'Rich espresso with frothy milk', price: 100, prepTime: '4 min', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&q=80', isVeg: true, inStock: true },
  { id: 'm16', canteenId: 'c3', category: 'Snacks', name: 'Chocolate Croissant', description: 'Buttery croissant with chocolate filling', price: 80, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&q=80', isVeg: true, inStock: true, isFast: true },
  { id: 'm17', canteenId: 'c3', category: 'Desserts', name: 'Blueberry Muffin', description: 'Freshly baked muffin with blueberries', price: 70, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80', isVeg: true, inStock: true, isFast: true },
  { id: 'm18', canteenId: 'c3', category: 'Beverages', name: 'Green Tea', description: 'Refreshing green tea with lemon and honey', price: 50, prepTime: '3 min', image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&q=80', isVeg: true, inStock: true, isFast: true },
  // Night Bites
  { id: 'm19', canteenId: 'c4', category: 'Snacks', name: 'Maggi Noodles', description: 'Masala Maggi with veggies and extra spice', price: 40, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80', isVeg: true, inStock: true, isTrending: true, isFast: true },
  { id: 'm20', canteenId: 'c4', category: 'Snacks', name: 'Chicken Momos', description: 'Steamed dumplings with spicy red chutney', price: 80, prepTime: '8 min', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80', isVeg: false, inStock: true },
  { id: 'm21', canteenId: 'c4', category: 'Meals', name: 'Chicken Kathi Roll', description: 'Spiced chicken wrapped in paratha', price: 100, prepTime: '8 min', image: 'https://images.unsplash.com/photo-1606491956689-22ea63225580?w=400&q=80', isVeg: false, inStock: true, isTrending: true },
  { id: 'm22', canteenId: 'c4', category: 'Snacks', name: 'Paneer Tikka', description: 'Grilled paneer cubes with mint chutney', price: 90, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80', isVeg: true, inStock: true },
  { id: 'm23', canteenId: 'c4', category: 'Beverages', name: 'Chocolate Shake', description: 'Thick chocolate milkshake with whipped cream', price: 70, prepTime: '3 min', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80', isVeg: true, inStock: true, isFast: true },
  { id: 'm24', canteenId: 'c4', category: 'Combos', name: 'Late Night Combo', description: 'Maggi + Shake + Fries', price: 149, prepTime: '8 min', image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80', isVeg: true, inStock: true },
  // More items for Main Canteen
  { id: 'm25', canteenId: 'c1', category: 'Meals', name: 'Chicken Sandwich', description: 'Grilled chicken with lettuce and mayo', price: 100, prepTime: '7 min', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80', isVeg: false, inStock: true },
  { id: 'm26', canteenId: 'c1', category: 'Beverages', name: 'Mango Lassi', description: 'Thick yogurt drink with mango pulp', price: 60, prepTime: '3 min', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80', isVeg: true, inStock: true, isFast: true },
  { id: 'm27', canteenId: 'c1', category: 'Snacks', name: 'Spring Rolls', description: 'Crispy vegetable spring rolls', price: 50, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', isVeg: true, inStock: true },
  { id: 'm28', canteenId: 'c1', category: 'Desserts', name: 'Gulab Jamun', description: 'Warm milk dumplings in sugar syrup', price: 40, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', isVeg: true, inStock: true, isFast: true },
  { id: 'm29', canteenId: 'c1', category: 'Meals', name: 'Paneer Butter Masala', description: 'Creamy paneer curry with naan', price: 140, prepTime: '12 min', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80', isVeg: true, inStock: true },
  { id: 'm30', canteenId: 'c1', category: 'Beverages', name: 'Fresh Lime Soda', description: 'Refreshing lime soda, sweet or salted', price: 35, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80', isVeg: true, inStock: true, isFast: true },
];

export const offers: Offer[] = [
  { id: 'o1', title: 'Burger Blast', discount: '30% OFF', description: 'On all burgers at Main Canteen', validUntil: '8 PM today', code: 'BURGER30', gradient: 'from-purple-600 to-blue-600' },
  { id: 'o2', title: 'Coffee Hours', discount: 'Buy 1 Get 1', description: 'On all beverages at Cafe Brew', validUntil: '4 PM today', code: 'COFFEEBOGO', gradient: 'from-orange-500 to-red-500' },
  { id: 'o3', title: 'Night Owl', discount: '₹50 OFF', description: 'On orders above ₹200 after 10 PM', validUntil: '2 AM', code: 'NIGHT50', gradient: 'from-indigo-600 to-purple-600' },
  { id: 'o4', title: 'South Special', discount: '20% OFF', description: 'On all meals at South Square', validUntil: '3 PM today', code: 'SOUTH20', gradient: 'from-green-500 to-teal-500' },
];

export const coupons = [
  { id: 'cp1', code: 'WELCOME50', discount: '₹50 off', description: 'On your first order above ₹150', minOrder: 150 },
  { id: 'cp2', code: 'CAMPUS15', discount: '15% off', description: 'Valid on all canteens', minOrder: 100 },
  { id: 'cp3', code: 'FREEDEL', discount: 'Free delivery', description: 'Platform fee waiver', minOrder: 0 },
];

export const userProfile: UserProfile = {
  name: 'Fast Feast User',
  email: 'user@fastfeast.app',
  phone: '+91 90000 00000',
  walletBalance: 120,
  streakDays: 7,
  totalOrders: 23,
  totalSaved: 340,
};

export const pastOrders: Order[] = [
  {
    id: 'ord1', token: 'A-038', canteenId: 'c1', canteenName: 'Main Canteen',
    items: [
      { ...menuItems[0], quantity: 1 },
      { ...menuItems[2], quantity: 2 },
    ],
    total: 240, gst: 12, platformFee: 5, discount: 20, finalTotal: 237,
    status: 'completed', paymentMethod: 'UPI', createdAt: 'Today, 1:30 PM',
    estimatedTime: '10 min',
  },
  {
    id: 'ord2', token: 'A-029', canteenId: 'c3', canteenName: 'Cafe Brew',
    items: [
      { ...menuItems[13], quantity: 1 },
      { ...menuItems[15], quantity: 1 },
    ],
    total: 220, gst: 11, platformFee: 5, discount: 0, finalTotal: 236,
    status: 'completed', paymentMethod: 'Wallet', createdAt: 'Yesterday, 4:15 PM',
    estimatedTime: '5 min',
  },
  {
    id: 'ord3', token: 'A-015', canteenId: 'c4', canteenName: 'Night Bites',
    items: [
      { ...menuItems[18], quantity: 1 },
      { ...menuItems[22], quantity: 1 },
    ],
    total: 110, gst: 5.5, platformFee: 5, discount: 10, finalTotal: 110.5,
    status: 'completed', paymentMethod: 'UPI', createdAt: '13 Jan, 11:30 PM',
    estimatedTime: '8 min',
  },
];

export const dashboardOrders: DashboardOrder[] = [
  { id: 'do1', token: 'A-042', items: [{ name: 'Cheese Burger', qty: 2 }, { name: 'Fries', qty: 1 }], status: 'new', timeAgo: '2 min ago', total: 300, notes: 'Extra spicy', orderType: 'regular' },
  { id: 'do2', token: 'A-041', items: [{ name: 'Chicken Biryani', qty: 1 }, { name: 'Cold Coffee', qty: 2 }], status: 'new', timeAgo: '5 min ago', total: 310, orderType: 'regular' },
  { id: 'do3', token: 'A-040', items: [{ name: 'Margherita Pizza', qty: 1 }], status: 'new', timeAgo: '8 min ago', total: 180, orderType: 'group' },
  { id: 'do4', token: 'A-039', items: [{ name: 'Veg Samosa', qty: 4 }, { name: 'Cold Coffee', qty: 2 }], status: 'preparing', timeAgo: '10 min ago', total: 220, orderType: 'regular' },
  { id: 'do5', token: 'A-037', items: [{ name: 'Burger Combo', qty: 3 }], status: 'preparing', timeAgo: '15 min ago', total: 597, orderType: 'group' },
  { id: 'do6', token: 'A-036', items: [{ name: 'Chicken Sandwich', qty: 1 }, { name: 'Fries', qty: 1 }], status: 'ready', timeAgo: '18 min ago', total: 160, orderType: 'regular' },
  { id: 'do7', token: 'A-035', items: [{ name: 'Chocolate Brownie', qty: 2 }], status: 'ready', timeAgo: '20 min ago', total: 180, orderType: 'regular' },
];

export const groupParticipants = [
  { id: 'p1', name: 'You', avatar: 'Y', color: 'from-orange-500 to-red-500', isHost: true },
  { id: 'p2', name: 'Aisha', avatar: 'A', color: 'from-pink-500 to-rose-500', isHost: false },
  { id: 'p3', name: 'Rohan', avatar: 'R', color: 'from-blue-500 to-cyan-500', isHost: false },
  { id: 'p4', name: 'Priya', avatar: 'P', color: 'from-purple-500 to-violet-500', isHost: false },
];

export const suggestedCombos = [
  { id: 'sc1', name: 'Burger Meal', items: ['Cheese Burger', 'Fries', 'Coke'], price: 199, originalPrice: 250, savings: 51 },
  { id: 'sc2', name: 'Coffee Break', items: ['Caramel Latte', 'Chocolate Croissant'], price: 170, originalPrice: 200, savings: 30 },
  { id: 'sc3', name: 'Night Cravings', items: ['Maggi Noodles', 'Chocolate Shake'], price: 99, originalPrice: 110, savings: 11 },
];

export const adminStats = {
  totalOrders: 1247,
  revenue: 48350,
  activeCanteens: 5,
  totalUsers: 523,
  weeklyRevenue: [4200, 5100, 4800, 6200, 7100, 8500, 8400],
  orderTrend: '+12%',
  revenueTrend: '+8%',
  userTrend: '+23',
};

export const recentActivity = [
  { icon: 'store', text: 'New canteen "South Square" registered', time: '2 min ago', color: 'green' },
  { icon: 'tag', text: 'Offer "Burger Deal" claimed 45 times', time: '15 min ago', color: 'orange' },
  { icon: 'users', text: 'User #412 completed registration', time: '1 hour ago', color: 'blue' },
  { icon: 'dollar', text: 'Order #A-152 was refunded (₹180)', time: '2 hours ago', color: 'red' },
  { icon: 'chart', text: 'Daily revenue target achieved (₹6,200)', time: '3 hours ago', color: 'green' },
];
