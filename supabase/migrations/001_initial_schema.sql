-- ============================================================
-- ZARISH HEALTH HIS — Supabase Database Migration
-- Version: 2.0.0
-- Description: Complete schema for Hospital Information System
--              with NCD management capabilities
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- ============================================================
-- 1. FACILITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS facilities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_name TEXT NOT NULL,
  facility_type TEXT NOT NULL CHECK (facility_type IN ('CPI HP', 'CPI HO', 'CPI NCD', 'Hospital', 'Community Clinic', 'Other')),
  operational_status TEXT DEFAULT 'active' CHECK (operational_status IN ('active', 'inactive', 'suspended')),
  camp_name     TEXT,
  district      TEXT,
  upazila       TEXT,
  address       TEXT,
  phone         TEXT,
  email         TEXT,
  geo_lat       NUMERIC(10, 7),
  geo_lng       NUMERIC(10, 7),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. USER ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'facility_manager', 'provider', 'chw', 'data_entry', 'viewer')),
  facility_id UUID REFERENCES facilities(id),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================
-- 3. PATIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mrn               TEXT UNIQUE NOT NULL,
  given_name        TEXT NOT NULL,
  middle_name       TEXT,
  family_name       TEXT NOT NULL,
  full_name_bn      TEXT,                -- Bengali name
  date_of_birth     DATE NOT NULL,
  age_years         INT,
  sex               TEXT NOT NULL CHECK (sex IN ('Male', 'Female', 'Other')),
  origin            TEXT NOT NULL CHECK (origin IN ('Rohingya', 'Bangladeshi', 'Other')),
  marital_status    TEXT,
  blood_group       TEXT,
  phone_primary     TEXT,
  phone_secondary   TEXT,
  email             TEXT,
  father_name       TEXT,
  mother_name       TEXT,
  spouse_name       TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  -- Legacy identifiers
  national_id       TEXT,
  fcn               TEXT,                -- Family Counting Number (Rohingya)
  progress_id       TEXT,                -- Progress/UNHCR ID
  ghc_number        TEXT,                -- General Health Card number
  legacy_ncd_number TEXT,                -- Legacy NCD register number
  -- Clinical flags
  is_pregnant       BOOLEAN DEFAULT false,
  is_vulnerable     BOOLEAN DEFAULT false,
  -- Status
  patient_status    TEXT DEFAULT 'active' CHECK (patient_status IN ('active', 'inactive', 'deceased', 'transferred')),
  registration_date DATE DEFAULT CURRENT_DATE,
  facility_id       UUID REFERENCES facilities(id),
  -- Audit
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  deleted_at        TIMESTAMPTZ            -- soft delete
);

