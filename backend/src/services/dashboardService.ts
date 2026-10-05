import { getScopedSupabaseClient } from '../config/supabase';
import { ApiError } from '../utils/apiError';
import { DashboardSummary, Patient, Prediction } from '../types';

export class DashboardService {
  async getSummary(doctorId: string): Promise<DashboardSummary> {
    const supabase = getScopedSupabaseClient(doctorId);

    // 1. Total patients count
    const { count: totalPatients, error: pCountErr } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', doctorId);

    if (pCountErr) {
      throw ApiError.databaseError(`Failed to fetch patients count: ${pCountErr.message}`);
    }

    // 2. Total predictions count
    const { count: totalPredictions, error: predCountErr } = await supabase
      .from('predictions')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', doctorId);

    if (predCountErr) {
      throw ApiError.databaseError(`Failed to fetch predictions count: ${predCountErr.message}`);
    }

    // 3. Risk breakdown
    const { data: riskRows, error: riskErr } = await supabase
      .from('predictions')
      .select('risk_category, created_at')
      .eq('doctor_id', doctorId);

    if (riskErr) {
      throw ApiError.databaseError(`Failed to fetch risk distribution: ${riskErr.message}`);
    }

    let highRiskCount = 0;
    let moderateRiskCount = 0;
    let lowRiskCount = 0;

    const monthMap = new Map<string, { count: number; highRisk: number }>();

    (riskRows || []).forEach((row: any) => {
      if (row.risk_category === 'HIGH') highRiskCount++;
      else if (row.risk_category === 'MODERATE') moderateRiskCount++;
      else if (row.risk_category === 'LOW') lowRiskCount++;

      // Monthly aggregation
      const date = new Date(row.created_at);
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      const current = monthMap.get(monthKey) || { count: 0, highRisk: 0 };
      current.count += 1;
      if (row.risk_category === 'HIGH') current.highRisk += 1;
      monthMap.set(monthKey, current);
    });

    // 4. Recent Patients (top 5)
    const { data: recentPatients } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .limit(5);

    // 5. Recent Predictions with patient info (top 5)
    const { data: recentPredictions } = await supabase
      .from('predictions')
      .select('*, patient:patients(*)')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .limit(5);

    const monthlyStats = Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      predictionsCount: data.count,
      highRiskCount: data.highRisk,
    }));

    return {
      totalPatients: totalPatients || 0,
      totalPredictions: totalPredictions || 0,
      highRiskCount,
      moderateRiskCount,
      lowRiskCount,
      riskDistribution: {
        low: lowRiskCount,
        moderate: moderateRiskCount,
        high: highRiskCount,
      },
      recentPatients: (recentPatients || []) as Patient[],
      recentPredictions: (recentPredictions || []) as Prediction[],
      monthlyStats,
    };
  }
}

export const dashboardService = new DashboardService();
