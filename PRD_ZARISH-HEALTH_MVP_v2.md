# ZARISH HEALTH Hospital Information System - Product Requirements Document (MVP v2)

**Version**: 2.0.0  
**Date**: February 16, 2026  
**Status**: Active Development  
**Author**: ZARISH HEALTH Engineering Team  
**GitHub**: https://github.com/zs-health

---

## 📋 Executive Summary

### Vision
Build Bangladesh's first **open-source, cloud-native Hospital Information System (HIS)** powered by **Firebase** and **Supabase** that serves both Bangladeshi citizens and Rohingya refugees, with specialized **NCD (Non-Communicable Disease) management** capabilities.

### Mission
Deliver a production-ready, serverless, cost-effective HIS that can be deployed instantly, supports decentralized health facilities (Health Posts and Health Outreach), and provides world-class NCD care management at zero infrastructure cost.

### Core Values
- **Open Source Forever**: MIT License, no vendor lock-in
- **Cloud-Native**: Serverless architecture, zero DevOps overhead
- **Patient-Centric**: Unified patient records across all facilities
- **Cost-Effective**: Firebase free tier + Supabase free tier = $0 for small deployments
- **Inclusive**: Multi-language support (English, Bangla, Myanmar)
- **Standards-Based**: FHIR R5 compliant

---

## 🎯 Architecture Revolution: Firebase + Supabase

### Why Firebase + Supabase?

#### Previous Architecture (v1)
```yaml
Infrastructure:
  - Kubernetes cluster management
  - Self-hosted PostgreSQL
  - Manual scaling
  - DevOps team required
  - ~$500-1000/month minimum cost

Complexity:
  - 10+ microservices to deploy
  - Container orchestration
  - Load balancing configuration
  - Database replication setup
```

#### New Architecture (v2)
```yaml
Infrastructure:
  - Firebase Hosting (frontend)
  - Supabase (backend + database + auth)
  - Serverless functions
  - Auto-scaling built-in
  - ~$0-50/month for small facilities

Simplicity:
  - Single-page application deployment
  - Database-as-a-service
  - Authentication included
  - API auto-generated from database schema
```

### Technology Stack v2

#### Frontend
```yaml
Hosting: Firebase Hosting
Framework: React 19.x + TypeScript
State Management: Zustand
UI Library: Tailwind CSS + shadcn/ui
Build Tool: Vite 5.x
Testing: Vitest + React Testing Library

Features:
  - CDN-distributed globally
  - HTTPS by default
  - Instant deployment
  - Free for <10GB bandwidth/month
```

#### Backend
```yaml
Platform: Supabase
Database: PostgreSQL 16.x (managed)
Auth: Supabase Auth + Google OAuth2
Storage: Supabase Storage (S3-compatible)
Real-time: Supabase Realtime (WebSockets)
Edge Functions: Deno-based serverless functions

Features:
  - Auto-generated REST API
  - Row-level security (RLS)
  - Real-time subscriptions
  - Database backups included
  - Free for <500MB database, <2GB bandwidth/month
```

#### Authentication
```yaml
Provider: Supabase Auth + Firebase Auth (dual support)
Methods:
  - Email/Password
  - Google OAuth2
  - Phone (SMS OTP) - future
  - Magic Links - future

Session Management:
  - JWT tokens (auto-refresh)
  - Secure cookie storage
  - Cross-tab synchronization
  - Automatic token rotation
```

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     ZARISH HEALTH HIS                       │
│                  Firebase + Supabase Stack                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────────┐
│   Firebase Hosting   │         │   Supabase Platform      │
│                      │         │                          │
│  ┌────────────────┐  │         │  ┌────────────────────┐  │
│  │  React SPA     │  │◄────────┤  │  PostgreSQL 16     │  │
│  │  (Provider     │  │   API   │  │  (All databases    │  │
│  │   Portal)      │  │  Calls  │  │   unified)         │  │
│  └────────────────┘  │         │  └────────────────────┘  │
│                      │         │                          │
│  ┌────────────────┐  │         │  ┌────────────────────┐  │
│  │  Patient       │  │◄────────┤  │  Supabase Auth     │  │
│  │  Portal        │  │  Auth   │  │  + Google OAuth2   │  │
│  └────────────────┘  │         │  └────────────────────┘  │
│                      │         │                          │
│  ┌────────────────┐  │         │  ┌────────────────────┐  │
│  │  Admin         │  │◄────────┤  │  Storage (Files)   │  │
│  │  Dashboard     │  │         │  │  (Patient docs)    │  │
│  └────────────────┘  │         │  └────────────────────┘  │
│                      │         │                          │
│  Global CDN         │         │  ┌────────────────────┐  │
│  (100+ locations)   │         │  │  Edge Functions    │  │
│                      │         │  │  (Business Logic)  │  │
└──────────────────────┘         │  └────────────────────┘  │
                                 │                          │
                                 │  ┌────────────────────┐  │
                                 │  │  Realtime Engine   │  │
                                 │  │  (WebSockets)      │  │
                                 │  └────────────────────┘  │
                                 └──────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              External Integrations (Optional)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   SMS API    │  │  Email API   │  │  Payment     │     │
│  │   (Twilio)   │  │  (SendGrid)  │  │  Gateway     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Database Architecture

Unlike v1 with separate databases per service, **v2 uses a single unified PostgreSQL database** with schema-based separation:

```sql
-- Single Supabase PostgreSQL instance with schemas

CREATE SCHEMA patient;      -- Patient demographics and identifiers
CREATE SCHEMA clinical;     -- Encounters, vitals, diagnoses
CREATE SCHEMA ncd;          -- NCD-specific protocols and tracking
CREATE SCHEMA pharmacy;     -- Medicines and prescriptions
CREATE SCHEMA lab;          -- Lab orders and results
CREATE SCHEMA billing;      -- Invoices and payments
CREATE SCHEMA facility;     -- Health Posts and Outreach sites
CREATE SCHEMA auth;         -- Extended user profiles
CREATE SCHEMA import;       -- Legacy data import tracking
```

**Benefits**:
- Single connection pool
- Cross-schema JOINs possible (better performance)
- Unified backup/restore
- Simpler management
- Cost-effective (one database instance)

---

## 🗄️ Complete Database Schema

### Schema 1: `patient` - Patient Demographics

