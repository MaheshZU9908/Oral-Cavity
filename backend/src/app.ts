import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorMiddleware';
import { apiRateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

export const createApp = (): express.Application => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: [config.frontendUrl, 'http://localhost:3000', 'http://localhost', 'http://localhost:80', 'http://127.0.0.1', 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Static file serving for uploaded biopsy images
  app.use('/uploads', express.static(config.upload.uploadDir));

  // Request logger in development
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });

  // Rate limiter for general API
  app.use('/api', apiRateLimiter);

  // Mount API routes
  app.use('/api', routes);

  // Fallback 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found.',
      code: 'NOT_FOUND',
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
