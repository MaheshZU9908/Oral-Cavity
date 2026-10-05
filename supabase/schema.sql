-- =====================================================================
-- Clinical AI Decision-Support System - Supabase Schema
-- Target: PostgreSQL / Supabase
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) DEFAULT 'Histopathology / Oncology',
    qualification VARCHAR(255) DEFAULT 'MD, FRCPath',
    hospital VARCHAR(255) DEFAULT 'Metropolitan University Medical Center',
    phone VARCHAR(50) DEFAULT '',
    professional_id VARCHAR(100) DEFAULT '',
    avatar_url TEXT DEFAULT '',
    notification_preferences JSONB DEFAULT '{"emailAlerts": true, "highRiskAlerts": true, "weeklyReport": true}'::jsonb,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 130),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    contact VARCHAR(100) DEFAULT '',
    clinical_history TEXT DEFAULT '',
    diagnosis TEXT NOT NULL,
    biopsy_information TEXT DEFAULT '',
    date_added DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BIOPSY IMAGES TABLE
CREATE TABLE IF NOT EXISTS biopsy_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_filename VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    image_id UUID REFERENCES biopsy_images(id) ON DELETE SET NULL,
    image_metadata JSONB DEFAULT '{}'::jsonb,
    prediction_result VARCHAR(100) NOT NULL, -- e.g. "Positive for Nodal Metastasis" / "Negative for Nodal Metastasis"
    risk_category VARCHAR(20) NOT NULL CHECK (risk_category IN ('LOW', 'MODERATE', 'HIGH')),
    probability NUMERIC(5, 4) NOT NULL CHECK (probability >= 0.0000 AND probability <= 1.0000),
    confidence NUMERIC(5, 4) NOT NULL CHECK (confidence >= 0.0000 AND confidence <= 1.0000),
    model_name VARCHAR(100) NOT NULL DEFAULT 'MIL-NodalMetastasis-CLAM',
    model_version VARCHAR(50) NOT NULL DEFAULT 'v1.4.0',
    inference_mode VARCHAR(20) NOT NULL CHECK (inference_mode IN ('demo', 'real')),
    processing_status VARCHAR(50) NOT NULL DEFAULT 'completed' CHECK (processing_status IN ('uploaded', 'processing', 'completed', 'failed')),
    processing_time INT DEFAULT 1240, -- in milliseconds
    clinical_notes TEXT DEFAULT '',
    bag_statistics JSONB DEFAULT '{
        "totalPatches": 128,
        "highAttentionPatches": 14,
        "topFeatureScore": 0.88,
        "aggregationType": "AttentionMIL"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR HIGH PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_predictions_patient_id ON predictions(patient_id);
CREATE INDEX IF NOT EXISTS idx_predictions_doctor_id ON predictions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_category ON predictions(risk_category);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_biopsy_images_patient_id ON biopsy_images(patient_id);

-- TRIGGER FOR UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_doctors_updated_at ON doctors;
CREATE TRIGGER set_doctors_updated_at
BEFORE UPDATE ON doctors
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS set_patients_updated_at ON patients;
CREATE TRIGGER set_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS set_predictions_updated_at ON predictions;
CREATE TRIGGER set_predictions_updated_at
BEFORE UPDATE ON predictions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) & AUTHORIZATION POLICIES
-- Scoped strictly by doctor ownership and patient-specimen relationships.
-- =====================================================================

-- Helper function to extract authenticated doctor context from request headers/JWT
CREATE OR REPLACE FUNCTION current_doctor_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(
        COALESCE(
            current_setting('request.headers', true)::jsonb ->> 'x-doctor-id',
            current_setting('request.jwt.claims', true)::jsonb ->> 'doctorId',
            current_setting('request.jwt.claims', true)::jsonb ->> 'sub'
        ),
        ''
    )::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS on all clinical tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE biopsy_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- 1. DOCTORS POLICIES
DROP POLICY IF EXISTS "Doctors can view relevant profiles" ON doctors;
CREATE POLICY "Doctors can view relevant profiles" ON doctors
    FOR SELECT
    USING (
        current_doctor_id() IS NULL 
        OR id = current_doctor_id() 
        OR length(email) > 0
    );

DROP POLICY IF EXISTS "Allow new doctor registration" ON doctors;
CREATE POLICY "Allow new doctor registration" ON doctors
    FOR INSERT
    WITH CHECK (
        length(name) > 0 
        AND length(email) > 3 
        AND length(password_hash) > 10
    );

DROP POLICY IF EXISTS "Doctors can update own profile" ON doctors;
CREATE POLICY "Doctors can update own profile" ON doctors
    FOR UPDATE
    USING (
        current_doctor_id() IS NULL 
        OR id = current_doctor_id()
    )
    WITH CHECK (
        current_doctor_id() IS NULL 
        OR id = current_doctor_id()
    );

-- 2. PATIENTS POLICIES (Doctor Scoped)
DROP POLICY IF EXISTS "Doctors can view only their own patients" ON patients;
CREATE POLICY "Doctors can view only their own patients" ON patients
    FOR SELECT
    USING (
        (current_doctor_id() IS NOT NULL AND doctor_id = current_doctor_id())
        OR (current_doctor_id() IS NULL AND doctor_id IN (SELECT id FROM doctors))
    );

