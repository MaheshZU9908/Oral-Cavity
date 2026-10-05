import { getSupabaseClient } from '../config/supabase';
import { patientService } from './patientService';
import { profileService } from './profileService';
import { ApiError } from '../utils/apiError';
import { PredictionReportData, Prediction, PredictionSummary } from '../types';

export class ReportService {
  async getPredictionReport(doctorId: string, predictionId: string): Promise<PredictionReportData> {
    const supabase = getSupabaseClient();

    // 1. Get current prediction
    const { data: prediction, error: predErr } = await supabase
      .from('predictions')
      .select('*')
      .eq('id', predictionId)
      .eq('doctor_id', doctorId)
      .maybeSingle();

    if (predErr || !prediction) {
      throw ApiError.notFound('Prediction report not found or access unauthorized.');
    }

    // 2. Get patient and doctor details
    const patient = await patientService.getPatientById(doctorId, prediction.patient_id);
    const doctor = await profileService.getProfile(doctorId);

    // 3. Find immediately preceding prediction for comparison (if any)
    const { data: prevPreds } = await supabase
      .from('predictions')
      .select('id, risk_category, probability, created_at')
      .eq('patient_id', prediction.patient_id)
      .eq('doctor_id', doctorId)
      .lt('created_at', prediction.created_at)
      .order('created_at', { ascending: false })
      .limit(1);

    let previousPrediction: PredictionSummary | null = null;
    if (prevPreds && prevPreds.length > 0) {
      previousPrediction = {
        id: prevPreds[0].id,
        risk_category: prevPreds[0].risk_category,
        probability: Number(prevPreds[0].probability),
        created_at: prevPreds[0].created_at,
      };
    }

    return {
      currentPrediction: prediction as Prediction,
      patient,
      doctor,
      previousPrediction,
    };
  }

  async listAllReports(
    doctorId: string,
    params: {
      search?: string;
      riskCategory?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ reports: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const supabase = getSupabaseClient();
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('predictions')
      .select('id, patient_id, risk_category, probability, confidence, model_name, model_version, inference_mode, created_at, patient:patients(full_name, patient_id, diagnosis, age, gender)', { count: 'exact' })
      .eq('doctor_id', doctorId);

    if (params.riskCategory) {
      query = query.eq('risk_category', params.riskCategory);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: reports, count, error } = await query;

    if (error) {
      throw ApiError.databaseError(`Failed to fetch reports: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      reports: reports || [],
      total,
      page,
      limit,
      totalPages,
    };
  }
}

export const reportService = new ReportService();
