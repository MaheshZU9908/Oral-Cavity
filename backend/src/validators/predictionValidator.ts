import { z } from 'zod';

export const createPredictionSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format'),
  clinicalNotes: z.string().max(2000).optional(),
});

export const predictionQuerySchema = z.object({
  patientId: z.string().uuid().optional(),
  riskCategory: z.enum(['LOW', 'MODERATE', 'HIGH']).optional(),
  inferenceMode: z.enum(['demo', 'real']).optional(),
  sortBy: z.enum(['created_at', 'probability', 'risk_category']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