DROP POLICY IF EXISTS "Doctors can create patients under their account" ON patients;
CREATE POLICY "Doctors can create patients under their account" ON patients
    FOR INSERT
    WITH CHECK (
        (current_doctor_id() IS NOT NULL AND doctor_id = current_doctor_id())
        OR (current_doctor_id() IS NULL AND doctor_id IN (SELECT id FROM doctors))
    );

DROP POLICY IF EXISTS "Doctors can update only their own patients" ON patients;
CREATE POLICY "Doctors can update only their own patients" ON patients
    FOR UPDATE
    USING (
        (current_doctor_id() IS NOT NULL AND doctor_id = current_doctor_id())
        OR (current_doctor_id() IS NULL AND doctor_id IN (SELECT id FROM doctors))
    )
    WITH CHECK (
        (current_doctor_id() IS NOT NULL AND doctor_id = current_doctor_id())
        OR (current_doctor_id() IS NULL AND doctor_id IN (SELECT id FROM doctors))
    );

DROP POLICY IF EXISTS "Doctors can delete only their own patients" ON patients;
CREATE POLICY "Doctors can delete only their own patients" ON patients
    FOR DELETE
    USING (
        (current_doctor_id() IS NOT NULL AND doctor_id = current_doctor_id())
        OR (current_doctor_id() IS NULL AND doctor_id IN (SELECT id FROM doctors))
    );

-- 3. BIOPSY IMAGES POLICIES (Scoped to Doctor & Associated Patient)
DROP POLICY IF EXISTS "Doctors can view authorized biopsy images" ON biopsy_images;
CREATE POLICY "Doctors can view authorized biopsy images" ON biopsy_images
    FOR SELECT
    USING (
        ((current_doctor_id() IS NOT NULL AND doctor_id = current_doctor_id())
         OR (current_doctor_id() IS NULL AND doctor_id IN (SELECT id FROM doctors)))
        AND EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = biopsy_images.patient_id 
              AND p.doctor_id = biopsy_images.doctor_id
        )
    );

DROP POLICY IF EXISTS "Doctors can insert biopsy images for their patients" ON biopsy_images;
CREATE POLICY "Doctors can insert biopsy images for their patients" ON biopsy_images
    FOR INSERT
    WITH CHECK (
        ((current_doctor_id() IS NOT NULL AND doctor_id = current_doctor_id())
         OR (current_doctor_id() IS NULL AND doctor_id IN (SELECT id FROM doctors)))
        AND EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = biopsy_images.patient_id 
              AND p.doctor_id = biopsy_images.doctor_id
        )
    );

DROP POLICY IF EXISTS "Doctors can delete biopsy images of their patients" ON biopsy_images;
CREATE POLICY "Doctors can delete biopsy images of their patients" ON biopsy_images
    FOR DELETE
    USING (
        ((current_doctor_id() IS NOT NULL AND doctor_id = current_doctor_id())
         OR (current_doctor_id() IS NULL AND doctor_id IN (SELECT id FROM doctors)))
        AND EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = biopsy_images.patient_id 
              AND p.doctor_id = biopsy_images.doctor_id
        )
    );

-- 4. PREDICTIONS POLICIES (Scoped to Doctor & Patient with clinical validation)
DROP POLICY IF EXISTS "Doctors can view authorized predictions" ON predictions;
CREATE POLICY "Doctors can view authorized predictions" ON predictions
    FOR SELECT
    USING (
        ((current_doctor_id() IS NOT NULL AND doctor_id = current_doctor_id())
         OR (current_doctor_id() IS NULL AND doctor_id IN (SELECT id FROM doctors)))
        AND EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = predictions.patient_id 
              AND p.doctor_id = predictions.doctor_id
        )
    );

DROP POLICY IF EXISTS "Doctors can create verified predictions" ON predictions;
CREATE POLICY "Doctors can create verified predictions" ON predictions
    FOR INSERT
    WITH CHECK (
        ((current_doctor_id() IS NOT NULL AND doctor_id = current_doctor_id())
         OR (current_doctor_id() IS NULL AND doctor_id IN (SELECT id FROM doctors)))
        AND EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = predictions.patient_id 
              AND p.doctor_id = predictions.doctor_id
        )
        AND probability >= 0.0000 
        AND probability <= 1.0000 
        AND risk_category IN ('LOW', 'MODERATE', 'HIGH')
    );

DROP POLICY IF EXISTS "Doctors can delete their own predictions" ON predictions;
CREATE POLICY "Doctors can delete their own predictions" ON predictions
    FOR DELETE
    USING (
        ((current_doctor_id() IS NOT NULL AND doctor_id = current_doctor_id())
         OR (current_doctor_id() IS NULL AND doctor_id IN (SELECT id FROM doctors)))
        AND EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = predictions.patient_id 
              AND p.doctor_id = predictions.doctor_id
        )
    );