#### Table: `patient.patients`
```sql
CREATE TABLE patient.patients (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ZARISH Health MRN (auto-generated, unique)
  mrn VARCHAR(50) UNIQUE NOT NULL DEFAULT 'MRN-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('patient.mrn_sequence')::TEXT, 6, '0'),
  
  -- Legacy Reference IDs (for imported patients)
  legacy_ncd_number VARCHAR(50),        -- Original NCD system ID
  legacy_patient_id VARCHAR(50),        -- Original HBS/other system ID
  progress_id VARCHAR(100),             -- ProGress screening database ID
  ghc_number VARCHAR(100),              -- GHC database number
  fcn VARCHAR(100),                     -- Family Counting Number (Rohingya)
  
  -- Demographics
  given_name VARCHAR(100) NOT NULL,
  family_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  full_name_bn VARCHAR(255),            -- Bengali name
  full_name_my VARCHAR(255),            -- Myanmar name
  
  date_of_birth DATE NOT NULL,
  age_at_registration INT,              -- Stored for legacy imports
  age_years INT GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM AGE(date_of_birth))
  ) STORED,
  
  sex VARCHAR(10) NOT NULL CHECK (sex IN ('Male', 'Female', 'Other')),
  gender VARCHAR(50),                   -- Gender identity (optional, future)
  
  -- Contact Information
  phone_primary VARCHAR(20),
  phone_secondary VARCHAR(20),
  email VARCHAR(255),
  
  -- Origin & Nationality
  origin VARCHAR(50) NOT NULL CHECK (origin IN ('Rohingya', 'Bangladeshi', 'Other')),
  nationality VARCHAR(100),             -- FDMN, Bangladeshi, etc.
  
  -- Marital Status
  marital_status VARCHAR(50) CHECK (marital_status IN (
    'Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Unknown'
  )),
  
  -- Family Information
  father_name VARCHAR(255),
  mother_name VARCHAR(255),
  spouse_name VARCHAR(255),
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(100),
  
  -- National IDs
  national_id VARCHAR(100),             -- Bangladesh NID or other national ID
  passport_number VARCHAR(100),
  birth_certificate_number VARCHAR(100),
  
  -- Clinical Flags
  blood_group VARCHAR(10) CHECK (blood_group IN (
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'
  )),
  is_vulnerable BOOLEAN DEFAULT FALSE,
  is_pregnant BOOLEAN DEFAULT FALSE,
  
  -- Status
  patient_status VARCHAR(50) DEFAULT 'active' CHECK (patient_status IN (
    'active', 'inactive', 'deceased', 'transferred_out', 'archived'
  )),
  
  -- Registration Information
  registration_facility_id UUID REFERENCES facility.facilities(id),
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  registered_by UUID,                   -- User who registered
  
  -- Import Metadata
  import_batch_id UUID,                 -- Links to import.batches
  import_source VARCHAR(100),           -- 'NCD_Legacy', 'HBS_Legacy', etc.
  import_date TIMESTAMP,
  data_quality_score DECIMAL(3,2),      -- 0.00 to 1.00 (import quality)
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT check_dob CHECK (date_of_birth <= CURRENT_DATE),
  CONSTRAINT check_age CHECK (age_years >= 0 AND age_years <= 150)
);

-- Indexes
CREATE UNIQUE INDEX idx_patients_mrn ON patient.patients(mrn) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_legacy_ncd ON patient.patients(legacy_ncd_number) WHERE legacy_ncd_number IS NOT NULL;
CREATE INDEX idx_patients_progress_id ON patient.patients(progress_id) WHERE progress_id IS NOT NULL;
CREATE INDEX idx_patients_fcn ON patient.patients(fcn) WHERE fcn IS NOT NULL;
CREATE INDEX idx_patients_phone ON patient.patients(phone_primary);
CREATE INDEX idx_patients_name ON patient.patients(family_name, given_name);
CREATE INDEX idx_patients_dob ON patient.patients(date_of_birth);
CREATE INDEX idx_patients_status ON patient.patients(patient_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_facility ON patient.patients(registration_facility_id);
CREATE INDEX idx_patients_import_batch ON patient.patients(import_batch_id) WHERE import_batch_id IS NOT NULL;

-- Full-text search
CREATE INDEX idx_patients_search ON patient.patients USING gin(
  to_tsvector('english', 
    COALESCE(given_name, '') || ' ' || 
    COALESCE(family_name, '') || ' ' ||
    COALESCE(father_name, '')
  )
);

-- Sequence for MRN generation
CREATE SEQUENCE patient.mrn_sequence START 1;
```

#### Table: `patient.addresses`
```sql
CREATE TABLE patient.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient.patients(id) ON DELETE CASCADE,
  
  address_type VARCHAR(50) NOT NULL CHECK (address_type IN (
    'current', 'permanent', 'temporary', 'camp', 'village', 'other'
  )),
  
  -- Rohingya Camp Address
  camp_name VARCHAR(100),
  block VARCHAR(50),
  new_sub_block VARCHAR(50),
  household_number VARCHAR(50),
  shelter_number VARCHAR(50),
  
  -- Bangladeshi Address
  division VARCHAR(100),
  district VARCHAR(100),
  upazila VARCHAR(100),
  union_pouroshova VARCHAR(100),
  village VARCHAR(100),
  ward_number VARCHAR(50),
  post_office VARCHAR(100),
  postal_code VARCHAR(20),
  
  -- General Address
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Bangladesh',
  
  -- Geolocation
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  
  -- Status
  is_primary BOOLEAN DEFAULT TRUE,
  effective_from DATE,
  effective_to DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_patient ON patient.addresses(patient_id);
CREATE INDEX idx_addresses_camp ON patient.addresses(camp_name) WHERE camp_name IS NOT NULL;
CREATE INDEX idx_addresses_district ON patient.addresses(district) WHERE district IS NOT NULL;
CREATE INDEX idx_addresses_primary ON patient.addresses(is_primary) WHERE is_primary = TRUE;
```

---

### Schema 2: `facility` - Decentralized Health Facilities

#### Table: `facility.facilities`
```sql
CREATE TABLE facility.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Facility Information
  facility_code VARCHAR(50) UNIQUE NOT NULL,  -- HP-C1E, HO-C2W, etc.
  facility_name_en VARCHAR(255) NOT NULL,
  facility_name_bn VARCHAR(255),
  
  -- Facility Type
  facility_type VARCHAR(50) NOT NULL CHECK (facility_type IN (
    'Health Post',           -- HP: Permanent structure in camp
    'Health Outreach',       -- HO: Mobile/community-based
    'Primary Health Center', -- PHC: Bangladesh government facility
    'District Hospital',     -- DH: Referral hospital
    'Specialized Clinic',    -- SC: NCD, TB, etc.
    'Community Point'        -- CP: Screening location
  )),
  
  -- Service Level (1-4)
  service_level INT NOT NULL CHECK (service_level BETWEEN 1 AND 4),
  -- 1: Community/Screening
  -- 2: Primary Care (HP, HO)
  -- 3: Specialized Care
  -- 4: Tertiary/Referral
  
  -- Program Codes (supports multiple)
  programs TEXT[] DEFAULT ARRAY['HP'],  -- HP, HO, HSS, NCD, TB, RH, etc.
  
  -- Location
  camp_name VARCHAR(100),
  camp_block VARCHAR(50),
  district VARCHAR(100),
  upazila VARCHAR(100),
  division VARCHAR(100),
  
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  
  -- Contact
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Operational Details
  operational_status VARCHAR(50) DEFAULT 'active' CHECK (operational_status IN (
    'active', 'inactive', 'temporarily_closed', 'permanently_closed'
  )),
  
  opening_date DATE,
  closing_date DATE,
  
  operational_hours JSONB,  -- {"monday": "08:00-17:00", ...}
  
  -- Capacity
  staff_count INT,
  patient_capacity_per_day INT,
  consultation_rooms INT,
  
  -- Services Offered
  services_offered TEXT[],  -- ['OPD', 'NCD', 'ANC', 'EPI', 'Laboratory']
  
  -- Parent Facility (for referrals)
  parent_facility_id UUID REFERENCES facility.facilities(id),
  referral_network_id UUID,
  
  -- Audit
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID
);

CREATE INDEX idx_facilities_code ON facility.facilities(facility_code);
CREATE INDEX idx_facilities_type ON facility.facilities(facility_type);
CREATE INDEX idx_facilities_programs ON facility.facilities USING gin(programs);
CREATE INDEX idx_facilities_camp ON facility.facilities(camp_name) WHERE camp_name IS NOT NULL;
CREATE INDEX idx_facilities_district ON facility.facilities(district) WHERE district IS NOT NULL;
CREATE INDEX idx_facilities_status ON facility.facilities(operational_status) WHERE is_active = TRUE;

-- Sample Data
INSERT INTO facility.facilities (facility_code, facility_name_en, facility_type, service_level, programs, camp_name) VALUES
('HP-C1W', 'CPI HP - Camp 1W', 'CPI HP', 2, ARRAY['HP', 'NCD', 'RH'], 'Camp-1W'),
('HO-C1W', 'CPI HO - Camp 1W', 'CPI HO', 2, ARRAY['HO', 'NCD'], 'Camp-1W'),
('HO-C04', 'CPI HO - Camp 04', 'CPI HO', 2, ARRAY['HO', 'NCD'], 'Camp-04'),
('NCD-CORNER', 'CPI NCD - Camp 1W', 'CPI NCD', 3, ARRAY['NCD'], 'Camp-1W');
```

---

### Schema 3: `clinical` - Encounters and Clinical Data

