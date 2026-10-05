import { Router } from 'express';
import { predictionController } from '../controllers/predictionController';
import { authenticateDoctor } from '../middleware/authMiddleware';
import { uploadBiopsyImage } from '../middleware/uploadMiddleware';

const router = Router();

router.use(authenticateDoctor);

router.post('/', uploadBiopsyImage.single('image'), (req, res, next) => predictionController.create(req, res, next));
router.get('/', (req, res, next) => predictionController.list(req, res, next));
router.get('/model-info', (req, res, next) => predictionController.getModelInfo(req, res, next));
router.get('/:id', (req, res, next) => predictionController.getById(req, res, next));
router.get('/patient/:patientId', (req, res, next) => predictionController.getPatientHistory(req, res, next));

export default router;
