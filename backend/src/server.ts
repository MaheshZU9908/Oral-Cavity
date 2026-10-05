import { createApp } from './app';
import { config } from './config/env';
import { testDatabaseConnection } from './config/supabase';
import { getInferenceService } from './services/inference';
import { logger } from './utils/logger';

const startServer = async () => {
  const app = createApp();

  logger.info('=====================================================');
  logger.info('  CLINICAL AI DECISION-SUPPORT SYSTEM (MIL) BACKEND  ');
  logger.info('=====================================================');
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Port: ${config.port}`);
  logger.info(`AI Mode: ${config.ai.mode.toUpperCase()}`);

  // Test Database Connection
  const dbStatus = await testDatabaseConnection();
  if (dbStatus.connected) {
    logger.info(`Database: ${dbStatus.message}`);
  } else {
    logger.warn(`Database: ${dbStatus.message}`);
  }

  // Check AI Service status
  const inferenceService = getInferenceService();
  const aiHealth = await inferenceService.healthCheck();
  logger.info(`AI Service: [${aiHealth.mode.toUpperCase()}] ${aiHealth.message}`);

  const server = app.listen(config.port, () => {
    logger.info(`HTTP Server running on http://localhost:${config.port}`);
    logger.info(`API Base Endpoint: http://localhost:${config.port}/api`);
    logger.info(`Health check: http://localhost:${config.port}/api/health`);
  });

  const gracefulShutdown = () => {
    logger.info('Received shutdown signal. Closing HTTP server...');
    server.close(() => {
      logger.info('HTTP server closed. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