#### Table: `clinical.encounters`
```sql
CREATE TABLE clinical.encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Patient & Provider
  patient_id UUID NOT NULL REFERENCES patient.patients(id),
  facility_id UUID NOT NULL REFERENCES facility.facilities(id),
  provider_id UUID,                     -- User who conducted encounter
  
  -- Encounter Classification
  encounter_type VARCHAR(50) NOT NULL CHECK (encounter_type IN (
    'Registration',      -- Initial enrollment
    'OPD',              -- Outpatient visit
    'Follow-up',        -- Scheduled follow-up
    'NCD Screening',    -- NCD community screening
    'NCD Review',       -- NCD patient review
    'Emergency',        -- Emergency visit
    'Referral',         -- Patient referred in
    'Triage',           -- Triage only
    'Phone',            -- Phone consultation
    'Home Visit'        -- Community health worker visit
  )),
  
  -- Visit Information
  visit_date DATE NOT NULL,
  visit_number INT,                     -- Sequential visit # for patient
  visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Clinical Content
  chief_complaint TEXT,
  history_present_illness TEXT,
  
  -- Physical Examination
  general_examination JSONB,
  systemic_examination JSONB,
  
  -- Assessment
  clinical_impression TEXT,
  
  -- Plan
  treatment_plan TEXT,
  medications_prescribed JSONB,
  investigations_ordered JSONB,
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  follow_up_instructions TEXT,
  
  -- Referral
  referral_required BOOLEAN DEFAULT FALSE,
  referral_facility_id UUID REFERENCES facility.facilities(id),
  referral_reason TEXT,
  referral_urgency VARCHAR(50) CHECK (referral_urgency IN (
    'routine', 'urgent', 'emergency'
  )),
  
  -- Status
  encounter_status VARCHAR(50) DEFAULT 'active' CHECK (encounter_status IN (
    'active', 'completed', 'cancelled', 'no-show'
  )),
  
  -- Provider Information
  provider_name VARCHAR(255),
  provider_designation VARCHAR(100),
  
  -- Legacy Import
  legacy_visit_id VARCHAR(100),
  
  -- Notes
  clinical_notes TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

CREATE INDEX idx_encounters_patient ON clinical.encounters(patient_id);
CREATE INDEX idx_encounters_facility ON clinical.encounters(facility_id);
CREATE INDEX idx_encounters_date ON clinical.encounters(visit_date DESC);
CREATE INDEX idx_encounters_type ON clinical.encounters(encounter_type);
CREATE INDEX idx_encounters_status ON clinical.encounters(encounter_status);
CREATE INDEX idx_encounters_legacy ON clinical.encounters(legacy_visit_id) WHERE legacy_visit_id IS NOT NULL;
```

#### Table: `clinical.vital_signs`
```sql
CREATE TABLE clinical.vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES clinical.encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patient.patients(id),
  
  -- Measurement Time
  measurement_date DATE NOT NULL,
  measurement_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Vital Signs
  temperature_celsius DECIMAL(4, 2),
  heart_rate_bpm INT,
  respiratory_rate INT,
  oxygen_saturation INT CHECK (oxygen_saturation BETWEEN 0 AND 100),
  
  -- Blood Pressure
  systolic_bp INT,
  diastolic_bp INT,
  bp_position VARCHAR(50),              -- sitting, standing, lying
  bp_arm VARCHAR(20),                   -- left, right
  
  -- Anthropometry
  height_cm DECIMAL(6, 2),
  weight_kg DECIMAL(6, 2),
  bmi DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN height_cm > 0 AND weight_kg > 0 
      THEN weight_kg / ((height_cm / 100) * (height_cm / 100))
      ELSE NULL
    END
  ) STORED,
  
  waist_circumference_cm DECIMAL(6, 2),
  hip_circumference_cm DECIMAL(6, 2),
  
  -- Blood Glucose (NCD Critical)
  blood_glucose_mmol_l DECIMAL(5, 2),   -- mmol/L (WHO standard)
  blood_glucose_mg_dl INT,               -- mg/dL (converted)
  glucose_test_type VARCHAR(50) CHECK (glucose_test_type IN (
    'FPG',          -- Fasting Plasma Glucose
    'RPG',          -- Random Plasma Glucose
    '2h-PG',        -- 2-hour Post-Glucose
    'HbA1c',        -- Glycated Hemoglobin
    'RBS'           -- Random Blood Sugar (capillary)
  )),
  
  fasting_status BOOLEAN,               -- TRUE if fasting ≥8 hours
  
  -- Additional Measurements
  head_circumference_cm DECIMAL(5, 2),  -- Pediatrics
  mid_upper_arm_circumference_cm DECIMAL(5, 2),  -- Nutrition
  
  -- Pain Scale
  pain_score INT CHECK (pain_score BETWEEN 0 AND 10),
  
  -- Measurement Context
  measured_by VARCHAR(255),
  measurement_device VARCHAR(100),
  
  -- Clinical Flags (Auto-calculated)
  hypertension_stage VARCHAR(50),       -- Stage 1, Stage 2, Crisis
  bmi_category VARCHAR(50),             -- Underweight, Normal, Overweight, Obese
  diabetes_risk VARCHAR(50),            -- Normal, Pre-diabetes, Diabetes
  
  -- Notes
  clinical_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vitals_encounter ON clinical.vital_signs(encounter_id);
CREATE INDEX idx_vitals_patient ON clinical.vital_signs(patient_id);
CREATE INDEX idx_vitals_date ON clinical.vital_signs(measurement_date DESC);
CREATE INDEX idx_vitals_patient_date ON clinical.vital_signs(patient_id, measurement_date DESC);

-- Auto-calculate clinical flags (Trigger)
CREATE OR REPLACE FUNCTION clinical.calculate_vital_flags()
RETURNS TRIGGER AS $$
BEGIN
  -- Blood Pressure Staging
  NEW.hypertension_stage := CASE
    WHEN NEW.systolic_bp >= 180 OR NEW.diastolic_bp >= 120 THEN 'Hypertensive Crisis'
    WHEN NEW.systolic_bp >= 160 OR NEW.diastolic_bp >= 100 THEN 'Stage 2'
    WHEN NEW.systolic_bp >= 140 OR NEW.diastolic_bp >= 90 THEN 'Stage 1'
    WHEN NEW.systolic_bp >= 130 OR NEW.diastolic_bp >= 80 THEN 'Elevated'
    ELSE 'Normal'
  END;
  
  -- BMI Category
  NEW.bmi_category := CASE
    WHEN NEW.bmi < 18.5 THEN 'Underweight'
    WHEN NEW.bmi >= 18.5 AND NEW.bmi < 25 THEN 'Normal'
    WHEN NEW.bmi >= 25 AND NEW.bmi < 30 THEN 'Overweight'
    WHEN NEW.bmi >= 30 THEN 'Obese'
    ELSE NULL
  END;
  
  -- Diabetes Risk (based on FPG or RPG)
  IF NEW.glucose_test_type = 'FPG' THEN
    NEW.diabetes_risk := CASE
      WHEN NEW.blood_glucose_mmol_l >= 7.0 THEN 'Diabetes'
      WHEN NEW.blood_glucose_mmol_l >= 6.1 THEN 'Pre-diabetes'
      ELSE 'Normal'
    END;
  ELSIF NEW.glucose_test_type = 'RPG' THEN
    NEW.diabetes_risk := CASE
      WHEN NEW.blood_glucose_mmol_l >= 11.1 THEN 'Diabetes'
      ELSE 'Indeterminate'
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_vital_flags
  BEFORE INSERT OR UPDATE ON clinical.vital_signs
  FOR EACH ROW
  EXECUTE FUNCTION clinical.calculate_vital_flags();
```

#### Table: `clinical.diagnoses`
```sql
CREATE TABLE clinical.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES clinical.encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patient.patients(id),
  
  -- ICD-11 Coding
  icd11_code VARCHAR(50) NOT NULL,
  disease_name_en VARCHAR(255) NOT NULL,
  disease_name_bn VARCHAR(255),
  
  -- Diagnosis Type
  diagnosis_type VARCHAR(50) CHECK (diagnosis_type IN (
    'primary', 'secondary', 'complication', 'comorbidity'
  )),
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Clinical Status
  clinical_status VARCHAR(50) DEFAULT 'active' CHECK (clinical_status IN (
    'active', 'recurrence', 'relapse', 'inactive', 'remission', 'resolved'
  )),
  
  verification_status VARCHAR(50) DEFAULT 'confirmed' CHECK (verification_status IN (
    'provisional', 'differential', 'confirmed', 'refuted'
  )),
  
  severity VARCHAR(50) CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
  
  -- Temporal Data
  onset_date DATE,
  resolution_date DATE,
  
  -- Diagnosis Details
  body_site VARCHAR(255),
  laterality VARCHAR(50),               -- left, right, bilateral
  
  -- NCD Specific
  is_ncd BOOLEAN DEFAULT FALSE,
  ncd_type VARCHAR(50),                 -- Hypertension, Diabetes, CVD, etc.
  
  -- Provider
  diagnosed_by UUID,
  diagnosed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Notes
  clinical_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diagnoses_encounter ON clinical.diagnoses(encounter_id);
CREATE INDEX idx_diagnoses_patient ON clinical.diagnoses(patient_id);
CREATE INDEX idx_diagnoses_icd11 ON clinical.diagnoses(icd11_code);
CREATE INDEX idx_diagnoses_primary ON clinical.diagnoses(is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_diagnoses_ncd ON clinical.diagnoses(is_ncd, ncd_type) WHERE is_ncd = TRUE;
```

