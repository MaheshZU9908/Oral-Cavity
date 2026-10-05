import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { getScopedSupabaseClient } from '../config/supabase';
import { getInferenceService } from './inference';
import { patientService } from './patientService';
import { ApiError } from '../utils/apiError';
import { Prediction, RiskCategory, InferenceMode, BiopsyImage } from '../types';
import { logger } from '../utils/logger';

export class PredictionService {
  async runPrediction(
    doctorId: string,
    data: {
      patientId: string;
      file: Express.Multer.File;
      clinicalNotes?: string;
    }
  ): Promise<Prediction> {
    const supabase = getScopedSupabaseClient(doctorId);
    const startTime = Date.now();

    // 1. Verify patient exists and belongs to this doctor
    const patient = await patientService.getPatientById(doctorId, data.patientId);

    // 2. Process image file and persist biopsy metadata
    const imageId = uuidv4();
    const biopsyImage: BiopsyImage = {
      id: imageId,
      original_filename: data.file.originalname,
      filename: data.file.filename,
      mime_type: data.file.mimetype,
      file_size: data.file.size,
      storage_path: data.file.path,
      patient_id: patient.id,
      doctor_id: doctorId,
      created_at: new Date().toISOString(),
    };

    const { error: imageErr } = await supabase.from('biopsy_images').insert(biopsyImage);
    if (imageErr) {
      logger.warn(`Failed to insert biopsy_image record: ${imageErr.message}`);
    }

    // 3. Invoke isolated AI Inference Service
    const inferenceService = getInferenceService();
    const inferenceResult = await inferenceService.predict(data.file.path, {
      patientId: patient.patient_id,
      clinicalDiagnosis: patient.diagnosis,
      originalFilename: data.file.originalname,
    });

    // 4. Validate AI response integrity
    if (
      typeof inferenceResult.probability !== 'number' ||
      !['LOW', 'MODERATE', 'HIGH'].includes(inferenceResult.riskCategory)
    ) {
      throw ApiError.inferenceError('Received invalid result structure from the inference layer.');
    }

    const predictionId = uuidv4();
    const totalProcessingTime = Date.now() - startTime;

    const newPrediction: Prediction = {
      id: predictionId,
      patient_id: patient.id,
      doctor_id: doctorId,
      image_id: imageId,
      image_metadata: {
        originalFilename: data.file.originalname,
        filename: data.file.filename,
        fileSize: data.file.size,
        mimeType: data.file.mimetype,
        magnification: '20x Objective',
        staining: 'H&E Staining',
      },
      prediction_result: inferenceResult.predictionResult,
      risk_category: inferenceResult.riskCategory,
      probability: inferenceResult.probability,
      confidence: inferenceResult.confidence,
      model_name: inferenceResult.modelName,
      model_version: inferenceResult.modelVersion,
      inference_mode: inferenceResult.inferenceMode,
      processing_status: 'completed',
      processing_time: totalProcessingTime,
      clinical_notes: data.clinicalNotes || inferenceResult.clinicalNotesSuggestion || '',
      bag_statistics: inferenceResult.bagStatistics,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: created, error: predErr } = await supabase
      .from('predictions')
      .insert(newPrediction)
      .select('*')
      .single();

    if (predErr || !created) {
      throw ApiError.databaseError(`Failed to save prediction: ${predErr?.message || 'Database insert failed'}`);
    }

    // Attach patient data for UI response
    created.patient = patient;

    return created as Prediction;
  }

  async listPredictions(
    doctorId: string,
    params: {
      patientId?: string;
      riskCategory?: RiskCategory;
      inferenceMode?: InferenceMode;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }
  ): Promise<{ predictions: Prediction[]; total: number; page: number; limit: number; totalPages: number }> {
    const supabase = getScopedSupabaseClient(doctorId);
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('predictions')
      .select('*, patient:patients(*)', { count: 'exact' })
      .eq('doctor_id', doctorId);

    if (params.patientId) {
      query = query.eq('patient_id', params.patientId);
    }

    if (params.riskCategory) {
      query = query.eq('risk_category', params.riskCategory);
    }

    if (params.inferenceMode) {
      query = query.eq('inference_mode', params.inferenceMode);
    }

    const sortColumn = params.sortBy || 'created_at';
    const isAsc = params.sortOrder === 'asc';
    query = query.order(sortColumn, { ascending: isAsc }).range(offset, offset + limit - 1);

    const { data: predictions, count, error } = await query;

    if (error) {
      throw ApiError.databaseError(`Failed to list predictions: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      predictions: (predictions || []) as Prediction[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getPredictionById(doctorId: string, id: string): Promise<Prediction> {
    const supabase = getScopedSupabaseClient(doctorId);
    const { data: prediction, error } = await supabase
      .from('predictions')
      .select('*, patient:patients(*)')
      .eq('id', id)
      .eq('doctor_id', doctorId)
      .maybeSingle();

    if (error) {
      throw ApiError.databaseError(`Error retrieving prediction: ${error.message}`);
    }

    if (!prediction) {
      throw ApiError.notFound('Prediction not found or access unauthorized.');
    }

    return prediction as Prediction;
  }

  async getPatientPredictions(doctorId: string, patientId: string): Promise<Prediction[]> {
    // Verify patient ownership
    await patientService.getPatientById(doctorId, patientId);

    const supabase = getScopedSupabaseClient(doctorId);
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('patient_id', patientId)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) {
      throw ApiError.databaseError(`Failed to fetch patient prediction history: ${error.message}`);
    }

    return (predictions || []) as Prediction[];
  }
}

export const predictionService = new PredictionService();
