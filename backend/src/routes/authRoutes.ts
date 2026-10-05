import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateDoctor } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, (req, res, next) => authController.register(req, res, next));
router.post('/login', authRateLimiter, (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.get('/me', authenticateDoctor, (req, res, next) => authController.getMe(req, res, next));

export default router;