---

### Schema 4: `ncd` - Non-Communicable Disease Management

This schema implements the comprehensive NCD protocols from the Bangladesh National Guidelines.

#### Table: `ncd.enrollments`
```sql
CREATE TABLE ncd.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient.patients(id),
  
  -- Enrollment Information
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  enrollment_facility_id UUID NOT NULL REFERENCES facility.facilities(id),
  enrolled_by UUID,
  
  -- NCD Type
  ncd_type TEXT[] NOT NULL,             -- ['Hypertension', 'Diabetes', 'CVD']
  primary_ncd VARCHAR(50) NOT NULL CHECK (primary_ncd IN (
    'Hypertension', 'Type 2 Diabetes', 'CVD', 'COPD', 'Asthma', 'CKD'
  )),
  
  -- Enrollment Context
  enrollment_source VARCHAR(50) CHECK (enrollment_source IN (
    'Community Screening',
    'OPD Diagnosis',
    'Referral',
    'Self-Referral',
    'Legacy Import'
  )),
  
  screening_visit_id UUID REFERENCES clinical.encounters(id),
  
  -- Initial Assessment
  initial_cvd_risk_score DECIMAL(5, 2), -- 10-year CVD risk %
  initial_cvd_risk_category VARCHAR(50) CHECK (initial_cvd_risk_category IN (
    '<10%', '10-20%', '20-30%', '≥30%'
  )),
  
  initial_bp_systolic INT,
  initial_bp_diastolic INT,
  initial_blood_glucose DECIMAL(5, 2),
  initial_hba1c DECIMAL(4, 2),
  
  -- Risk Factors
  tobacco_use BOOLEAN,
  tobacco_type VARCHAR(50),             -- Cigarette, Bidi, Smokeless
  tobacco_quantity_per_day INT,
  tobacco_quit_date DATE,
  
  alcohol_use BOOLEAN,
  alcohol_units_per_week INT,
  
  physical_activity_minutes_per_week INT,
  
  family_history_cvd BOOLEAN,
  family_history_diabetes BOOLEAN,
  family_history_details TEXT,
  
  -- Comorbidities
  has_ckd BOOLEAN DEFAULT FALSE,
  has_copd BOOLEAN DEFAULT FALSE,
  has_asthma BOOLEAN DEFAULT FALSE,
  other_comorbidities TEXT[],
  
  -- Complications
  has_retinopathy BOOLEAN DEFAULT FALSE,
  has_neuropathy BOOLEAN DEFAULT FALSE,
  has_nephropathy BOOLEAN DEFAULT FALSE,
  has_foot_complications BOOLEAN DEFAULT FALSE,
  complications_notes TEXT,
  
  -- Program Status
  program_status VARCHAR(50) DEFAULT 'active' CHECK (program_status IN (
    'active', 'completed', 'transferred', 'deceased', 'lost_to_follow_up', 'withdrawn'
  )),
  
  discharge_date DATE,
  discharge_reason TEXT,
  
  -- Legacy Data
  legacy_enrollment_id VARCHAR(100),
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID
);

CREATE INDEX idx_ncd_enrollments_patient ON ncd.enrollments(patient_id);
CREATE INDEX idx_ncd_enrollments_facility ON ncd.enrollments(enrollment_facility_id);
CREATE INDEX idx_ncd_enrollments_type ON ncd.enrollments USING gin(ncd_type);
CREATE INDEX idx_ncd_enrollments_status ON ncd.enrollments(program_status) WHERE program_status = 'active';
```

#### Table: `ncd.treatment_protocols`
```sql
CREATE TABLE ncd.treatment_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient.patients(id),
  enrollment_id UUID NOT NULL REFERENCES ncd.enrollments(id),
  
  -- Protocol Information
  protocol_type VARCHAR(50) NOT NULL CHECK (protocol_type IN (
    'Hypertension Protocol I',    -- SBP 140-159 or DBP 90-99
    'Hypertension Protocol II',   -- SBP ≥160 or DBP ≥100
    'Diabetes Protocol',          -- Type 2 DM management
    'Integrated CVD Risk'         -- Combined approach
  )),
  
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Treatment Target
  bp_target_systolic INT,           -- e.g., 140 for most, 130 for high risk
  bp_target_diastolic INT,          -- e.g., 90 for most, 80 for high risk
  
  glucose_target_fpg DECIMAL(4, 2), -- mmol/L, e.g., 7.0
  glucose_target_hba1c DECIMAL(4, 2), -- %, e.g., 7.0
  
  -- Current Medications
  current_medications JSONB,        -- Array of {drug, dose, frequency}
  
  -- Medication History (for Protocol II escalation tracking)
  medication_history JSONB,         -- [{date, action, drug, dose}, ...]
  
  -- Lifestyle Modifications
  dietary_plan TEXT,
  exercise_plan TEXT,
  weight_loss_goal_kg DECIMAL(5, 2),
  
  -- Review Schedule
  next_review_date DATE,
  review_interval_weeks INT DEFAULT 4,
  
  -- Protocol Status
  protocol_status VARCHAR(50) DEFAULT 'active' CHECK (protocol_status IN (
    'active', 'escalated', 'target_met', 'referred', 'discontinued'
  )),
  
  -- Escalation Tracking (for Protocol II)
  escalation_step INT DEFAULT 0,    -- 0: Initial, 1: Dose increase, 2: Add drug, 3: Refer
  
  -- Provider
  prescribing_provider_id UUID,
  prescribing_facility_id UUID REFERENCES facility.facilities(id),
  
  -- Notes
  clinical_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_protocols_patient ON ncd.treatment_protocols(patient_id);
CREATE INDEX idx_protocols_enrollment ON ncd.treatment_protocols(enrollment_id);
CREATE INDEX idx_protocols_type ON ncd.treatment_protocols(protocol_type);
CREATE INDEX idx_protocols_status ON ncd.treatment_protocols(protocol_status) WHERE protocol_status = 'active';
```

#### Table: `ncd.cvd_risk_assessments`
```sql
CREATE TABLE ncd.cvd_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient.patients(id),
  enrollment_id UUID REFERENCES ncd.enrollments(id),
  encounter_id UUID REFERENCES clinical.encounters(id),
  
  -- Assessment Date
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assessed_by UUID,
  
  -- CVD Risk Factors (Tool 1: ASK)
  chest_pain BOOLEAN,
  breathlessness BOOLEAN,
  irregular_heartbeat BOOLEAN,
  headache_dizziness BOOLEAN,
  difficulty_talking BOOLEAN,
  weakness_numbness BOOLEAN,
  swelling_feet_legs BOOLEAN,
  
  -- Symptoms
  increased_thirst_urination BOOLEAN,
  unexplained_weight_loss BOOLEAN,
  
  -- Lifestyle (Tool 1: ASK)
  tobacco_current BOOLEAN,
  tobacco_type VARCHAR(50),
  tobacco_years INT,
  
  alcohol_current BOOLEAN,
  alcohol_units_per_day INT,
  
  physical_activity_minutes_week INT,
  
  -- Diet Assessment
  salt_intake VARCHAR(50) CHECK (salt_intake IN ('low', 'moderate', 'high')),
  fruit_vegetable_servings_day INT,
  
  -- Family History
  family_history_premature_cvd BOOLEAN,
  family_history_diabetes BOOLEAN,
  family_relation VARCHAR(100),
  family_age_at_diagnosis INT,
  
  -- Physical Measurements (Tool 2: ASSESS)
  height_cm DECIMAL(6, 2),
  weight_kg DECIMAL(6, 2),
  bmi DECIMAL(5, 2),
  waist_circumference_cm DECIMAL(6, 2),
  
  systolic_bp INT,
  diastolic_bp INT,
  pulse_rate INT,
  pulse_rhythm VARCHAR(50),
  
  -- Laboratory (Tool 2: ASSESS)
  total_cholesterol_mmol_l DECIMAL(5, 2),
  hdl_cholesterol_mmol_l DECIMAL(5, 2),
  ldl_cholesterol_mmol_l DECIMAL(5, 2),
  triglycerides_mmol_l DECIMAL(5, 2),
  
  fasting_glucose_mmol_l DECIMAL(5, 2),
  hba1c_percent DECIMAL(4, 2),
  
  urine_protein VARCHAR(50) CHECK (urine_protein IN ('Negative', 'Trace', '1+', '2+', '3+')),
  urine_ketones VARCHAR(50),
  
  serum_creatinine_umol_l DECIMAL(6, 2),
  egfr DECIMAL(5, 2),
  
  -- CVD Risk Score Calculation (Tool 4: ESTIMATE)
  -- Using WHO/ISH risk prediction charts
  cvd_risk_10year_percent DECIMAL(5, 2),
  cvd_risk_category VARCHAR(50) CHECK (cvd_risk_category IN (
    '<10%', '10-20%', '20-30%', '≥30%'
  )),
  
  risk_chart_used VARCHAR(100),     -- 'WHO/ISH South-East Asia Region'
  
  -- Referral Needed (Tool 3: REFER)
  urgent_referral_required BOOLEAN DEFAULT FALSE,
  referral_reasons TEXT[],
  referral_facility_id UUID REFERENCES facility.facilities(id),
  
  -- Assessment Summary
  assessment_summary TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cvd_assessments_patient ON ncd.cvd_risk_assessments(patient_id);
CREATE INDEX idx_cvd_assessments_enrollment ON ncd.cvd_risk_assessments(enrollment_id);
CREATE INDEX idx_cvd_assessments_date ON ncd.cvd_risk_assessments(assessment_date DESC);
CREATE INDEX idx_cvd_assessments_risk ON ncd.cvd_risk_assessments(cvd_risk_category);
```

