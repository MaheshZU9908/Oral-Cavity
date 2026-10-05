import { Router } from 'express';
import authRoutes from './authRoutes';
import patientRoutes from './patientRoutes';
import predictionRoutes from './predictionRoutes';
import dashboardRoutes from './dashboardRoutes';
import profileRoutes from './profileRoutes';
import reportRoutes from './reportRoutes';
import { testDatabaseConnection } from '../config/supabase';
import { getInferenceService } from '../services/inference';

const router = Router();

// Health Check Endpoint
router.get('/health', async (_req, res) => {
  const dbStatus = await testDatabaseConnection();
  const inferenceService = getInferenceService();
  const aiHealth = await inferenceService.healthCheck();

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      aiInference: aiHealth,
    },
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/predictions', predictionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/profile', profileRoutes);
router.use('/reports', reportRoutes);

export default router;
