import { Router } from 'express';
import { profileController } from '../controllers/profileController';
import { authenticateDoctor } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateDoctor);

router.get('/', (req, res, next) => profileController.getProfile(req, res, next));
router.put('/', (req, res, next) => profileController.updateProfile(req, res, next));
router.put('/change-password', (req, res, next) => profileController.changePassword(req, res, next));

export default router;