#### Table: `ncd.follow_up_visits`
```sql
CREATE TABLE ncd.follow_up_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient.patients(id),
  enrollment_id UUID NOT NULL REFERENCES ncd.enrollments(id),
  encounter_id UUID NOT NULL REFERENCES clinical.encounters(id),
  
  -- Visit Information
  visit_date DATE NOT NULL,
  visit_type VARCHAR(50) CHECK (visit_type IN (
    'Scheduled Follow-up',
    'Unscheduled',
    'Phone Consultation',
    'Home Visit'
  )),
  
  -- Treatment Adherence (Tool 7: FOLLOW-UP)
  medication_adherence VARCHAR(50) CHECK (medication_adherence IN (
    'Excellent', 'Good', 'Fair', 'Poor'
  )),
  
  missed_doses_last_week INT,
  side_effects_reported BOOLEAN,
  side_effects_description TEXT,
  
  -- Lifestyle Adherence
  diet_adherence VARCHAR(50),
  exercise_adherence VARCHAR(50),
  tobacco_cessation_progress VARCHAR(50),
  
  -- Current Measurements
  current_bp_systolic INT,
  current_bp_diastolic INT,
  current_weight_kg DECIMAL(6, 2),
  current_blood_glucose DECIMAL(5, 2),
  current_hba1c DECIMAL(4, 2),
  
  -- Target Achievement
  bp_target_met BOOLEAN,
  glucose_target_met BOOLEAN,
  weight_target_met BOOLEAN,
  
  -- Complications Screening
  complications_assessed BOOLEAN,
  new_complications_detected BOOLEAN,
  complications_notes TEXT,
  
  -- Treatment Modification
  treatment_modified BOOLEAN,
  treatment_modification_reason TEXT,
  new_medications JSONB,
  discontinued_medications JSONB,
  
  -- Next Visit
  next_visit_scheduled DATE,
  next_visit_reason TEXT,
  
  -- Provider
  provider_id UUID,
  facility_id UUID REFERENCES facility.facilities(id),
  
  -- Visit Notes
  clinical_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_followup_patient ON ncd.follow_up_visits(patient_id);
CREATE INDEX idx_followup_enrollment ON ncd.follow_up_visits(enrollment_id);
CREATE INDEX idx_followup_date ON ncd.follow_up_visits(visit_date DESC);
CREATE INDEX idx_followup_next ON ncd.follow_up_visits(next_visit_scheduled) WHERE next_visit_scheduled IS NOT NULL;
```

---

### Schema 5: `import` - Legacy Data Import Tracking

#### Table: `import.batches`
```sql
CREATE TABLE import.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Batch Information
  batch_name VARCHAR(255) NOT NULL,
  batch_source VARCHAR(100) NOT NULL,  -- 'NCD_Legacy', 'HBS_Legacy', 'Manual_Entry'
  import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  imported_by UUID,
  
  -- File Information
  source_file_name VARCHAR(255),
  source_file_size_bytes BIGINT,
  source_file_hash VARCHAR(64),        -- SHA-256 hash for duplicate detection
  
  -- Processing Status
  processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN (
    'pending', 'processing', 'completed', 'failed', 'partially_completed'
  )),
  
  -- Statistics
  total_records INT,
  records_processed INT DEFAULT 0,
  records_successful INT DEFAULT 0,
  records_failed INT DEFAULT 0,
  records_skipped INT DEFAULT 0,
  
  -- Data Quality
  average_quality_score DECIMAL(3, 2),
  validation_errors JSONB,             -- [{record_num, field, error}, ...]
  
  -- Processing Details
  processing_started_at TIMESTAMP,
  processing_completed_at TIMESTAMP,
  processing_duration_seconds INT,
  
  -- Configuration
  import_config JSONB,                 -- {duplicate_handling: 'skip'|'update'|'merge'}
  field_mappings JSONB,                -- {source_field: target_field}
  
  -- Results
  import_summary JSONB,                -- {new_patients: 50, updated_patients: 10, ...}
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_batches_source ON import.batches(batch_source);
CREATE INDEX idx_batches_status ON import.batches(processing_status);
CREATE INDEX idx_batches_date ON import.batches(import_date DESC);
```

#### Table: `import.import_log`
```sql
CREATE TABLE import.import_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES import.batches(id) ON DELETE CASCADE,
  
  -- Record Information
  source_record_number INT,
  legacy_id VARCHAR(100),
  
  -- Processing Result
  import_status VARCHAR(50) CHECK (import_status IN (
    'success', 'failed', 'skipped', 'duplicate'
  )),
  
  -- Target Record
  patient_id UUID REFERENCES patient.patients(id),
  encounter_id UUID REFERENCES clinical.encounters(id),
  
  -- Data Quality
  quality_score DECIMAL(3, 2),
  quality_issues JSONB,
  
  -- Errors
  error_message TEXT,
  error_details JSONB,
  
  -- Duplicate Handling
  duplicate_of_patient_id UUID REFERENCES patient.patients(id),
  duplicate_resolution VARCHAR(50),    -- 'skipped', 'merged', 'updated'
  
  -- Source Data (for reference)
  source_data JSONB,
  
  -- Timestamp
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_import_log_batch ON import.import_log(batch_id);
CREATE INDEX idx_import_log_status ON import.import_log(import_status);
CREATE INDEX idx_import_log_legacy ON import.import_log(legacy_id);
CREATE INDEX idx_import_log_patient ON import.import_log(patient_id) WHERE patient_id IS NOT NULL;
```

---

## 🔐 Authentication & Authorization

### Supabase Auth Configuration

#### Auth Providers
```typescript
// supabase.config.ts
const supabaseAuth = {
  providers: {
    email: true,              // Email/password authentication
    google: true,             // Google OAuth2
    phone: false,             // SMS OTP (future)
    magic_link: false,        // Passwordless (future)
  },
  
  // Session configuration
  session: {
    expiresIn: 3600,          // 1 hour
    refreshTokenRotation: true,
    autoRefreshToken: true,
  },
  
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
};
```

#### Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE patient.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncd.enrollments ENABLE ROW LEVEL SECURITY;

-- Create auth.user_roles table
CREATE TABLE auth.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN (
    'admin', 'doctor', 'nurse', 'registrar', 'pharmacist', 
    'lab_tech', 'data_entry', 'community_health_worker'
  )),
  facility_id UUID REFERENCES facility.facilities(id),
  permissions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policy: Users can only view patients from their facility
CREATE POLICY patient_view_policy ON patient.patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND (
          user_roles.role = 'admin' OR
          patients.registration_facility_id = user_roles.facility_id
        )
    )
  );

-- Policy: Only authorized roles can insert patients
CREATE POLICY patient_insert_policy ON patient.patients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'registrar', 'doctor', 'nurse')
    )
  );

-- Policy: Users can only update patients from their facility
CREATE POLICY patient_update_policy ON patient.patients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND (
          user_roles.role = 'admin' OR
          patients.registration_facility_id = user_roles.facility_id
        )
    )
  );

