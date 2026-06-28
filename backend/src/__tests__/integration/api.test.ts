import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../../app';
import { User, Canteen, MenuItem, Order, Offer, Coupon } from '../../models';

let mongoServer: MongoMemoryServer;

// ─── Test Data ──────────────────────────────────────────

const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  phone: '+919876543210',
  password: 'password123',
};

const testAdmin = {
  name: 'Admin User',
  email: 'admin@fastfeast.app',
  phone: '+919999999991',
  password: 'adminpass123',
  isAdmin: true,
};

const testCanteen = {
  name: 'Integration Canteen',
  description: 'A test canteen',
  bannerImage: 'https://example.com/banner.jpg',
  avgWaitTime: '5-10 min',
  tags: ['north-indian', 'fast-food'],
  isActive: true,
};

const testMenuItem = {
  name: 'Test Burger',
  description: 'A test burger for integration testing',
  category: 'Burgers',
  price: 150,
  prepTime: '10 min',
  image: 'https://example.com/burger.jpg',
  isVeg: false,
  inStock: true,
  isTrending: true,
  isFast: true,
};

const testOffer = {
  title: 'Test Offer',
  discount: '20% Off',
  description: 'Integration test offer',
  validUntil: '2027-12-31',
  code: 'TEST20',
  gradient: 'from-blue-500 to-purple-500',
  isActive: true,
};

const testCoupon = {
  code: 'INTEG10',
  discount: '10% Off',
  description: 'Integration test coupon',
  minOrder: 100,
  discountType: 'percentage' as const,
  discountValue: 10,
  maxUses: 100,
  usedCount: 0,
  isActive: true,
};

// ─── Setup & Teardown ──────────────────────────────────

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ─── Helper: Create a user and return a JWT token ──────

async function createUserAndGetToken(
  overrides: Partial<typeof testUser> = {}
): Promise<{ token: string; userId: string }> {
  const userData = { ...testUser, ...overrides };
  // Pass plaintext password — User model pre-save hook handles hashing
  const user = await User.create(userData);
  const res = await request(app).post('/api/auth/login').send({
    email: userData.email,
    password: userData.password,
  });
  return { token: res.body.data.token, userId: user._id.toString() };
}

async function createAdminAndGetToken(): Promise<string> {
  // Pass plaintext password — User model pre-save hook handles hashing
  await User.create(testAdmin);
  const res = await request(app).post('/api/auth/login').send({
    email: testAdmin.email,
    password: testAdmin.password,
  });
  return res.body.data.token;
}

async function seedCanteen(): Promise<string> {
  const canteen = await Canteen.create({
    ...testCanteen,
    ownerId: new mongoose.Types.ObjectId(),
  });
  return canteen._id.toString();
}

async function seedMenuItem(canteenId: string): Promise<string> {
  const item = await MenuItem.create({
    ...testMenuItem,
    canteenId: new mongoose.Types.ObjectId(canteenId),
  });
  return item._id.toString();
}

async function seedOffer(): Promise<string> {
  const offer = await Offer.create(testOffer);
  return offer._id.toString();
}

async function seedCoupon(): Promise<string> {
  const coupon = await Coupon.create(testCoupon);
  return coupon._id.toString();
}

// ═══════════════════════════════════════════════════════════
//  INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════

