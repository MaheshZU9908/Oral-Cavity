import { z } from 'zod';

export const createPatientSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (at least 2 characters)').max(150),
  age: z.number().int().min(0, 'Age must be >= 0').max(130, 'Age must be <= 130'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Gender must be Male, Female, or Other' }),
  }),
  contact: z.string().max(100).optional().default(''),
  clinicalHistory: z.string().max(2000).optional().default(''),
  diagnosis: z.string().min(2, 'Diagnosis is required').max(500),
  biopsyInformation: z.string().max(1000).optional().default(''),
});

export const updatePatientSchema = createPatientSchema.partial();

export const patientQuerySchema = z.object({
  search: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  sortBy: z.enum(['full_name', 'age', 'date_added', 'created_at']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
