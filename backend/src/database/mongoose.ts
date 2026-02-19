import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.mongodbUri, {
    dbName: 'meditrack',
  });

  logger.info('MongoDB connected');
};