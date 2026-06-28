import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { IUser } from '../models/User';
import type { ICanteen } from '../models/Canteen';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fastfeast';

async function seed(): Promise<void> {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db!;

    // ─── Clear existing data ────────────────────────────
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
    }
    console.log('Cleared existing data\n');

    // ─── Seed Users ─────────────────────────────────────
    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@fastfeast.app',
        phone: '+91 99999 99999',
        password: hashedPassword,
        walletBalance: 500,
        streakDays: 30,
        totalOrders: 1247,
        totalSaved: 1500,
        isAdmin: true,
        isCanteenOwner: true,
      },
      {
        name: 'Fast Feast User',
        email: 'user@fastfeast.app',
        phone: '+91 90000 00000',
        password: hashedPassword,
        walletBalance: 120,
        streakDays: 7,
        totalOrders: 23,
        totalSaved: 340,
        isAdmin: false,
        isCanteenOwner: false,
      },
      {
        name: 'Demo Canteen',
        email: 'canteen@fastfeast.app',
        phone: '+91 90000 00001',
        password: hashedPassword,
        walletBalance: 0,
        streakDays: 0,
        totalOrders: 0,
        totalSaved: 0,
        isAdmin: false,
        isCanteenOwner: true,
      },
    ] as IUser[];

    const createdUsers = await mongoose.connection
      .collection('users')
      .insertMany(users);
    const userIds = Object.values(createdUsers.insertedIds);

    console.log(`✓ Created ${users.length} users`);
    console.log('  - Admin: admin@fastfeast.app / password123');
    console.log('  - User:  user@fastfeast.app / password123');
    console.log('  - Owner: canteen@fastfeast.app / password123\n');

    // ─── Seed Canteens ──────────────────────────────────
    const canteens = [
      {
        name: 'Main Canteen',
        description: 'The largest canteen on campus with a wide variety of food options.',
        rating: 4.5,
        ratingCount: 1200,
        tags: ['Fast', 'Popular'],
        rushLevel: 'low',
        avgWaitTime: '5 min',
        bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
        categories: ['All', 'Beverages', 'Snacks', 'Meals', 'Desserts', 'Combos'],
        isActive: true,
        ownerId: userIds[2],
      },
      {
        name: 'South Square',
        description: 'Authentic South Indian cuisine at affordable prices.',
        rating: 4.2,
        ratingCount: 850,
        tags: ['Budget', 'Veg'],
        rushLevel: 'medium',
        avgWaitTime: '8 min',
        bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        categories: ['All', 'Beverages', 'Snacks', 'Meals', 'Desserts'],
        isActive: true,
      },
      {
        name: 'Cafe Brew',
        description: 'Premium coffee and bakery items for a relaxing break.',
        rating: 4.7,
        ratingCount: 2100,
        tags: ['Premium', 'Beverages'],
        rushLevel: 'low',
        avgWaitTime: '4 min',
        bannerImage: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
        categories: ['All', 'Beverages', 'Snacks', 'Desserts'],
        isActive: true,
      },
      {
        name: 'Night Bites',
        description: 'Late-night cravings? We got you covered with quick bites.',
        rating: 4.0,
        ratingCount: 620,
        tags: ['Late Night', 'Fast'],
        rushLevel: 'high',
        avgWaitTime: '12 min',
        bannerImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
        categories: ['All', 'Snacks', 'Meals', 'Combos'],
        isActive: true,
      },
    ];

    const createdCanteens = await mongoose.connection
      .collection('canteens')
      .insertMany(canteens);

    const canteenIds = Object.values(createdCanteens.insertedIds);
    console.log(`✓ Created ${canteens.length} canteens\n`);

    // ─── Seed Menu Items ────────────────────────────────
    const menuItems = [
      // Main Canteen (canteenIds[0])
      { canteenId: canteenIds[0], category: 'Meals', name: 'Cheese Burger', description: 'Juicy beef patty with melted cheese', price: 120, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', isVeg: false, inStock: true, isTrending: true, sortOrder: 1 },
      { canteenId: canteenIds[0], category: 'Meals', name: 'Margherita Pizza', description: 'Fresh mozzarella, basil, tomato sauce', price: 180, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', isVeg: true, inStock: true, isTrending: true, sortOrder: 2 },
      { canteenId: canteenIds[0], category: 'Snacks', name: 'French Fries', description: 'Crispy golden fries with peri-peri seasoning', price: 60, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80', isVeg: true, inStock: true, isFast: true, sortOrder: 3 },
      { canteenId: canteenIds[0], category: 'Beverages', name: 'Cold Coffee', description: 'Iced coffee with whipped cream', price: 80, prepTime: '3 min', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', isVeg: true, inStock: true, isTrending: true, isFast: true, sortOrder: 4 },
      { canteenId: canteenIds[0], category: 'Meals', name: 'Chicken Biryani', description: 'Fragrant basmati rice with tender chicken', price: 150, prepTime: '12 min', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', isVeg: false, inStock: true, sortOrder: 5 },
      { canteenId: canteenIds[0], category: 'Snacks', name: 'Veg Samosa', description: 'Crispy pastry filled with spiced potatoes', price: 15, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', isVeg: true, inStock: true, isFast: true, sortOrder: 6 },
      { canteenId: canteenIds[0], category: 'Combos', name: 'Burger Combo', description: 'Burger + Fries + Coke', price: 199, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80', isVeg: false, inStock: true, sortOrder: 7 },
      { canteenId: canteenIds[0], category: 'Desserts', name: 'Chocolate Brownie', description: 'Warm chocolate brownie with vanilla ice cream', price: 90, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80', isVeg: true, inStock: true, sortOrder: 8 },
      { canteenId: canteenIds[0], category: 'Meals', name: 'Chicken Sandwich', description: 'Grilled chicken with lettuce and mayo', price: 100, prepTime: '7 min', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80', isVeg: false, inStock: true, sortOrder: 9 },
      { canteenId: canteenIds[0], category: 'Beverages', name: 'Mango Lassi', description: 'Thick yogurt drink with mango pulp', price: 60, prepTime: '3 min', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80', isVeg: true, inStock: true, isFast: true, sortOrder: 10 },
      { canteenId: canteenIds[0], category: 'Snacks', name: 'Spring Rolls', description: 'Crispy vegetable spring rolls', price: 50, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', isVeg: true, inStock: true, sortOrder: 11 },
      { canteenId: canteenIds[0], category: 'Desserts', name: 'Gulab Jamun', description: 'Warm milk dumplings in sugar syrup', price: 40, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', isVeg: true, inStock: true, isFast: true, sortOrder: 12 },
      { canteenId: canteenIds[0], category: 'Meals', name: 'Paneer Butter Masala', description: 'Creamy paneer curry with naan', price: 140, prepTime: '12 min', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80', isVeg: true, inStock: true, sortOrder: 13 },
      { canteenId: canteenIds[0], category: 'Beverages', name: 'Fresh Lime Soda', description: 'Refreshing lime soda, sweet or salted', price: 35, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80', isVeg: true, inStock: true, isFast: true, sortOrder: 14 },
      // South Square (canteenIds[1])
      { canteenId: canteenIds[1], category: 'Meals', name: 'Masala Dosa', description: 'Crispy dosa with spiced potato filling', price: 70, prepTime: '8 min', image: 'https://images.unsplash.com/photo-1668236543090-82ebefb0f580?w=400&q=80', isVeg: true, inStock: true, isTrending: true, sortOrder: 1 },
      { canteenId: canteenIds[1], category: 'Meals', name: 'Idli Sambar', description: 'Soft steamed idlis with sambar and chutney', price: 50, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80', isVeg: true, inStock: true, isFast: true, sortOrder: 2 },
      { canteenId: canteenIds[1], category: 'Snacks', name: 'Medu Vada', description: 'Crispy fried lentil donuts', price: 40, prepTime: '6 min', image: 'https://images.unsplash.com/photo-1606491956689-22ea63225580?w=400&q=80', isVeg: true, inStock: true, sortOrder: 3 },
      { canteenId: canteenIds[1], category: 'Beverages', name: 'Filter Coffee', description: 'Traditional South Indian filter coffee', price: 25, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80', isVeg: true, inStock: true, isFast: true, sortOrder: 4 },
      { canteenId: canteenIds[1], category: 'Meals', name: 'Veg Thali', description: 'Rice, dal, 2 sabzi, roti, papad, pickle', price: 100, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80', isVeg: true, inStock: true, sortOrder: 5 },
      // Cafe Brew (canteenIds[2])
      { canteenId: canteenIds[2], category: 'Beverages', name: 'Caramel Latte', description: 'Espresso with steamed milk and caramel', price: 120, prepTime: '4 min', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', isVeg: true, inStock: true, isTrending: true, sortOrder: 1 },
      { canteenId: canteenIds[2], category: 'Beverages', name: 'Cappuccino', description: 'Rich espresso with frothy milk', price: 100, prepTime: '4 min', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&q=80', isVeg: true, inStock: true, sortOrder: 2 },
      { canteenId: canteenIds[2], category: 'Snacks', name: 'Chocolate Croissant', description: 'Buttery croissant with chocolate filling', price: 80, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&q=80', isVeg: true, inStock: true, isFast: true, sortOrder: 3 },
      { canteenId: canteenIds[2], category: 'Desserts', name: 'Blueberry Muffin', description: 'Freshly baked muffin with blueberries', price: 70, prepTime: '2 min', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80', isVeg: true, inStock: true, isFast: true, sortOrder: 4 },
      { canteenId: canteenIds[2], category: 'Beverages', name: 'Green Tea', description: 'Refreshing green tea with lemon and honey', price: 50, prepTime: '3 min', image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&q=80', isVeg: true, inStock: true, isFast: true, sortOrder: 5 },
      // Night Bites (canteenIds[3])
      { canteenId: canteenIds[3], category: 'Snacks', name: 'Maggi Noodles', description: 'Masala Maggi with veggies and extra spice', price: 40, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80', isVeg: true, inStock: true, isTrending: true, isFast: true, sortOrder: 1 },
      { canteenId: canteenIds[3], category: 'Snacks', name: 'Chicken Momos', description: 'Steamed dumplings with spicy red chutney', price: 80, prepTime: '8 min', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80', isVeg: false, inStock: true, sortOrder: 2 },
      { canteenId: canteenIds[3], category: 'Meals', name: 'Chicken Kathi Roll', description: 'Spiced chicken wrapped in paratha', price: 100, prepTime: '8 min', image: 'https://images.unsplash.com/photo-1606491956689-22ea63225580?w=400&q=80', isVeg: false, inStock: true, isTrending: true, sortOrder: 3 },
      { canteenId: canteenIds[3], category: 'Snacks', name: 'Paneer Tikka', description: 'Grilled paneer cubes with mint chutney', price: 90, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80', isVeg: true, inStock: true, sortOrder: 4 },
      { canteenId: canteenIds[3], category: 'Beverages', name: 'Chocolate Shake', description: 'Thick chocolate milkshake with whipped cream', price: 70, prepTime: '3 min', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80', isVeg: true, inStock: true, isFast: true, sortOrder: 5 },
      { canteenId: canteenIds[3], category: 'Combos', name: 'Late Night Combo', description: 'Maggi + Shake + Fries', price: 149, prepTime: '8 min', image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80', isVeg: true, inStock: true, sortOrder: 6 },
    ];

    await mongoose.connection.collection('menuitems').insertMany(menuItems);
    console.log(`✓ Created ${menuItems.length} menu items\n`);

    // ─── Seed Orders ────────────────────────────────────
    const orders = [
      {
        token: 'A-038',
        userId: userIds[1],
        canteenId: canteenIds[0],
        canteenName: 'Main Canteen',
        items: [
          { menuItemId: (await mongoose.connection.collection('menuitems').findOne({ name: 'Cheese Burger' }))!._id, name: 'Cheese Burger', price: 120, quantity: 1 },
          { menuItemId: (await mongoose.connection.collection('menuitems').findOne({ name: 'French Fries' }))!._id, name: 'French Fries', price: 60, quantity: 2 },
        ],
        subtotal: 240,
        gst: 12,
        platformFee: 5,
        discount: 20,
        finalTotal: 237,
        status: 'completed',
        paymentMethod: 'UPI',
        estimatedTime: '10 min',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        token: 'A-029',
        userId: userIds[1],
        canteenId: canteenIds[2],
        canteenName: 'Cafe Brew',
        items: [
          { menuItemId: (await mongoose.connection.collection('menuitems').findOne({ name: 'Caramel Latte' }))!._id, name: 'Caramel Latte', price: 120, quantity: 1 },
          { menuItemId: (await mongoose.connection.collection('menuitems').findOne({ name: 'Chocolate Croissant' }))!._id, name: 'Chocolate Croissant', price: 80, quantity: 1 },
        ],
        subtotal: 200,
        gst: 10,
        platformFee: 5,
        discount: 0,
        finalTotal: 215,
        status: 'completed',
        paymentMethod: 'Wallet',
        estimatedTime: '5 min',
        createdAt: new Date(Date.now() - 172800000),
      },
    ];

    await mongoose.connection.collection('orders').insertMany(orders);
    console.log(`✓ Created ${orders.length} sample orders\n`);

    // ─── Seed Offers ────────────────────────────────────
    const offers = [
      { title: 'Burger Blast', discount: '30% OFF', description: 'On all burgers at Main Canteen', validUntil: '8 PM today', code: 'BURGER30', gradient: 'from-purple-600 to-blue-600', claimed: 120, maxClaims: 500, isActive: true },
      { title: 'Coffee Hours', discount: 'Buy 1 Get 1', description: 'On all beverages at Cafe Brew', validUntil: '4 PM today', code: 'COFFEEBOGO', gradient: 'from-orange-500 to-red-500', claimed: 85, maxClaims: 200, isActive: true },
      { title: 'Night Owl', discount: '₹50 OFF', description: 'On orders above ₹200 after 10 PM', validUntil: '2 AM', code: 'NIGHT50', gradient: 'from-indigo-600 to-purple-600', claimed: 45, maxClaims: 100, isActive: true },
      { title: 'South Special', discount: '20% OFF', description: 'On all meals at South Square', validUntil: '3 PM today', code: 'SOUTH20', gradient: 'from-green-500 to-teal-500', claimed: 200, maxClaims: 1000, isActive: true },
    ];

    await mongoose.connection.collection('offers').insertMany(offers);
    console.log(`✓ Created ${offers.length} offers\n`);

    // ─── Seed Coupons ───────────────────────────────────
    const coupons = [
      { code: 'WELCOME50', discount: '₹50 off', description: 'On your first order above ₹150', minOrder: 150, discountType: 'fixed', discountValue: 50, maxUses: 1000, usedCount: 10, isActive: true },
      { code: 'CAMPUS15', discount: '15% off', description: 'Valid on all canteens', minOrder: 100, discountType: 'percentage', discountValue: 15, maxUses: 500, usedCount: 25, isActive: true },
      { code: 'FREEDEL', discount: 'Free delivery', description: 'Platform fee waiver', minOrder: 0, discountType: 'fixed', discountValue: 5, maxUses: 2000, usedCount: 500, isActive: true },
    ];

    await mongoose.connection.collection('coupons').insertMany(coupons);
    console.log(`✓ Created ${coupons.length} coupons\n`);

    console.log('═══════════════════════════════════════════');
    console.log('  ✅  Database seeded successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('  Test Credentials:');
    console.log('  ────────────────');
    console.log('  Admin: admin@fastfeast.app / password123');
    console.log('  User:  user@fastfeast.app / password123');
    console.log('  Owner: canteen@fastfeast.app / password123');
    console.log('');
    console.log('  API Base URL: http://localhost:5000/api');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
