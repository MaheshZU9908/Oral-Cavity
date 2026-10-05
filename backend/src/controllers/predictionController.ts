import { Request, Response, NextFunction } from 'express';
import { predictionService } from '../services/predictionService';
import { getInferenceService } from '../services/inference';
import { createPredictionSchema, predictionQuerySchema } from '../validators/predictionValidator';
import { ApiError } from '../utils/apiError';

export class PredictionController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw ApiError.badRequest('Biopsy histology image file is required.', 'MISSING_FILE');
      }

      const validated = createPredictionSchema.parse(req.body);
      const prediction = await predictionService.runPrediction(req.doctorId!, {
        patientId: validated.patientId,
        file: req.file,
        clinicalNotes: validated.clinicalNotes,
      });

      res.status(201).json({
        success: true,
        message: 'Biopsy image processed and prediction generated successfully.',
        data: prediction,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = predictionQuerySchema.parse(req.query);
      const result = await predictionService.listPredictions(req.doctorId!, query);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const prediction = await predictionService.getPredictionById(req.doctorId!, id);
      res.status(200).json({
        success: true,
        data: prediction,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPatientHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = String(req.params.patientId);
      const predictions = await predictionService.getPatientPredictions(req.doctorId!, patientId);
      res.status(200).json({
        success: true,
        data: predictions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getModelInfo(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inferenceService = getInferenceService();
      const modelInfo = await inferenceService.getModelInfo();
      const health = await inferenceService.healthCheck();
      res.status(200).json({
        success: true,
        data: {
          ...modelInfo,
          health,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const predictionController = new PredictionController();
