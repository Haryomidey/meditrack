import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './database/mongoose';
import { logger } from './utils/logger';

const bootstrap = async () => {
  await connectDatabase();

  const app = createApp();
  const server = createServer(app);

  server.listen(env.port, () => {
    logger.info(`MediTrack backend listening on port ${env.port}`);
  });
};

bootstrap().catch((error) => {
  logger.error('Fatal startup failure', error);
  process.exit(1);
});
