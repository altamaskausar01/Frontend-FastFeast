import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  nodeEnv: string;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: parseInt(getEnvVar('PORT', '5000'), 10),
  mongoUri: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/fastfeast'),
  jwtSecret: getEnvVar('JWT_SECRET', 'fastfeast-dev-secret'),
  jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
  corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
  rateLimitWindowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  rateLimitMaxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
};

export const isDev = env.nodeEnv === 'development';
export const isProd = env.nodeEnv === 'production';
