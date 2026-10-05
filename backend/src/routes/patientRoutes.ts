import { Router } from 'express';
import { patientController } from '../controllers/patientController';
import { authenticateDoctor } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateDoctor);

router.get('/', (req, res, next) => patientController.list(req, res, next));
router.get('/:id', (req, res, next) => patientController.getById(req, res, next));
router.post('/', (req, res, next) => patientController.create(req, res, next));
router.put('/:id', (req, res, next) => patientController.update(req, res, next));
router.delete('/:id', (req, res, next) => patientController.delete(req, res, next));

export default router;
