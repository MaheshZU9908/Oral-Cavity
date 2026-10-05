import { Patient } from './patient';
import { Prediction } from './prediction';

export interface DashboardSummary {
  totalPatients: number;
  totalPredictions: number;
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
  };
  recentPatients: Patient[];
  recentPredictions: Prediction[];
  monthlyStats: {
    month: string;
    predictionsCount: number;
    highRiskCount: number;
  }[];
}
