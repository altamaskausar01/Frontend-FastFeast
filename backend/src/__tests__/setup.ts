import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Set JWT secret for tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/fastfeast-test';
process.env.NODE_ENV = 'test';

// Increase rate limit for tests to avoid hitting limits during integration test runs
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';

// ─── Global Mocks ──────────────────────────────────────

// Mock console.error to keep test output clean
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock console.log to keep test output clean
jest.spyOn(console, 'log').mockImplementation(() => {});
