import dotenv from 'dotenv';

dotenv.config();

const required = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: process.env.MONGODB_URI as string,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};