-- Similar policies for encounters, vitals, etc.
```

---

## 📥 Bulk Import System

### Import Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    BULK IMPORT WORKFLOW                     │
└─────────────────────────────────────────────────────────────┘

Step 1: File Upload
  ↓
  User uploads CSV file (NCD_01_Patients.csv, etc.)
  ↓
  System validates:
    - File format (CSV, XLSX)
    - File size (< 10MB)
    - Required columns present
  ↓
  Create import.batches record

Step 2: Data Validation
  ↓
  Parse CSV rows
  ↓
  For each row:
    - Validate data types
    - Check required fields
    - Detect duplicates (by FCN, Progress_ID, phone)
    - Calculate quality score
  ↓
  Show validation summary to user

Step 3: Duplicate Resolution
  ↓
  Present duplicates to user
  ↓
  User chooses action per duplicate:
    - Skip (don't import)
    - Update existing (merge new data)
    - Create new (force duplicate)
  ↓
  Save resolution choices

Step 4: Data Import
  ↓
  For each validated row:
    - Generate new MRN
    - Preserve legacy IDs (Legacy_NCD_Number, FCN, etc.)
    - Insert into patient.patients
    - Link to import.batches via import_batch_id
    - Log in import.import_log
  ↓
  Update batch statistics

Step 5: Post-Import
  ↓
  Generate import report:
    - Total records processed
    - Successful imports
    - Failed imports
    - Duplicates skipped
    - Data quality summary
  ↓
  Email report to user
  ↓
  Mark batch as 'completed'
```

### Import API

```typescript
// Edge Function: /functions/import-patients

export async function POST(req: Request) {
  const { file, batchConfig } = await req.json();
  
  // 1. Create batch record
  const batch = await supabase
    .from('import.batches')
    .insert({
      batch_name: file.name,
      batch_source: batchConfig.source,
      total_records: file.rows.length,
      import_config: batchConfig,
    })
    .select()
    .single();
  
  // 2. Validate data
  const validationResults = await validateImportData(file.rows);
  
  // 3. Detect duplicates
  const duplicates = await detectDuplicates(file.rows);
  
  // 4. Return preview
  return {
    batchId: batch.id,
    validation: validationResults,
    duplicates: duplicates,
    ready: validationResults.errors.length === 0,
  };
}

// Duplicate detection logic
async function detectDuplicates(rows) {
  const duplicates = [];
  
  for (const row of rows) {
    // Check by FCN
    if (row.FCN) {
      const existing = await supabase
        .from('patient.patients')
        .select('id, mrn, given_name, family_name, fcn')
        .eq('fcn', row.FCN)
        .maybeSingle();
      
      if (existing) {
        duplicates.push({
          row: row,
          existing: existing,
          matchType: 'FCN',
          confidence: 'high',
        });
        continue;
      }
    }
    
    // Check by Progress_ID
    if (row.Progress_ID) {
      const existing = await supabase
        .from('patient.patients')
        .select('id, mrn, given_name, family_name, progress_id')
        .eq('progress_id', row.Progress_ID)
        .maybeSingle();
      
      if (existing) {
        duplicates.push({
          row: row,
          existing: existing,
          matchType: 'Progress_ID',
          confidence: 'high',
        });
        continue;
      }
    }
    
    // Check by name + DOB (fuzzy)
    const nameDobMatches = await supabase
      .from('patient.patients')
      .select('id, mrn, given_name, family_name, date_of_birth')
      .eq('date_of_birth', row.Date_of_Birth)
      .ilike('given_name', `%${row.Given_Name}%`)
      .ilike('family_name', `%${row.Family_Name}%`);
    
    if (nameDobMatches.data && nameDobMatches.data.length > 0) {
      duplicates.push({
        row: row,
        existing: nameDobMatches.data,
        matchType: 'Name + DOB',
        confidence: 'medium',
      });
    }
  }
  
  return duplicates;
}
```

### Data Quality Scoring

```typescript
function calculateQualityScore(row) {
  let score = 0;
  let maxScore = 0;
  
  // Required fields (0.4 weight)
  const requiredFields = ['Given_Name', 'Family_Name', 'Date_of_Birth', 'Sex'];
  requiredFields.forEach(field => {
    maxScore += 10;
    if (row[field] && row[field].trim()) score += 10;
  });
  
  // Contact information (0.2 weight)
  const contactFields = ['Phone_Primary', 'Phone_Secondary', 'Email'];
  contactFields.forEach(field => {
    maxScore += 5;
    if (row[field] && row[field].trim()) score += 5;
  });
  
  // Identifiers (0.3 weight)
  const identifierFields = ['FCN', 'Progress_ID', 'National_ID'];
  identifierFields.forEach(field => {
    maxScore += 7;
    if (row[field] && row[field].trim()) score += 7;
  });
  
  // Address (0.1 weight)
  const addressFields = ['Camp_Name', 'Block', 'Village'];
  addressFields.forEach(field => {
    maxScore += 3;
    if (row[field] && row[field].trim()) score += 3;
  });
  
  return (score / maxScore).toFixed(2); // 0.00 to 1.00
}
```

---

## 🌐 Frontend Architecture

### Firebase Hosting Structure

```
firebase.json
├── hosting
│   ├── public: "build"
│   ├── rewrites
│   │   └── source: "**" → destination: "/index.html"
│   └── headers
│       └── Cache-Control, Security Headers

Project Structure:
src/
├── apps/
│   ├── provider-portal/        # Main clinician interface
│   │   ├── pages/
│   │   │   ├── PatientSearch.tsx
│   │   │   ├── PatientRegistration.tsx
│   │   │   ├── NCDEnrollment.tsx
│   │   │   ├── ClinicalEncounter.tsx
│   │   │   ├── NCDFollowUp.tsx
│   │   │   └── Dashboard.tsx
│   │   └── components/
│   │
│   ├── admin-portal/           # Admin & reporting
│   │   ├── pages/
│   │   │   ├── UserManagement.tsx
│   │   │   ├── FacilityManagement.tsx
│   │   │   ├── ImportData.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── SystemSettings.tsx
│   │   └── components/
│   │
│   └── patient-portal/         # Patient-facing (future)
│       └── pages/
│
├── shared/
│   ├── components/
│   │   ├── PatientCard.tsx
│   │   ├── VitalSignsForm.tsx
│   │   ├── NCDRiskCalculator.tsx
│   │   ├── MedicationProtocol.tsx
│   │   └── ImportWizard.tsx
│   │
│   ├── hooks/
│   │   ├── useSupabase.ts
│   │   ├── useAuth.ts
│   │   ├── usePatient.ts
│   │   └── useNCD.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── auth.ts              # Auth helpers
│   │   └── validators.ts        # Form validation
│   │
│   └── types/
│       ├── patient.ts
│       ├── clinical.ts
│       └── ncd.ts
│
└── styles/
    └── globals.css
```

### Key React Components

#### Patient Search Component
```tsx
// src/shared/components/PatientSearch.tsx

import { useState } from 'react';
import { useSupabase } from '@/shared/hooks/useSupabase';

export function PatientSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { supabase } = useSupabase();
  
  const handleSearch = async () => {
    const { data, error } = await supabase
      .from('patient.patients')
      .select(`
        id,
        mrn,
        given_name,
        family_name,
        date_of_birth,
        phone_primary,
        fcn,
        progress_id,
        patient_status
      `)
      .or(`
        mrn.ilike.%${searchQuery}%,
        phone_primary.ilike.%${searchQuery}%,
        fcn.ilike.%${searchQuery}%,
        progress_id.ilike.%${searchQuery}%
      `)
      .eq('patient_status', 'active')
      .is('deleted_at', null)
      .limit(10);
    
    if (data) setSearchResults(data);
  };
  
  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search by MRN, Phone, FCN, or Progress ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button onClick={handleSearch} className="btn-primary">
        Search
      </button>
      
      <div className="space-y-2">
        {searchResults.map(patient => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
}
```

#### NCD Enrollment Form
```tsx
// src/apps/provider-portal/pages/NCDEnrollment.tsx

export function NCDEnrollment({ patientId }) {
  const [formData, setFormData] = useState({
    ncd_type: [],
    primary_ncd: '',
    enrollment_source: 'OPD Diagnosis',
    tobacco_use: false,
    alcohol_use: false,
    // ... more fields
  });
  
  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from('ncd.enrollments')
      .insert({
        patient_id: patientId,
        ...formData,
        enrollment_facility_id: currentUser.facility_id,
        enrolled_by: currentUser.id,
      })
      .select()
      .single();
    
    if (data) {
      // Also create initial CVD risk assessment
      await createCVDRiskAssessment(data.id);
      
      // Redirect to treatment protocol setup
      navigate(`/ncd/protocols/${data.id}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* NCD enrollment form fields */}
    </form>
  );
}
```

---

## 📊 API Layer (Supabase Auto-Generated + Edge Functions)

### Supabase REST API (Auto-Generated)

Supabase automatically generates REST API from database schema:

```bash
# Get all patients
GET /rest/v1/patient.patients?select=*

