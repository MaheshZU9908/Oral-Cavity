import request from 'supertest';
import { createApp } from '../src/app';

// Mock Supabase database in-memory for fast and reliable integration testing
const inMemoryTables: Record<string, any[]> = {
  doctors: [],
  patients: [],
  predictions: [],
  biopsy_images: [],
};

const getMockClient = () => ({
  from: (table: string) => {
    let currentData = [...(inMemoryTables[table] || [])];
    let selectFields = '*';
    let isSingle = false;
    let isMaybeSingle = false;
    let countMode: string | null = null;
    let filters: Array<(item: any) => boolean> = [];
    let sortCol: string | null = null;
    let sortAsc = true;
    let rangeStart = 0;
    let rangeEnd = 999;

    const builder: any = {
      select: (fields = '*', options?: any) => {
        selectFields = fields;
        if (options?.count) countMode = options.count;
        return builder;
      },
      eq: (column: string, value: any) => {
        filters.push((item: any) => item[column] === value);
        return builder;
      },
      in: (column: string, values: any[]) => {
        filters.push((item: any) => values.includes(item[column]));
        return builder;
      },
      or: (_clause: string) => {
        return builder;
      },
      lt: (column: string, value: any) => {
        filters.push((item: any) => item[column] < value);
        return builder;
      },
      order: (column: string, options?: any) => {
        sortCol = column;
        sortAsc = options?.ascending ?? true;
        return builder;
      },
      range: (start: number, end: number) => {
        rangeStart = start;
        rangeEnd = end;
        return builder;
      },
      limit: (n: number) => {
        rangeEnd = rangeStart + n - 1;
        return builder;
      },
      single: async () => {
        let res = currentData.filter(item => filters.every(f => f(item)));
        if (res.length === 0) return { data: null, error: { message: 'Row not found' } };
        return { data: res[0], error: null };
      },
      maybeSingle: async () => {
        let res = currentData.filter(item => filters.every(f => f(item)));
        return { data: res.length > 0 ? res[0] : null, error: null };
      },
      insert: (records: any | any[]) => {
        const list = Array.isArray(records) ? records : [records];
        if (!inMemoryTables[table]) inMemoryTables[table] = [];
        list.forEach(r => inMemoryTables[table].push(r));
        return {
          select: () => ({
            single: async () => ({ data: list[0], error: null }),
          }),
        };
      },
      update: (updates: any) => {
        return {
          eq: (col1: string, val1: any) => ({
            eq: (col2: string, val2: any) => ({
              select: () => ({
                single: async () => {
                  const idx = (inMemoryTables[table] || []).findIndex(
                    i => i[col1] === val1 && i[col2] === val2
                  );
                  if (idx >= 0) {
                    inMemoryTables[table][idx] = { ...inMemoryTables[table][idx], ...updates };
                    return { data: inMemoryTables[table][idx], error: null };
                  }
                  return { data: null, error: { message: 'Row not found' } };
                },
              }),
            }),
            select: () => ({
              single: async () => {
                const idx = (inMemoryTables[table] || []).findIndex(i => i[col1] === val1);
                if (idx >= 0) {
                  inMemoryTables[table][idx] = { ...inMemoryTables[table][idx], ...updates };
                  return { data: inMemoryTables[table][idx], error: null };
                }
                return { data: null, error: { message: 'Row not found' } };
              },
            }),
          }),
        };
      },
      delete: () => ({
        eq: (col1: string, val1: any) => ({
          eq: async (col2: string, val2: any) => {
            inMemoryTables[table] = (inMemoryTables[table] || []).filter(
              i => !(i[col1] === val1 && i[col2] === val2)
            );
            return { error: null };
          },
        }),
      }),
      then: (resolve: any) => {
        let res = currentData.filter(item => filters.every(f => f(item)));
        const count = res.length;
        res = res.slice(rangeStart, rangeEnd + 1);
        return resolve({ data: res, count, error: null });
      },
    };

    return builder;
  },
});

