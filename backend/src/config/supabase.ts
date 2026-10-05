import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';
import { logger } from '../utils/logger';
import { createInMemorySupabaseClient } from './inMemoryStore';

let realSupabaseClient: SupabaseClient | null = null;
const inMemoryClient = createInMemorySupabaseClient();
let useInMemory = true;
let isConfiguredInEnv = false;

if (
  config.supabase.url &&
  config.supabase.url !== 'https://placeholder-project.supabase.co' &&
  !config.supabase.url.includes('placeholder') &&
  (config.supabase.serviceRoleKey || config.supabase.anonKey)
) {
  const key = config.supabase.serviceRoleKey || config.supabase.anonKey;
  try {
    realSupabaseClient = createClient(config.supabase.url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    isConfiguredInEnv = true;
    // Initially assume Supabase might work, will be verified during startup
    useInMemory = false;
    logger.info('Supabase client initialized with endpoint: ' + config.supabase.url);
  } catch (err: any) {
    logger.warn('Failed to initialize Supabase client:', err.message);
    useInMemory = true;
  }
} else {
  useInMemory = true;
  logger.info('Supabase URL not configured or using placeholder. In-memory dev database adapter is active.');
}

export const getSupabaseClient = (): any => {
  if (useInMemory || !realSupabaseClient) {
    return inMemoryClient;
  }
  return realSupabaseClient;
};

export const getScopedSupabaseClient = (doctorId?: string): any => {
  if (useInMemory || !realSupabaseClient) {
    return inMemoryClient;
  }
  if (!doctorId || !config.supabase.url || !config.supabase.anonKey) {
    return realSupabaseClient;
  }
  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: {
      headers: {
        'x-doctor-id': doctorId,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const isSupabaseConfigured = (): boolean => !useInMemory && isConfiguredInEnv;

export const testDatabaseConnection = async (): Promise<{ connected: boolean; message: string; mode: 'supabase' | 'in-memory' }> => {
  if (!isConfiguredInEnv || !realSupabaseClient) {
    useInMemory = true;
    return {
      connected: true,
      mode: 'in-memory',
      message: 'In-memory dev database adapter is active with pre-seeded sample data (doctor@hospital.org / Password123!).',
    };
  }

  // Use a strict 3-second timeout for testing Supabase connection
  const timeoutPromise = new Promise<{ connected: boolean; message: string; mode: 'in-memory' }>((resolve) => {
    setTimeout(() => {
      resolve({
        connected: false,
        mode: 'in-memory',
        message: `Connection to Supabase (${config.supabase.url}) timed out after 3000ms. Falling back to in-memory database store.`,
      });
    }, 3000);
  });

  const checkPromise = (async (): Promise<{ connected: boolean; message: string; mode: 'supabase' | 'in-memory' }> => {
    try {
      const { error } = await realSupabaseClient!.from('doctors').select('id').limit(1);
      if (error) {
        if (
          error.message.includes('relation "doctors" does not exist') ||
          error.message.includes('Could not find the table')
        ) {
          return {
            connected: true,
            mode: 'supabase',
            message: 'Connected to Supabase! The SQL schema needs to be executed to create the tables.',
          };
        }
        useInMemory = true;
        return {
          connected: false,
          mode: 'in-memory',
          message: `Supabase returned error (${error.message}). Falling back to in-memory database store.`,
        };
      }
      useInMemory = false;
      return {
        connected: true,
        mode: 'supabase',
        message: 'Successfully connected to Supabase PostgreSQL.',
      };
    } catch (err: any) {
      useInMemory = true;
      return {
        connected: false,
        mode: 'in-memory',
        message: `Failed to connect to Supabase: ${err?.message || 'Network error'}. In-memory store activated.`,
      };
    }
  })();

  const result = await Promise.race([checkPromise, timeoutPromise]);
  if (!result.connected || result.mode === 'in-memory') {
    useInMemory = true;
    logger.warn(`[Database] ${result.message}`);
  } else {
    useInMemory = false;
    logger.info(`[Database] ${result.message}`);
  }

  return result;
};