# Get patient with addresses
GET /rest/v1/patient.patients?id=eq.{uuid}&select=*,addresses:patient.addresses(*)

# Search patients
GET /rest/v1/patient.patients?or=(mrn.ilike.*MRN-2024*,phone_primary.ilike.*880*)

# Get NCD enrollments with follow-ups
GET /rest/v1/ncd.enrollments?patient_id=eq.{uuid}&select=*,follow_ups:ncd.follow_up_visits(*)

# Create encounter
POST /rest/v1/clinical.encounters
Content-Type: application/json
{
  "patient_id": "...",
  "facility_id": "...",
  "encounter_type": "OPD",
  "visit_date": "2026-02-16",
  "chief_complaint": "Fever and cough"
}
```

### Edge Functions (Custom Business Logic)

```typescript
// supabase/functions/calculate-cvd-risk/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { assessmentId } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Get assessment data
  const { data: assessment } = await supabase
    .from('ncd.cvd_risk_assessments')
    .select('*')
    .eq('id', assessmentId)
    .single();
  
  // Calculate 10-year CVD risk using WHO/ISH charts
  const riskScore = calculateWHORisk({
    age: assessment.age,
    sex: assessment.sex,
    smoking: assessment.tobacco_current,
    systolicBP: assessment.systolic_bp,
    totalCholesterol: assessment.total_cholesterol_mmol_l,
    diabetes: assessment.fasting_glucose_mmol_l >= 7.0,
  });
  
  // Update assessment with calculated risk
  await supabase
    .from('ncd.cvd_risk_assessments')
    .update({
      cvd_risk_10year_percent: riskScore,
      cvd_risk_category: getRiskCategory(riskScore),
    })
    .eq('id', assessmentId);
  
  return new Response(
    JSON.stringify({ riskScore, category: getRiskCategory(riskScore) }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});

function calculateWHORisk(params) {
  // Implementation of WHO/ISH risk prediction algorithm
  // Based on charts from Bangladesh NCD Protocol
  // ...
  return riskPercentage;
}

function getRiskCategory(score) {
  if (score < 10) return '<10%';
  if (score < 20) return '10-20%';
  if (score < 30) return '20-30%';
  return '≥30%';
}
```

---

## 🚀 Deployment Guide

### Prerequisites
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Install Supabase CLI
npm install -g supabase

# Login to Firebase
firebase login

# Login to Supabase
supabase login
```

### 1. Supabase Setup

```bash
# Initialize Supabase project
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run database migrations
supabase db push

# Deploy edge functions
supabase functions deploy calculate-cvd-risk
supabase functions deploy import-patients
supabase functions deploy generate-report
```

### 2. Firebase Setup

```bash
# Initialize Firebase project
firebase init hosting

# Select options:
# - Public directory: build
# - Single-page app: Yes
# - GitHub integration: Yes (optional)

# Build React app
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### 3. Environment Variables

```env
# .env.local (Frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Supabase Edge Functions
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Cost Estimation

#### Supabase Free Tier
```yaml
Database: 500 MB (sufficient for 50,000+ patient records)
Storage: 1 GB (for documents, images)
Bandwidth: 2 GB/month (≈10,000 API calls)
Auth Users: Unlimited
Edge Functions: 500,000 invocations/month

Estimated Capacity:
  - Patients: 50,000
  - Encounters: 200,000
  - Facilities: 100
  - Users: 500
```

#### Firebase Free Tier
```yaml
Hosting: 10 GB storage, 360 MB/day transfer
Authentication: Unlimited
Cloud Functions: 125,000 invocations/month

Estimated Capacity:
  - Monthly visitors: 10,000
  - Page views: 100,000
  - Authentication requests: Unlimited
```

**Total Cost for Small Deployment: $0/month**

---

## 📈 NCD Clinical Decision Support

### Hypertension Treatment Algorithm (Embedded in UI)

```tsx
// src/shared/components/HypertensionProtocol.tsx

export function HypertensionProtocolSelector({ patient, vitals }) {
  const { systolic, diastolic } = vitals;
  
  // Determine protocol
  let protocol = null;
  let medications = [];
  
  if (patient.is_pregnant) {
    return <Alert>Urgent referral required for pregnant patient with hypertension</Alert>;
  }
  
  if (systolic >= 160 || diastolic >= 100) {
    // Protocol II
    protocol = 'Hypertension Protocol II';
    medications = [
      { drug: 'Amlodipine', dose: '2.5-5 mg', frequency: 'Once daily' },
      { drug: 'Losartan', dose: '50 mg', frequency: 'Once daily' },
    ];
    
    return (
      <ProtocolCard protocol={protocol}>
        <p className="text-red-600 font-bold">Severe Hypertension</p>
        <p>SBP ≥160 mmHg or DBP ≥100 mmHg</p>
        
        <h4>Initial Treatment:</h4>
        <ul>
          {medications.map(med => (
            <li key={med.drug}>
              {med.drug} {med.dose} {med.frequency}
            </li>
          ))}
        </ul>
        
        <h4>Follow-up:</h4>
        <p>Review in 1 month</p>
        <p>If target not met → Increase Losartan to 100 mg</p>
        <p>If still not met → Add HCTZ 12.5-25 mg + REFER</p>
        
        <button onClick={() => prescribeMedications(medications)}>
          Prescribe Protocol II
        </button>
      </ProtocolCard>
    );
  }
  
  if (systolic >= 140 || diastolic >= 90) {
    // Protocol I
    protocol = 'Hypertension Protocol I';
    medications = [
      { drug: 'Amlodipine', dose: '2.5-5 mg', frequency: 'Once daily' },
    ];
    
    return (
      <ProtocolCard protocol={protocol}>
        <p className="text-yellow-600 font-bold">Stage 1 Hypertension</p>
        <p>SBP 140-159 mmHg or DBP 90-99 mmHg</p>
        
        <h4>Initial Treatment:</h4>
        <ul>
          {medications.map(med => (
            <li key={med.drug}>
              {med.drug} {med.dose} {med.frequency}
            </li>
          ))}
        </ul>
        
        <h4>Follow-up:</h4>
        <p>Review in 1 month</p>
        <p>If target not met → Increase to Amlodipine 10 mg</p>
        <p>If still not met → REFER</p>
        
        <button onClick={() => prescribeMedications(medications)}>
          Prescribe Protocol I
        </button>
      </ProtocolCard>
    );
  }
  
  return <Alert type="success">Blood pressure within normal range</Alert>;
}
```

---

## 🎯 GitHub Repository Structure

```
https://github.com/zs-health/
├── zarish-health-his/           # Main application repository
│   ├── README.md
│   ├── LICENSE (MIT)
│   ├── .github/
│   │   └── workflows/
│   │       ├── firebase-deploy.yml
│   │       └── supabase-deploy.yml
│   │
│   ├── supabase/
│   │   ├── migrations/
│   │   │   ├── 20260216000001_initial_schema.sql
│   │   │   ├── 20260216000002_patient_schema.sql
│   │   │   ├── 20260216000003_clinical_schema.sql
│   │   │   ├── 20260216000004_ncd_schema.sql
│   │   │   ├── 20260216000005_facility_schema.sql
│   │   │   └── 20260216000006_import_schema.sql
│   │   │
│   │   ├── functions/
│   │   │   ├── calculate-cvd-risk/
│   │   │   ├── import-patients/
│   │   │   └── generate-report/
│   │   │
│   │   └── seed.sql             # Sample data
│   │
│   ├── src/
│   │   ├── apps/
│   │   ├── shared/
│   │   └── styles/
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── firebase.json
│
├── zarish-health-docs/          # Documentation repository
│   ├── prd/
│   │   └── PRD_v2.md
│   ├── api/
│   │   └── API_Reference.md
│   ├── deployment/
│   │   └── Deployment_Guide.md
│   └── clinical-protocols/
│       ├── NCD_Protocol.md
│       ├── Hypertension_Management.md
│       └── Diabetes_Management.md
│
└── zarish-health-data/          # Sample data & imports
    ├── sample-patients.csv
    ├── sample-ncd-enrollments.csv
    └── import-templates/
```

---

## 📚 Complete Workflow Example: NCD Patient Journey

### Scenario: New NCD Patient from Community Screening

