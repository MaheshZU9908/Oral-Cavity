import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface InMemoryTables {
  doctors: any[];
  patients: any[];
  predictions: any[];
  biopsy_images: any[];
}

// Pre-computed hash for 'Password123!' with salt rounds 10
const DEMO_PASSWORD_HASH = bcrypt.hashSync('Password123!', 10);
export const DEMO_DOCTOR_ID = 'd1000000-0000-0000-0000-000000000001';

export const inMemoryStore: InMemoryTables = {
  doctors: [
    {
      id: DEMO_DOCTOR_ID,
      name: 'Dr. Sarah Mitchell, MD',
      email: 'doctor@hospital.org',
      password_hash: DEMO_PASSWORD_HASH,
      specialization: 'Histopathology / Oncology',
      qualification: 'MD, FRCPath',
      hospital: 'Metropolitan University Medical Center',
      phone: '+1 (555) 234-8765',
      professional_id: 'MD-89421-ONC',
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      notification_preferences: {
        emailAlerts: true,
        highRiskAlerts: true,
        weeklyReport: true,
      },
      last_login_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  patients: [
    {
      id: 'p1000000-0000-0000-0000-000000000001',
      patient_id: 'PT-4821',
      doctor_id: DEMO_DOCTOR_ID,
      full_name: 'Eleanor Vance',
      age: 58,
      gender: 'Female',
      contact: '+1 (555) 432-8899',
      clinical_history: 'T2N0M0 right breast invasive ductal carcinoma status post lumpectomy. SLNB requested.',
      diagnosis: 'Invasive Ductal Carcinoma (Grade 3)',
      biopsy_information: 'Right sentinel lymph node biopsy, 3 core tissue samples examined.',
      date_added: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: 'p1000000-0000-0000-0000-000000000002',
      patient_id: 'PT-7392',
      doctor_id: DEMO_DOCTOR_ID,
      full_name: 'Robert Chen',
      age: 64,
      gender: 'Male',
      contact: '+1 (555) 781-9922',
      clinical_history: 'Lateral tongue ulceration for 3 months. Suspected regional lymph node involvement.',
      diagnosis: 'Oral Squamous Cell Carcinoma',
      biopsy_information: 'Ipsilateral cervical level II lymph node excision.',
      date_added: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: 'p1000000-0000-0000-0000-000000000003',
      patient_id: 'PT-1945',
      doctor_id: DEMO_DOCTOR_ID,
      full_name: 'Margaret Thorne',
      age: 51,
      gender: 'Female',
      contact: '+1 (555) 902-1144',
      clinical_history: 'Superficial spreading melanoma left scapula, Breslow depth 2.8mm, ulcerated.',
      diagnosis: 'Cutaneous Malignant Melanoma',
      biopsy_information: 'Left axillary sentinel lymph node biopsy (2 nodes).',
      date_added: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
  predictions: [
    {
      id: 'pred-1000000-0000-0000-0000-000000000001',
      patient_id: 'p1000000-0000-0000-0000-000000000001',
      doctor_id: DEMO_DOCTOR_ID,
      image_id: 'img-1000000-0000-0000-0000-000000000001',
      image_metadata: {
        originalFilename: 'sentinel_node_core1_he.tif',
        filename: 'sentinel_node_core1_he.tif',
        fileSize: 4210500,
        mimeType: 'image/tiff',
        magnification: '20x Objective',
        staining: 'H&E Staining',
      },
      prediction_result: 'Positive for Nodal Metastasis',
      risk_category: 'HIGH',
      probability: 0.8742,
      confidence: 0.912,
      model_name: 'MIL-NodalMetastasis-CLAM',
      model_version: 'v2.0.0',
      inference_mode: 'real',
      processing_status: 'completed',
      processing_time: 1420,
      clinical_notes: 'Dense high-attention micro-clusters localized in subcapsular sinus regions.',
      bag_statistics: {
        totalPatches: 184,
        highAttentionPatches: 28,
        topFeatureScore: 0.942,
        aggregationType: 'Real Multi-Instance Learning Attention Pooling',
      },
      created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    },
    {
      id: 'pred-1000000-0000-0000-0000-000000000002',
      patient_id: 'p1000000-0000-0000-0000-000000000002',
      doctor_id: DEMO_DOCTOR_ID,
      image_id: 'img-1000000-0000-0000-0000-000000000002',
      image_metadata: {
        originalFilename: 'cervical_node_biopsy_sample.jpg',
        filename: 'cervical_node_biopsy_sample.jpg',
        fileSize: 3120000,
        mimeType: 'image/jpeg',
        magnification: '20x Objective',
        staining: 'H&E Staining',
      },
      prediction_result: 'Intermediate / Suspicious for Micro-metastasis',
      risk_category: 'MODERATE',
      probability: 0.542,
      confidence: 0.835,
      model_name: 'MIL-NodalMetastasis-CLAM',
      model_version: 'v2.0.0',
      inference_mode: 'real',
      processing_status: 'completed',
      processing_time: 1180,
      clinical_notes: 'Moderate attention activation around paracortical lymphoid follicles.',
      bag_statistics: {
        totalPatches: 142,
        highAttentionPatches: 12,
        topFeatureScore: 0.612,
        aggregationType: 'Real Multi-Instance Learning Attention Pooling',
      },
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'pred-1000000-0000-0000-0000-000000000003',
      patient_id: 'p1000000-0000-0000-0000-000000000003',
      doctor_id: DEMO_DOCTOR_ID,
      image_id: 'img-1000000-0000-0000-0000-000000000003',
      image_metadata: {
        originalFilename: 'axillary_sln_sample.png',
        filename: 'axillary_sln_sample.png',
        fileSize: 2890000,
        mimeType: 'image/png',
        magnification: '20x Objective',
        staining: 'H&E Staining',
      },
      prediction_result: 'Negative for Nodal Metastasis (Benign Reactive Node)',
      risk_category: 'LOW',
      probability: 0.089,
      confidence: 0.941,
      model_name: 'MIL-NodalMetastasis-CLAM',
      model_version: 'v2.0.0',
      inference_mode: 'real',
      processing_status: 'completed',
      processing_time: 1050,
      clinical_notes: 'Diffuse uniform attention distribution. Benign follicular hyperplasia observed.',
      bag_statistics: {
        totalPatches: 160,
        highAttentionPatches: 2,
        topFeatureScore: 0.14,
        aggregationType: 'Real Multi-Instance Learning Attention Pooling',
      },
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
  biopsy_images: [],
};

/**
 * Creates an in-memory query builder simulating the Supabase JavaScript API.
 */
export const createInMemorySupabaseClient = () => {
  return {
    from: (tableName: string) => {
      let selectClause: string | undefined = undefined;
      let countOption: string | null = null;
      let isHead = false;
      const filters: Array<(item: any) => boolean> = [];
      let sortColumn: string | null = null;
      let sortAscending = true;
      let rangeStart: number | null = null;
      let rangeEnd: number | null = null;
      let limitCount: number | null = null;
      let pendingUpdates: any = null;
      let isDelete = false;

      const getTable = (): any[] => {
        if (!inMemoryStore[tableName as keyof InMemoryTables]) {
          inMemoryStore[tableName as keyof InMemoryTables] = [];
        }
        return inMemoryStore[tableName as keyof InMemoryTables];
      };

      const formatRow = (row: any, selectStr?: string): any => {
        if (!row) return null;
        const copy = { ...row };

        // Handle joins
        if (selectStr) {
          if (selectStr.includes('patient:patients')) {
            const patient = inMemoryStore.patients.find(p => p.id === copy.patient_id);
            if (selectStr.includes('patient:patients(')) {
              // subfield projection
              copy.patient = patient
                ? {
                    full_name: patient.full_name,
                    patient_id: patient.patient_id,
                    diagnosis: patient.diagnosis,
                    age: patient.age,
                    gender: patient.gender,
                  }
                : null;
            } else {
              copy.patient = patient || null;
            }
          }
          if (selectStr.includes('doctor:doctors')) {
            const doctor = inMemoryStore.doctors.find(d => d.id === copy.doctor_id);
            copy.doctor = doctor
              ? {
                  id: doctor.id,
                  name: doctor.name,
                  email: doctor.email,
                  specialization: doctor.specialization,
                  qualification: doctor.qualification,
                  hospital: doctor.hospital,
                }
              : null;
          }
        }
        return copy;
      };

      const executeQuery = () => {
        let rows = [...getTable()];

        // Apply filters
        for (const filter of filters) {
          rows = rows.filter(filter);
        }

        // Apply sort
        if (sortColumn) {
          rows.sort((a, b) => {
            const valA = a[sortColumn!];
            const valB = b[sortColumn!];
            if (valA < valB) return sortAscending ? -1 : 1;
            if (valA > valB) return sortAscending ? 1 : -1;
            return 0;
          });
        }

        const totalCount = rows.length;

        // Apply limit / range
        if (rangeStart !== null && rangeEnd !== null) {
          rows = rows.slice(rangeStart, rangeEnd + 1);
        } else if (limitCount !== null) {
          rows = rows.slice(0, limitCount);
        }

        const mapped = isHead ? [] : rows.map(r => formatRow(r, selectClause));
        return { data: mapped, count: totalCount, error: null };
      };

      const builder: any = {
        select: (columns = '*', options?: { count?: 'exact'; head?: boolean }) => {
          selectClause = columns;
          if (options?.count) countOption = options.count;
          if (options?.head) isHead = options.head;
          return builder;
        },
        eq: (column: string, value: any) => {
          filters.push((item: any) => item[column] === value);
          return builder;
        },
        neq: (column: string, value: any) => {
          filters.push((item: any) => item[column] !== value);
          return builder;
        },
        in: (column: string, values: any[]) => {
          filters.push((item: any) => values.includes(item[column]));
          return builder;
        },
        lt: (column: string, value: any) => {
          filters.push((item: any) => item[column] < value);
          return builder;
        },
        lte: (column: string, value: any) => {
          filters.push((item: any) => item[column] <= value);
          return builder;
        },
        gt: (column: string, value: any) => {
          filters.push((item: any) => item[column] > value);
          return builder;
        },
        gte: (column: string, value: any) => {
          filters.push((item: any) => item[column] >= value);
          return builder;
        },
        or: (orClause: string) => {
          // Parse format: "full_name.ilike.%query%,patient_id.ilike.%query%,diagnosis.ilike.%query%"
          const conditions = orClause.split(',').map(c => {
            const parts = c.split('.ilike.');
            if (parts.length === 2) {
              const field = parts[0];
              const pattern = parts[1].replace(/%/g, '').toLowerCase();
              return (item: any) => String(item[field] || '').toLowerCase().includes(pattern);
            }
            return (_item: any) => true;
          });

          filters.push((item: any) => conditions.some(fn => fn(item)));
          return builder;
        },
        order: (column: string, options?: { ascending?: boolean }) => {
          sortColumn = column;
          sortAscending = options?.ascending ?? true;
          return builder;
        },
        range: (start: number, end: number) => {
          rangeStart = start;
          rangeEnd = end;
          return builder;
        },
        limit: (count: number) => {
          limitCount = count;
          return builder;
        },
        single: async () => {
          const res = executeQuery();
          if (!res.data || res.data.length === 0) {
            return { data: null, error: { message: 'Row not found' } };
          }
          return { data: res.data[0], error: null };
        },
        maybeSingle: async () => {
          const res = executeQuery();
          if (!res.data || res.data.length === 0) {
            return { data: null, error: null };
          }
          return { data: res.data[0], error: null };
        },
        then: (resolve: any, reject: any) => {
          try {
            if (isDelete) {
              const table = getTable();
              const remaining = table.filter(item => !filters.every(f => f(item)));
              inMemoryStore[tableName as keyof InMemoryTables] = remaining;
              resolve({ data: null, error: null });
              return;
            }
            if (pendingUpdates) {
              const table = getTable();
              let updatedItem: any = null;
              for (let i = 0; i < table.length; i++) {
                if (filters.every(f => f(table[i]))) {
                  table[i] = { ...table[i], ...pendingUpdates, updated_at: new Date().toISOString() };
                  updatedItem = table[i];
                }
              }
              resolve({ data: updatedItem, error: null });
              return;
            }
            const res = executeQuery();
            resolve(res);
          } catch (err) {
            if (reject) reject(err);
            else resolve({ data: null, error: err });
          }
        },
        insert: (records: any | any[]) => {
          const items = Array.isArray(records) ? records : [records];
          const table = getTable();
          const createdList = items.map(item => ({
            ...item,
            id: item.id || uuidv4(),
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
          }));
          table.push(...createdList);

          return {
            select: (_cols?: string) => ({
              single: async () => ({ data: formatRow(createdList[0], _cols), error: null }),
              then: (resolve: any) => resolve({ data: createdList.map(r => formatRow(r, _cols)), error: null }),
            }),
            then: (resolve: any) => resolve({ data: createdList, error: null }),
          };
        },
        update: (updates: any) => {
          pendingUpdates = updates;
          return {
            eq: (column: string, value: any) => {
              filters.push((item: any) => item[column] === value);
              return {
                select: (_cols?: string) => ({
                  single: async () => {
                    const table = getTable();
                    let updatedRow: any = null;
                    for (let i = 0; i < table.length; i++) {
                      if (filters.every(f => f(table[i]))) {
                        table[i] = { ...table[i], ...updates, updated_at: new Date().toISOString() };
                        updatedRow = table[i];
                      }
                    }
                    return { data: formatRow(updatedRow, _cols), error: updatedRow ? null : { message: 'Row not found' } };
                  },
                }),
                then: (resolve: any) => {
                  const table = getTable();
                  let updatedRow: any = null;
                  for (let i = 0; i < table.length; i++) {
                    if (filters.every(f => f(table[i]))) {
                      table[i] = { ...table[i], ...updates, updated_at: new Date().toISOString() };
                      updatedRow = table[i];
                    }
                  }
                  resolve({ data: updatedRow, error: null });
                },
              };
            },
          };
        },
        delete: () => {
          isDelete = true;
          return {
            eq: (column: string, value: any) => {
              filters.push((item: any) => item[column] === value);
              return {
                eq: (c2: string, v2: any) => {
                  filters.push((item: any) => item[c2] === v2);
                  return {
                    then: (resolve: any) => {
                      const table = getTable();
                      const remaining = table.filter(item => !filters.every(f => f(item)));
                      inMemoryStore[tableName as keyof InMemoryTables] = remaining;
                      resolve({ data: null, error: null });
                    },
                  };
                },
                then: (resolve: any) => {
                  const table = getTable();
                  const remaining = table.filter(item => !filters.every(f => f(item)));
                  inMemoryStore[tableName as keyof InMemoryTables] = remaining;
                  resolve({ data: null, error: null });
                },
              };
            },
          };
        },
      };

      return builder;
    },
  } as any;
};
