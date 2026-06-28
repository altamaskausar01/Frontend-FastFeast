import jwt from 'jsonwebtoken';
import { generateToken, generateTokenWithUser } from '../../utils/generateToken';

describe('generateToken', () => {
  const testPayload = {
    userId: 'user_123',
    email: 'test@example.com',
    role: 'user' as const,
  };

  it('should generate a valid JWT token', () => {
    const token = generateToken(testPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature
  });

  it('should encode the payload correctly', () => {
    const token = generateToken(testPayload);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret') as any;
    expect(decoded.userId).toBe('user_123');
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.role).toBe('user');
  });

  it('should include an expiration time', () => {
    const token = generateToken(testPayload);
    const decoded = jwt.decode(token) as any;
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('should reject tokens with an invalid secret', () => {
    const token = generateToken(testPayload);
    expect(() => {
      jwt.verify(token, 'wrong-secret');
    }).toThrow();
  });
});

describe('generateTokenWithUser', () => {
  it('should generate a token for a regular user', () => {
    const user = {
      _id: 'user_456',
      email: 'user@example.com',
      isAdmin: false,
      isCanteenOwner: false,
    };

    const token = generateTokenWithUser(user);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret') as any;
    expect(decoded.userId).toBe('user_456');
    expect(decoded.role).toBe('user');
  });

  it('should generate a token for an admin user', () => {
    const user = {
      _id: 'admin_789',
      email: 'admin@example.com',
      isAdmin: true,
      isCanteenOwner: false,
    };

    const token = generateTokenWithUser(user);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret') as any;
    expect(decoded.role).toBe('admin');
  });

  it('should generate a token for a canteen owner', () => {
    const user = {
      _id: 'owner_101',
      email: 'owner@example.com',
      isAdmin: false,
      isCanteenOwner: true,
    };

    const token = generateTokenWithUser(user);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret') as any;
    expect(decoded.role).toBe('canteen_owner');
  });

  it('should handle ObjectId inputs by converting to string', () => {
    const mongoose = require('mongoose');
    const objectId = new mongoose.Types.ObjectId();
    const user = {
      _id: objectId,
      email: 'test@example.com',
      isAdmin: false,
      isCanteenOwner: false,
    };

    const token = generateTokenWithUser(user);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret') as any;
    expect(decoded.userId).toBe(String(objectId));
  });
});
