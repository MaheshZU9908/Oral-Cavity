import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { authenticateDoctor } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateDoctor);

router.get('/', (req, res, next) => reportController.listReports(req, res, next));
router.get('/:id', (req, res, next) => reportController.getReport(req, res, next));

export default router;