**Step 1: Community Screening (Health Outreach)**
```sql
-- Health worker measures vitals in community
INSERT INTO clinical.encounters (
  patient_id, facility_id, encounter_type, visit_date, chief_complaint
) VALUES (
  'patient-uuid', 'HO-C2W-uuid', 'NCD Screening', '2026-02-16', 
  'Community NCD screening'
);

-- Record vitals
INSERT INTO clinical.vital_signs (
  encounter_id, patient_id, measurement_date,
  systolic_bp, diastolic_bp, blood_glucose_mmol_l, glucose_test_type,
  weight_kg, height_cm
) VALUES (
  'encounter-uuid', 'patient-uuid', '2026-02-16',
  155, 95, 8.5, 'RBS',
  75, 165
);
-- Auto-calculated: hypertension_stage = 'Stage 1', diabetes_risk = 'Indeterminate'
```

**Step 2: High-Risk Patient Referred to HP NCD Corner**
```sql
-- Update encounter with referral
UPDATE clinical.encounters
SET 
  referral_required = TRUE,
  referral_facility_id = 'HP-C1E-NCD-uuid',
  referral_reason = 'BP 155/95, RBS 8.5 mmol/L - Suspected HTN + DM',
  referral_urgency = 'routine'
WHERE id = 'encounter-uuid';
```

**Step 3: Patient Visits NCD Corner for Enrollment**
```sql
-- Create NCD enrollment
INSERT INTO ncd.enrollments (
  patient_id, enrollment_date, enrollment_facility_id,
  ncd_type, primary_ncd, enrollment_source,
  initial_bp_systolic, initial_bp_diastolic, initial_blood_glucose,
  tobacco_use, family_history_diabetes
) VALUES (
  'patient-uuid', '2026-02-18', 'HP-C1E-NCD-uuid',
  ARRAY['Hypertension', 'Type 2 Diabetes'], 'Hypertension', 'Community Screening',
  155, 95, 8.5,
  TRUE, TRUE
);
```

**Step 4: Comprehensive CVD Risk Assessment**
```sql
INSERT INTO ncd.cvd_risk_assessments (
  patient_id, enrollment_id, assessment_date,
  systolic_bp, diastolic_bp, fasting_glucose_mmol_l,
  total_cholesterol_mmol_l, tobacco_current, family_history_diabetes
) VALUES (
  'patient-uuid', 'enrollment-uuid', '2026-02-18',
  155, 95, 9.2,
  6.5, TRUE, TRUE
);

-- Edge function calculates CVD risk
-- cvd_risk_10year_percent = 22.5
-- cvd_risk_category = '20-30%'
```

**Step 5: Initiate Treatment Protocol**
```sql
-- Start Hypertension Protocol I
INSERT INTO ncd.treatment_protocols (
  patient_id, enrollment_id, protocol_type,
  start_date, bp_target_systolic, bp_target_diastolic,
  current_medications
) VALUES (
  'patient-uuid', 'enrollment-uuid', 'Hypertension Protocol I',
  '2026-02-18', 130, 80,
  '[{"drug": "Amlodipine", "dose": "5 mg", "frequency": "Once daily"}]'::jsonb
);

-- Start Diabetes Protocol
INSERT INTO ncd.treatment_protocols (
  patient_id, enrollment_id, protocol_type,
  start_date, glucose_target_fpg, glucose_target_hba1c,
  current_medications
) VALUES (
  'patient-uuid', 'enrollment-uuid', 'Diabetes Protocol',
  '2026-02-18', 7.0, 7.0,
  '[{"drug": "Metformin", "dose": "500 mg", "frequency": "Once daily"}]'::jsonb
);
```

**Step 6: Schedule Follow-up**
```sql
-- Create follow-up encounter (scheduled)
INSERT INTO clinical.encounters (
  patient_id, facility_id, encounter_type, visit_date, encounter_status
) VALUES (
  'patient-uuid', 'HP-C1E-NCD-uuid', 'NCD Review', '2026-03-18', 'active'
);
```

**Step 7: 1-Month Follow-up Visit**
```sql
-- Record follow-up visit
INSERT INTO ncd.follow_up_visits (
  patient_id, enrollment_id, encounter_id, visit_date, visit_type,
  medication_adherence, current_bp_systolic, current_bp_diastolic,
  current_blood_glucose, bp_target_met
) VALUES (
  'patient-uuid', 'enrollment-uuid', 'followup-encounter-uuid',
  '2026-03-18', 'Scheduled Follow-up',
  'Good', 138, 88,
  7.8, FALSE  -- Target not met
);

-- Protocol escalation
UPDATE ncd.treatment_protocols
SET 
  escalation_step = 1,
  current_medications = '[{"drug": "Amlodipine", "dose": "10 mg", "frequency": "Once daily"}]'::jsonb,
  medication_history = medication_history || '[{"date": "2026-03-18", "action": "Increased", "drug": "Amlodipine", "from": "5 mg", "to": "10 mg"}]'::jsonb
WHERE patient_id = 'patient-uuid' AND protocol_type = 'Hypertension Protocol I';
```

---

## ✅ Go-Live Checklist

### Phase 1: Infrastructure Setup
- [ ] Supabase project created
- [ ] Firebase project created
- [ ] Database schemas deployed
- [ ] Row-Level Security policies enabled
- [ ] Edge functions deployed
- [ ] Environment variables configured

### Phase 2: Data Migration
- [ ] Legacy patient data exported to CSV
- [ ] Import templates prepared
- [ ] Bulk import tested with sample data
- [ ] Duplicate detection verified
- [ ] Data quality validation passed

### Phase 3: Application Deployment
- [ ] React app built successfully
- [ ] Firebase hosting configured
- [ ] Google OAuth2 enabled
- [ ] Authentication tested
- [ ] User roles created

### Phase 4: Facility Setup
- [ ] Health Post facilities created
- [ ] Health Outreach facilities created
- [ ] NCD Corner facility created
- [ ] Facility users assigned
- [ ] Facility permissions tested

### Phase 5: Clinical Validation
- [ ] Patient registration tested
- [ ] NCD enrollment workflow tested
- [ ] CVD risk calculation verified
- [ ] Treatment protocols validated
- [ ] Follow-up scheduling tested

### Phase 6: Training & Documentation
- [ ] User manuals created (English, Bangla)
- [ ] Training videos recorded
- [ ] Staff training completed
- [ ] Helpdesk established
- [ ] Feedback mechanism setup

---

## 📞 Support & Resources

```yaml
GitHub Organization: https://github.com/zs-health
Documentation: https://github.com/zs-health/zarish-health-docs
Issue Tracker: https://github.com/zs-health/zarish-health-his/issues

Technical Support:
  Email: zarishhis@gmail.com
  Slack: zarishhealth.slack.com

Contributing:
  See: CONTRIBUTING.md
  Code of Conduct: CODE_OF_CONDUCT.md
```

---

## 🗺️ Roadmap

### ✅ MVP  - CURRENT
- Patient registration with legacy import
- Decentralized facility management (HP, HO)
- NCD enrollment and screening
- CVD risk assessment (WHO/ISH)
- Hypertension Protocol I & II
- Diabetes Protocol
- Follow-up visit tracking
- Basic reporting

### 🚧 Phase 2 
- Patient portal (view records, appointments)
- SMS notifications (appointment reminders)
- Lab integration
- Medication inventory management
- Advanced NCD complications tracking
- Bulk reporting (DHIS2 integration)

### 📅 Phase 3 
- Mobile app (offline-first for community workers)
- FHIR API for external integrations
- Telemedicine support
- AI-powered risk prediction
- National health database sync

---

## 📄 Document Control

```yaml
Document: ZARISH HEALTH HIS - Product Requirements Document v2
Version: 2.0.0
Status: Active
Date: February 16, 2026
GitHub: https://github.com/zs-health

Major Changes from v1:
  - Migrated from Kubernetes to Firebase/Supabase
  - Added bulk import functionality
  - Added comprehensive NCD protocols
  - Added decentralized facility management
  - Simplified deployment (zero DevOps)
  - Cost reduced from $500+/mo to $0/mo for small deployments

Revision History:
  2.0.0 (2026-02-16): Firebase/Supabase architecture, NCD protocols, bulk import
  1.0.0 (2026-02-15): Initial Kubernetes-based architecture
```

---

**END OF DOCUMENT**

This PRD is now optimized for **Firebase + Supabase**, includes **complete NCD management**, supports **legacy data import**, and enables **decentralized health facilities**—all at near-zero cost for small deployments.
