export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  hospital: string;
  phone?: string;
  professional_id?: string;
  avatar_url?: string;
  notification_preferences: {
    emailAlerts: boolean;
    highRiskAlerts: boolean;
    weeklyReport: boolean;
  };
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  doctor: Doctor;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  specialization?: string;
  qualification?: string;
  hospital?: string;
  phone?: string;
  professionalId?: string;
}