-- Indexes for patient search
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients USING btree (mrn);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients USING gin (
  (given_name || ' ' || family_name) gin_trgm_ops
);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients USING btree (phone_primary);
CREATE INDEX IF NOT EXISTS idx_patients_fcn ON patients USING btree (fcn);
CREATE INDEX IF NOT EXISTS idx_patients_progress_id ON patients USING btree (progress_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients USING btree (patient_status);

-- ============================================================
-- 4. ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  address_type     TEXT DEFAULT 'current' CHECK (address_type IN ('current', 'permanent', 'camp')),
  -- Bangladesh standard address
  division         TEXT,
  district         TEXT,
  upazila          TEXT,
  union_name       TEXT,
  village          TEXT,
  -- Camp address (Rohingya)
  camp_name        TEXT,
  block            TEXT,
  new_sub_block    TEXT,
  household_number TEXT,
  shelter_number   TEXT,
  -- GIS
  geo_lat          NUMERIC(10, 7),
  geo_lng          NUMERIC(10, 7),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. ENCOUNTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS encounters (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id            UUID NOT NULL REFERENCES patients(id),
  facility_id           UUID REFERENCES facilities(id),
  provider_id           UUID REFERENCES auth.users(id),
  encounter_type        TEXT NOT NULL CHECK (encounter_type IN (
    'OPD', 'NCD Screening', 'NCD Review', 'Follow-up',
    'Emergency', 'Triage', 'Phone', 'Home Visit'
  )),
  encounter_status      TEXT DEFAULT 'in_progress' CHECK (encounter_status IN ('in_progress', 'completed', 'cancelled')),
  visit_date            DATE DEFAULT CURRENT_DATE,
  chief_complaint       TEXT,
  history_present_illness TEXT,
  clinical_impression   TEXT,
  treatment_plan        TEXT,
  clinical_notes        TEXT,
  follow_up_required    BOOLEAN DEFAULT false,
  follow_up_date        DATE,
  follow_up_instructions TEXT,
  referral_required     BOOLEAN DEFAULT false,
  referral_reason       TEXT,
  referral_urgency      TEXT CHECK (referral_urgency IN ('routine', 'urgent', 'emergency')),
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_encounters_patient ON encounters USING btree (patient_id);
CREATE INDEX IF NOT EXISTS idx_encounters_date ON encounters USING btree (visit_date);

-- ============================================================
-- 6. VITAL SIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS vital_signs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encounter_id          UUID REFERENCES encounters(id),
  patient_id            UUID NOT NULL REFERENCES patients(id),
  measurement_date      DATE DEFAULT CURRENT_DATE,
  -- Blood Pressure
  systolic_bp           INT,
  diastolic_bp          INT,
  bp_position           TEXT CHECK (bp_position IN ('sitting', 'standing', 'lying')),
  bp_arm                TEXT CHECK (bp_arm IN ('left', 'right')),
  -- Basic vitals
  heart_rate_bpm        INT,
  temperature_celsius   NUMERIC(4, 1),
  respiratory_rate      INT,
  oxygen_saturation     INT,
  -- Anthropometry
  height_cm             NUMERIC(5, 1),
  weight_kg             NUMERIC(5, 1),
  bmi                   NUMERIC(4, 1),
  waist_circumference_cm NUMERIC(5, 1),
  -- Blood Glucose
  blood_glucose_mmol_l  NUMERIC(5, 1),
  glucose_test_type     TEXT CHECK (glucose_test_type IN ('FPG', 'RPG', '2h-PG', 'HbA1c', 'RBS')),
  fasting_status        BOOLEAN,
  -- Pain
  pain_score            INT CHECK (pain_score >= 0 AND pain_score <= 10),
  -- Audit
  recorded_by           UUID REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vital_signs USING btree (patient_id);

-- ============================================================
-- 7. DIAGNOSES (ICD-11)
-- ============================================================
CREATE TABLE IF NOT EXISTS diagnoses (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encounter_id      UUID NOT NULL REFERENCES encounters(id),
  patient_id        UUID NOT NULL REFERENCES patients(id),
  icd11_code        TEXT,
  diagnosis_text    TEXT NOT NULL,
  diagnosis_type    TEXT CHECK (diagnosis_type IN ('primary', 'secondary', 'comorbidity')),
  certainty         TEXT CHECK (certainty IN ('confirmed', 'provisional', 'differential', 'ruled_out')),
  onset_date        DATE,
  is_chronic        BOOLEAN DEFAULT false,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. NCD ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ncd_enrollments (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id             UUID NOT NULL REFERENCES patients(id),
  facility_id            UUID REFERENCES facilities(id),
  enrolled_by            UUID REFERENCES auth.users(id),
  ncd_type               TEXT[] NOT NULL,        -- array of NCD types
  primary_ncd            TEXT NOT NULL,
  enrollment_date        DATE DEFAULT CURRENT_DATE,
  enrollment_source      TEXT CHECK (enrollment_source IN (
    'OPD Diagnosis', 'Community Screening', 'Referral', 'Self-Referral', 'Legacy Import'
  )),
  program_status         TEXT DEFAULT 'active' CHECK (program_status IN (
    'active', 'inactive', 'completed', 'transferred', 'deceased', 'lost_to_follow_up'
  )),
  -- Initial measurements
  initial_bp_systolic    INT,
  initial_bp_diastolic   INT,
  initial_blood_glucose  NUMERIC(5, 1),
  initial_hba1c          NUMERIC(4, 1),
  -- Risk factors
  tobacco_use            BOOLEAN DEFAULT false,
  tobacco_type           TEXT,
  tobacco_quantity_per_day INT,
  alcohol_use            BOOLEAN DEFAULT false,
  alcohol_units_per_week INT,
  physical_activity_minutes_per_week INT,
  family_history_cvd     BOOLEAN DEFAULT false,
  family_history_diabetes BOOLEAN DEFAULT false,
  family_history_details TEXT,
  -- Comorbidities
  has_ckd                BOOLEAN DEFAULT false,
  has_copd               BOOLEAN DEFAULT false,
  has_asthma             BOOLEAN DEFAULT false,
  has_retinopathy        BOOLEAN DEFAULT false,
  has_neuropathy         BOOLEAN DEFAULT false,
  has_nephropathy        BOOLEAN DEFAULT false,
  has_foot_complications BOOLEAN DEFAULT false,
  -- Audit
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ncd_patient ON ncd_enrollments USING btree (patient_id);
CREATE INDEX IF NOT EXISTS idx_ncd_status ON ncd_enrollments USING btree (program_status);

-- ============================================================
-- 9. TREATMENT PROTOCOLS
-- ============================================================
CREATE TABLE IF NOT EXISTS treatment_protocols (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id     UUID NOT NULL REFERENCES ncd_enrollments(id),
  patient_id        UUID NOT NULL REFERENCES patients(id),
  protocol_name     TEXT NOT NULL,
  protocol_step     INT DEFAULT 1,
  medications       JSONB,                -- [{drug, dose, frequency, route}]
  lifestyle_plan    JSONB,                -- {diet, exercise, tobacco_cessation}
  target_bp_systolic INT,
  target_bp_diastolic INT,
  target_glucose    NUMERIC(5, 1),
  target_hba1c      NUMERIC(4, 1),
  target_weight_kg  NUMERIC(5, 1),
  review_interval_days INT DEFAULT 30,
  started_at        TIMESTAMPTZ DEFAULT now(),
  ended_at          TIMESTAMPTZ,
  is_active         BOOLEAN DEFAULT true,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. FOLLOW-UP VISITS
-- ============================================================
CREATE TABLE IF NOT EXISTS follow_up_visits (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id         UUID NOT NULL REFERENCES ncd_enrollments(id),
  patient_id            UUID NOT NULL REFERENCES patients(id),
  facility_id           UUID REFERENCES facilities(id),
  provider_id           UUID REFERENCES auth.users(id),
  visit_date            DATE DEFAULT CURRENT_DATE,
  visit_type            TEXT DEFAULT 'Scheduled Follow-up',
  -- Adherence
  medication_adherence  TEXT CHECK (medication_adherence IN ('Excellent', 'Good', 'Fair', 'Poor')),
  missed_doses_last_week INT,
  side_effects_reported BOOLEAN DEFAULT false,
  side_effects_description TEXT,
  diet_adherence        TEXT CHECK (diet_adherence IN ('Good', 'Moderate', 'Poor')),
  exercise_adherence    TEXT,
  tobacco_cessation_progress TEXT,
  -- Current measurements
  current_bp_systolic   INT,
  current_bp_diastolic  INT,
  current_weight_kg     NUMERIC(5, 1),
  current_blood_glucose NUMERIC(5, 1),
  current_hba1c         NUMERIC(4, 1),
  -- Targets
  bp_target_met         BOOLEAN DEFAULT false,
  glucose_target_met    BOOLEAN DEFAULT false,
  weight_target_met     BOOLEAN DEFAULT false,
  -- Complications
  complications_assessed BOOLEAN DEFAULT false,
  new_complications_detected BOOLEAN DEFAULT false,
  complications_notes   TEXT,
  -- Treatment modification
  treatment_modified    BOOLEAN DEFAULT false,
  treatment_modification_reason TEXT,
  -- Next visit
  next_visit_scheduled  DATE,
  clinical_notes        TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_followup_patient ON follow_up_visits USING btree (patient_id);
CREATE INDEX IF NOT EXISTS idx_followup_next ON follow_up_visits USING btree (next_visit_scheduled);

-- ============================================================
-- 11. CVD RISK ASSESSMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS cvd_risk_assessments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES patients(id),
  enrollment_id     UUID REFERENCES ncd_enrollments(id),
  assessment_date   DATE DEFAULT CURRENT_DATE,
  assessment_tool   TEXT DEFAULT 'WHO/ISH',
  -- Input parameters
  age_years         INT,
  sex               TEXT,
  systolic_bp       INT,
  total_cholesterol NUMERIC(5, 1),
  is_smoker         BOOLEAN,
  has_diabetes      BOOLEAN,
  -- Results
  risk_score        NUMERIC(5, 1),
  risk_category     TEXT CHECK (risk_category IN ('Low', 'Moderate', 'High', 'Very High')),
  ten_year_risk_pct NUMERIC(5, 1),
  -- Recommendations
  recommendations   JSONB,
  chart_used        TEXT,
  assessed_by       UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 12. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncd_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvd_risk_assessments ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read/write (we'll restrict by role in the app layer)
-- In production, you'd want more granular policies based on user_roles

-- Read access for all authenticated users
CREATE POLICY "Authenticated users can read facilities"
  ON facilities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read patients"
  ON patients FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert patients"
  ON patients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients"
  ON patients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read addresses"
  ON addresses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage addresses"
  ON addresses FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read encounters"
  ON encounters FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert encounters"
  ON encounters FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update encounters"
  ON encounters FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read vital_signs"
  ON vital_signs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert vital_signs"
  ON vital_signs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read diagnoses"
  ON diagnoses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert diagnoses"
  ON diagnoses FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read ncd_enrollments"
  ON ncd_enrollments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert ncd_enrollments"
  ON ncd_enrollments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update ncd_enrollments"
  ON ncd_enrollments FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read treatment_protocols"
  ON treatment_protocols FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert treatment_protocols"
  ON treatment_protocols FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read follow_up_visits"
  ON follow_up_visits FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert follow_up_visits"
  ON follow_up_visits FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read cvd_risk_assessments"
  ON cvd_risk_assessments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert cvd_risk_assessments"
  ON cvd_risk_assessments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin management policies
CREATE POLICY "Admins can manage user_roles"
  ON user_roles FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can manage facilities"
  ON facilities FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'admin')
    )
  );

-- ============================================================
-- 13. HELPER FUNCTIONS
-- ============================================================

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trg_facilities_updated_at
  BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_encounters_updated_at
  BEFORE UPDATE ON encounters FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ncd_enrollments_updated_at
  BEFORE UPDATE ON ncd_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_treatment_protocols_updated_at
  BEFORE UPDATE ON treatment_protocols FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 14. SEED DATA — Default Facilities
-- ============================================================
INSERT INTO facilities (facility_name, facility_type, camp_name, district, upazila) VALUES
  ('CPI Health Post - Camp 1W', 'CPI HP', 'Camp-1W', 'Cox''s Bazar', 'Ukhiya'),
  ('CPI Health Outreach - Camp 1W', 'CPI HO', 'Camp-1W', 'Cox''s Bazar', 'Ukhiya'),
  ('CPI NCD Corner - Camp 1W', 'CPI NCD', 'Camp-1W', 'Cox''s Bazar', 'Ukhiya'),
  ('CPI Health Outreach - Camp 04', 'CPI HO', 'Camp-04', 'Cox''s Bazar', 'Ukhiya')
ON CONFLICT DO NOTHING;
