import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticateDoctor } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateDoctor);

router.get('/summary', (req, res, next) => dashboardController.getSummary(req, res, next));

export default router;
