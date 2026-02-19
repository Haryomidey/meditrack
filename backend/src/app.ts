import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { env } from './config/env';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

export const createApp = () => {
  const app = express();
  const normalizeOrigin = (origin: string) => origin.replace(/\/$/, '').toLowerCase();
  const allowedOrigins = env.corsOrigins.map(normalizeOrigin);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser clients and same-origin requests with no Origin header.
        if (!origin) {
          callback(null, true);
          return;
        }

        const isAllowed = allowedOrigins.includes(normalizeOrigin(origin));
        callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
      },
      credentials: true,
    }),
  );
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};