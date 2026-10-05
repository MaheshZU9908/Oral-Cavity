import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'clinical_ai_default_secret_change_in_production_key_38472948',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  ai: {
    mode: (process.env.AI_MODE || 'demo').toLowerCase() as 'demo' | 'real',
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '15000', 10),
  },
  upload: {
    maxSize: parseInt(process.env.MAX_UPLOAD_SIZE || '52428800', 10), // 50MB
    uploadDir: path.resolve(__dirname, '../../uploads'),
  },
};