describe('API Integration Tests', () => {
  // ─── Health Check ───────────────────────────────────────
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          status: 'ok',
        },
        message: 'FastFeast API is running',
      });
      expect(res.body.data.timestamp).toBeDefined();
    });
  });

  // ─── Auth ──────────────────────────────────────────────
  describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const res = await request(app).post('/api/auth/register').send(testUser);

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
          success: true,
          data: {
            user: {
              name: testUser.name,
              email: testUser.email,
              phone: testUser.phone,
            },
          },
          message: 'Account created successfully',
        });
        expect(res.body.data.token).toBeDefined();
      });

      it('should return 409 for duplicate email', async () => {
        await request(app).post('/api/auth/register').send(testUser);
        const res = await request(app).post('/api/auth/register').send(testUser);

        expect(res.status).toBe(409);
      });

      it('should return 400 for invalid input', async () => {
        const res = await request(app).post('/api/auth/register').send({
          name: 'X',
          email: 'not-an-email',
          phone: 'invalid',
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        // Plaintext password — User model pre-save hook handles hashing
        await User.create(testUser);
      });

      it('should login successfully', async () => {
        const res = await request(app).post('/api/auth/login').send({
          email: testUser.email,
          password: testUser.password,
        });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          success: true,
          data: {
            user: { email: testUser.email },
          },
        });
        expect(res.body.data.token).toBeDefined();
      });

      it('should return 401 for wrong password', async () => {
        const res = await request(app).post('/api/auth/login').send({
          email: testUser.email,
          password: 'wrongpassword',
        });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
      });

      it('should return 401 for non-existent email', async () => {
        const res = await request(app).post('/api/auth/login').send({
          email: 'ghost@example.com',
          password: 'password123',
        });

        expect(res.status).toBe(401);
      });
    });

    describe('GET /api/auth/me', () => {
      it('should return current user profile', async () => {
        const { token } = await createUserAndGetToken();
        const res = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe(testUser.email);
      });

      it('should return 401 without auth token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
      });

      it('should return 401 with invalid token', async () => {
        const res = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalid-token-here');

        expect(res.status).toBe(401);
      });
    });

    describe('POST /api/auth/otp/send', () => {
      it('should send OTP successfully', async () => {
        const res = await request(app)
          .post('/api/auth/otp/send')
          .send({ phone: '+919876543210' });

        expect(res.status).toBe(200);
        expect(res.body.data.otpSent).toBe(true);
      });
    });

    describe('POST /api/auth/otp/verify', () => {
      it('should verify OTP and login existing user', async () => {
        await User.create(testUser);

        const res = await request(app)
          .post('/api/auth/otp/verify')
          .send({ phone: testUser.phone, otp: '123456' });

        expect(res.status).toBe(200);
        expect(res.body.data.token).toBeDefined();
      });

      it('should create new user via OTP verification', async () => {
        const res = await request(app)
          .post('/api/auth/otp/verify')
          .send({ phone: '+919876543211', otp: '123456', name: 'New OTP User' });

        expect(res.status).toBe(200);
        expect(res.body.data.user.name).toBe('New OTP User');
      });

      it('should return 400 for invalid OTP', async () => {
        const res = await request(app)
          .post('/api/auth/otp/verify')
          .send({ phone: '+919876543210', otp: '000000' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid OTP');
      });
    });
  });

  // ─── Canteens ──────────────────────────────────────────
  describe('Canteen Endpoints', () => {
    let canteenId: string;

    beforeEach(async () => {
      canteenId = await seedCanteen();
    });

    describe('GET /api/canteens', () => {
      it('should return paginated canteens', async () => {
        const res = await request(app).get('/api/canteens');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.meta).toMatchObject({
          page: 1,
          limit: 20,
          total: 1,
        });
      });

      it('should filter canteens by search query', async () => {
        const res = await request(app).get('/api/canteens?search=Integration');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
      });
    });

    describe('GET /api/canteens/:id', () => {
      it('should return canteen by ID', async () => {
        const res = await request(app).get(`/api/canteens/${canteenId}`);

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe(testCanteen.name);
      });

      it('should return 404 for non-existent canteen', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).get(`/api/canteens/${fakeId}`);

        expect(res.status).toBe(404);
      });
    });

    describe('GET /api/canteens/:id/menu', () => {
      it('should return canteen with its menu items', async () => {
        await seedMenuItem(canteenId);

        const res = await request(app).get(`/api/canteens/${canteenId}/menu`);

        expect(res.status).toBe(200);
        expect(res.body.data.canteen.name).toBe(testCanteen.name);
        expect(res.body.data.menuItems).toHaveLength(1);
        expect(res.body.data.menuItems[0].name).toBe(testMenuItem.name);
      });
    });
  });

  // ─── Menu ──────────────────────────────────────────────
  describe('Menu Endpoints', () => {
    let canteenId: string;
    let menuItemId: string;

    beforeEach(async () => {
      canteenId = await seedCanteen();
      menuItemId = await seedMenuItem(canteenId);
    });

    describe('GET /api/menu', () => {
      it('should return paginated menu items', async () => {
        const res = await request(app).get('/api/menu');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].name).toBe(testMenuItem.name);
      });

      it('should filter by canteenId', async () => {
        const res = await request(app).get(`/api/menu?canteenId=${canteenId}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
      });

      it('should filter by isVeg', async () => {
        const res = await request(app).get('/api/menu?isVeg=true');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
      });
    });

    describe('GET /api/menu/trending', () => {
      it('should return trending items', async () => {
        const res = await request(app).get('/api/menu/trending');

        expect(res.status).toBe(200);
        // Rating 4.5, so the canteen has no rating for canteenId population
        // But the item itself is trending and in stock
        expect(res.body.data).toHaveLength(1);
      });
    });

    describe('GET /api/menu/fast', () => {
      it('should return fast items', async () => {
        const res = await request(app).get('/api/menu/fast');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
      });
    });

    describe('GET /api/menu/canteen/:canteenId', () => {
      it('should return items grouped by category for a canteen', async () => {
        const res = await request(app).get(`/api/menu/canteen/${canteenId}`);

        expect(res.status).toBe(200);
        expect(res.body.data.items).toHaveLength(1);
        expect(res.body.data.grouped.Burgers).toHaveLength(1);
      });
    });

    describe('GET /api/menu/:id', () => {
      it('should return menu item by ID', async () => {
        const res = await request(app).get(`/api/menu/${menuItemId}`);

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe(testMenuItem.name);
      });
    });
  });

  // ─── Orders ────────────────────────────────────────────
  describe('Order Endpoints', () => {
    let token: string;
    let userId: string;
    let canteenId: string;
    let menuItemId: string;

    beforeEach(async () => {
      const result = await createUserAndGetToken();
      token = result.token;
      userId = result.userId;
      canteenId = await seedCanteen();
      menuItemId = await seedMenuItem(canteenId);
    });

    describe('POST /api/orders', () => {
      it('should place an order successfully', async () => {
        const res = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({
            canteenId,
            items: [{ menuItemId, quantity: 2 }],
            paymentMethod: 'UPI',
          });

        expect(res.status).toBe(201);
        expect(res.body.data.items).toHaveLength(1);
        expect(res.body.data.subtotal).toBe(300);
        expect(res.body.data.finalTotal).toBeGreaterThan(0);
        expect(res.body.data.status).toBe('received');
      });

      it('should return 400 for empty order', async () => {
        const res = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({
            canteenId,
            items: [],
            paymentMethod: 'UPI',
          });

        expect(res.status).toBe(400);
      });

      it('should return 401 without auth', async () => {
        const res = await request(app)
          .post('/api/orders')
          .send({
            canteenId,
            items: [{ menuItemId, quantity: 1 }],
            paymentMethod: 'UPI',
          });

        expect(res.status).toBe(401);
      });
    });

    describe('GET /api/orders', () => {
      it('should return paginated orders for the user', async () => {
        // Place an order first
        await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({
            canteenId,
            items: [{ menuItemId, quantity: 1 }],
            paymentMethod: 'UPI',
          });

        const res = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.meta.total).toBe(1);
      });
    });

    describe('GET /api/orders/active', () => {
      it('should return active orders', async () => {
        await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({
            canteenId,
            items: [{ menuItemId, quantity: 1 }],
            paymentMethod: 'UPI',
          });

        const res = await request(app)
          .get('/api/orders/active')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
      });
    });

    describe('PATCH /api/orders/:id/status', () => {
      it('should update order status', async () => {
        const orderRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({
            canteenId,
            items: [{ menuItemId, quantity: 1 }],
            paymentMethod: 'UPI',
          });

        const orderId = orderRes.body.data._id;

        const res = await request(app)
          .patch(`/api/orders/${orderId}/status`)
          .set('Authorization', `Bearer ${token}`)
          .send({ status: 'preparing' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('preparing');
      });

      it('should reject invalid status transitions', async () => {
        const orderRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({
            canteenId,
            items: [{ menuItemId, quantity: 1 }],
            paymentMethod: 'UPI',
          });

        const orderId = orderRes.body.data._id;

        const res = await request(app)
          .patch(`/api/orders/${orderId}/status`)
          .set('Authorization', `Bearer ${token}`)
          .send({ status: 'completed' });

        expect(res.status).toBe(400);
      });
    });

    describe('PATCH /api/orders/:id/cancel', () => {
      it('should cancel a received order', async () => {
        const orderRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({
            canteenId,
            items: [{ menuItemId, quantity: 1 }],
            paymentMethod: 'UPI',
          });

        const orderId = orderRes.body.data._id;

        const res = await request(app)
          .patch(`/api/orders/${orderId}/cancel`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('cancelled');
      });
    });
  });

  // ─── Offers ────────────────────────────────────────────
  describe('Offer Endpoints', () => {
    let token: string;
    let adminToken: string;

    beforeEach(async () => {
      token = (await createUserAndGetToken()).token;
      adminToken = await createAdminAndGetToken();
    });

    describe('GET /api/offers', () => {
      it('should return all active offers', async () => {
        await seedOffer();

        const res = await request(app).get('/api/offers');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].code).toBe(testOffer.code);
      });
    });

    describe('POST /api/offers', () => {
      it('should create offer when admin', async () => {
        const res = await request(app)
          .post('/api/offers')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: 'New Offer',
            discount: '15% Off',
            description: 'New offer description',
            validUntil: '2027-06-01',
            code: 'NEW15',
            gradient: 'from-red-500 to-yellow-500',
          });

        expect(res.status).toBe(201);
        expect(res.body.data.code).toBe('NEW15');
      });

      it('should return 403 when non-admin creates offer', async () => {
        const res = await request(app)
          .post('/api/offers')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: 'User Offer',
            discount: '10% Off',
            description: 'User created',
            validUntil: '2027-01-01',
            code: 'USER10',
          });

        expect(res.status).toBe(403);
      });
    });

    describe('POST /api/offers/claim/:code', () => {
      it('should claim an offer successfully', async () => {
        await seedOffer();

        const res = await request(app)
          .post('/api/offers/claim/TEST20')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('claimed');
      });

      it('should return 404 for non-existent offer', async () => {
        const res = await request(app)
          .post('/api/offers/claim/INVALID')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
      });
    });

    describe('Coupon Endpoints', () => {
      beforeEach(async () => {
        await seedCoupon();
      });

      it('GET /api/offers/coupons should return active coupons', async () => {
        const res = await request(app).get('/api/offers/coupons');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
      });

      it('GET /api/offers/coupons/validate/:code should validate a coupon', async () => {
        const res = await request(app)
          .get('/api/offers/coupons/validate/INTEG10?orderValue=500')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.discountAmount).toBe(50); // 10% of 500
      });

      it('should return 404 for invalid coupon code', async () => {
        const res = await request(app)
          .get('/api/offers/coupons/validate/FAKE123?orderValue=100')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
      });
    });
  });

  // ─── Users ─────────────────────────────────────────────
  describe('User Endpoints', () => {
    let token: string;
    let adminToken: string;

    beforeEach(async () => {
      token = (await createUserAndGetToken()).token;
      adminToken = await createAdminAndGetToken();
    });

    describe('GET /api/users/profile', () => {
      it('should return user profile with stats', async () => {
        const res = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe(testUser.email);
        expect(res.body.data.stats).toBeDefined();
      });
    });

    describe('PATCH /api/users/profile', () => {
      it('should update user profile', async () => {
        const res = await request(app)
          .patch('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Updated Name' });

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('Updated Name');
      });
    });

    describe('POST /api/users/wallet', () => {
      it('should add balance to wallet', async () => {
        const res = await request(app)
          .post('/api/users/wallet')
          .set('Authorization', `Bearer ${token}`)
          .send({ amount: 500 });

        expect(res.status).toBe(200);
        // User model default walletBalance is 120 + 500 added = 620
        expect(res.body.data.walletBalance).toBe(620);
      });

      it('should return 400 for invalid amount', async () => {
        const res = await request(app)
          .post('/api/users/wallet')
          .set('Authorization', `Bearer ${token}`)
          .send({ amount: 0 });

        expect(res.status).toBe(400);
      });
    });

    describe('GET /api/users/orders', () => {
      it('should return paginated user orders', async () => {
        const res = await request(app)
          .get('/api/users/orders')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
      });
    });

    describe('Admin Endpoints', () => {
      it('GET /api/users/admin/stats should return admin stats', async () => {
        const res = await request(app)
          .get('/api/users/admin/stats')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.stats).toMatchObject({
          totalUsers: expect.any(Number),
          totalOrders: expect.any(Number),
          totalCanteens: expect.any(Number),
          totalRevenue: expect.any(Number),
        });
      });

      it('GET /api/users/admin/stats should return 403 for non-admin', async () => {
        const res = await request(app)
          .get('/api/users/admin/stats')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
      });

      it('GET /api/users/admin/users should return paginated users', async () => {
        const res = await request(app)
          .get('/api/users/admin/users')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ─── 404 Handling ──────────────────────────────────────
  describe('404 Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent-route');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Route not found');
    });
  });
});