jest.mock('../src/config/supabase', () => ({
  getSupabaseClient: () => getMockClient(),
  getScopedSupabaseClient: () => getMockClient(),
  testDatabaseConnection: async () => ({ connected: true, message: 'Mock in-memory connection ready.' }),
  isSupabaseConfigured: () => true,
}));

describe('Clinical AI Backend Integration Tests', () => {
  const app = createApp();
  let doctorToken: string;
  let doctorId: string;
  let patientId: string;

  beforeEach(() => {
    // Reset mock in-memory tables
    inMemoryTables.doctors = [];
    inMemoryTables.patients = [];
    inMemoryTables.predictions = [];
    inMemoryTables.biopsy_images = [];
  });

  describe('1. Authentication API', () => {
    it('should register a new doctor successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Dr. Evelyn Reed',
          email: 'evelyn.reed@hospital.org',
          password: 'Password123!',
          specialization: 'Surgical Histopathology',
          hospital: 'St. Jude Clinical Research',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.doctor.email).toBe('evelyn.reed@hospital.org');
      expect(res.body.data.token).toBeDefined();

      doctorToken = res.body.data.token;
      doctorId = res.body.data.doctor.id;
    });

    it('should login with valid credentials', async () => {
      // First register
      await request(app).post('/api/auth/register').send({
        name: 'Dr. Evelyn Reed',
        email: 'evelyn.reed@hospital.org',
        password: 'Password123!',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'evelyn.reed@hospital.org',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject invalid password', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Dr. Evelyn Reed',
        email: 'evelyn.reed@hospital.org',
        password: 'Password123!',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'evelyn.reed@hospital.org',
          password: 'WrongPassword999',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return current doctor profile with valid token', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        name: 'Dr. Evelyn Reed',
        email: 'evelyn.reed@hospital.org',
        password: 'Password123!',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${reg.body.data.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('evelyn.reed@hospital.org');
    });
  });

  describe('2. Patient Management & Authorization Scoping', () => {
    beforeEach(async () => {
      const reg = await request(app).post('/api/auth/register').send({
        name: 'Dr. Evelyn Reed',
        email: 'evelyn.reed@hospital.org',
        password: 'Password123!',
      });
      doctorToken = reg.body.data.token;
      doctorId = reg.body.data.doctor.id;
    });

    it('should create a new patient record', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          fullName: 'Johnathan Doe',
          age: 58,
          gender: 'Male',
          diagnosis: 'Invasive Ductal Carcinoma (cT2N0M0)',
          clinicalHistory: 'Prior lumpectomy. Referred for sentinel lymph node evaluation.',
          contact: '+1 555-0199',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.full_name).toBe('Johnathan Doe');
      expect(res.body.data.patient_id).toMatch(/^PT-/);

      patientId = res.body.data.id;
    });

    it('should list doctor patients and allow pagination and filtering', async () => {
      // Create patient
      await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          fullName: 'Jane Smith',
          age: 49,
          gender: 'Female',
          diagnosis: 'Melanoma Breslow 2.1mm',
        });

      const res = await request(app)
        .get('/api/patients?limit=10&page=1')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.patients.length).toBe(1);
      expect(res.body.data.total).toBe(1);
    });

    it('should prevent unauthenticated access to patient list', async () => {
      const res = await request(app).get('/api/patients');
      expect(res.status).toBe(401);
    });
  });

  describe('3. Multi-Instance Learning Prediction & Report Workflow', () => {
    beforeEach(async () => {
      const reg = await request(app).post('/api/auth/register').send({
        name: 'Dr. Evelyn Reed',
        email: 'evelyn.reed@hospital.org',
        password: 'Password123!',
      });
      doctorToken = reg.body.data.token;
      doctorId = reg.body.data.doctor.id;

      const pRes = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          fullName: 'Robert Vance',
          age: 64,
          gender: 'Male',
          diagnosis: 'High-grade squamous cell carcinoma',
        });
      patientId = pRes.body.data.id;
    });

    it('should execute MIL inference, validate image, and save prediction', async () => {
      const dummyPngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const res = await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .field('patientId', patientId)
        .field('clinicalNotes', 'Axillary lymph node needle core biopsy specimen.')
        .attach('image', dummyPngBuffer, 'biopsy_slide_01.png');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.risk_category).toBeDefined();
      expect(['LOW', 'MODERATE', 'HIGH']).toContain(res.body.data.risk_category);
      expect(res.body.data.probability).toBeGreaterThanOrEqual(0);
      expect(res.body.data.probability).toBeLessThanOrEqual(1);
      expect(res.body.data.bag_statistics.totalPatches).toBeGreaterThan(0);
      expect(['real', 'demo']).toContain(res.body.data.inference_mode);
    });
  });

  describe('4. Cross-Doctor Multi-Tenant Security & Isolation Tests', () => {
    let doctorAToken: string;
    let doctorBToken: string;
    let doctorAPatientId: string;
    let doctorAPredictionId: string;

    beforeEach(async () => {
      // Register Doctor A
      const regA = await request(app).post('/api/auth/register').send({
        name: 'Dr. Alice Morgan',
        email: 'alice.morgan@hospital.org',
        password: 'Password123!',
      });
      doctorAToken = regA.body.data.token;

      // Register Doctor B
      const regB = await request(app).post('/api/auth/register').send({
        name: 'Dr. Bob Henderson',
        email: 'bob.henderson@hospital.org',
        password: 'Password123!',
      });
      doctorBToken = regB.body.data.token;

      // Doctor A creates a patient
      const pRes = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${doctorAToken}`)
        .send({
          fullName: 'Alice Patient',
          age: 45,
          gender: 'Female',
          diagnosis: 'Invasive Lobular Carcinoma',
        });
      doctorAPatientId = pRes.body.data.id;

      // Doctor A runs a prediction
      const dummyPngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      const predRes = await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${doctorAToken}`)
        .field('patientId', doctorAPatientId)
        .attach('image', dummyPngBuffer, 'alice_slide.png');
      doctorAPredictionId = predRes.body.data.id;
    });

    it('should prevent Doctor B from accessing Doctor A patient by ID', async () => {
      const res = await request(app)
        .get(`/api/patients/${doctorAPatientId}`)
        .set('Authorization', `Bearer ${doctorBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should prevent Doctor B from updating Doctor A patient', async () => {
      const res = await request(app)
        .put(`/api/patients/${doctorAPatientId}`)
        .set('Authorization', `Bearer ${doctorBToken}`)
        .send({ fullName: 'Malicious Overwrite' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should prevent Doctor B from deleting Doctor A patient', async () => {
      const res = await request(app)
        .delete(`/api/patients/${doctorAPatientId}`)
        .set('Authorization', `Bearer ${doctorBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should prevent Doctor B from running predictions on Doctor A patient', async () => {
      const dummyPngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      const res = await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${doctorBToken}`)
        .field('patientId', doctorAPatientId)
        .attach('image', dummyPngBuffer, 'unauthorized_slide.png');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should prevent Doctor B from viewing Doctor A prediction by ID', async () => {
      const res = await request(app)
        .get(`/api/predictions/${doctorAPredictionId}`)
        .set('Authorization', `Bearer ${doctorBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should ignore client-forged x-doctor-id headers and enforce verified JWT identity', async () => {
      const res = await request(app)
        .get(`/api/patients/${doctorAPatientId}`)
        .set('Authorization', `Bearer ${doctorBToken}`)
        .set('x-doctor-id', 'spoofed-doctor-uuid-attempt');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should isolate dashboard KPIs completely between doctors', async () => {
      const resB = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${doctorBToken}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.totalPatients).toBe(0);
      expect(resB.body.data.totalPredictions).toBe(0);
      expect(resB.body.data.recentPatients.length).toBe(0);
      expect(resB.body.data.recentPredictions.length).toBe(0);
    });
  });
});
