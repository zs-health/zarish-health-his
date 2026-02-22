-- Priority: P0
-- Migration: Cross-Program Coordination Tables

CREATE SCHEMA IF NOT EXISTS coordination;

CREATE TABLE IF NOT EXISTS coordination.cross_program_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  source_encounter_id UUID REFERENCES encounters(id),
  from_program VARCHAR(50) NOT NULL CHECK (from_program IN ('HP', 'HO', 'HSS')),
  to_program VARCHAR(50) NOT NULL CHECK (to_program IN ('HP', 'HO', 'HSS')),
  from_facility_id UUID REFERENCES facilities(id),
  to_facility_id UUID REFERENCES facilities(id),
  referral_date DATE NOT NULL DEFAULT CURRENT_DATE,
  referral_reason TEXT NOT NULL,
  referral_type VARCHAR(50) CHECK (referral_type IN (
    'Follow-up Required', 'Home Visit Needed', 'Clinic Consultation',
    'Lab Investigation', 'Medication Refill', 'Missed Appointment',
    'Step-down Care', 'Step-up Care'
  )),
  urgency VARCHAR(50) DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
  current_diagnosis TEXT,
  current_medications JSONB,
  special_instructions TEXT,
  referral_status VARCHAR(50) DEFAULT 'pending' CHECK (referral_status IN (
    'pending', 'acknowledged', 'scheduled', 'completed', 'cancelled', 'declined'
  )),
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP,
  scheduled_date DATE,
  completed_date DATE,
  completion_notes TEXT,
  outcome_encounter_id UUID REFERENCES encounters(id),
  outcome_summary TEXT,
  referred_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coordination.shared_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  ncd_enrollment_id UUID REFERENCES ncd_enrollments(id),
  scheduled_by_program VARCHAR(50) NOT NULL,
  scheduled_by_user_id UUID REFERENCES auth.users(id),
  scheduled_by_facility_id UUID REFERENCES facilities(id),
  follow_up_date DATE NOT NULL,
  follow_up_type VARCHAR(50),
  completed_by_program VARCHAR(50),
  completed_by_user_id UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP,
  completion_notes TEXT,
  follow_up_status VARCHAR(50) DEFAULT 'scheduled',
  visible_to_programs TEXT[] DEFAULT ARRAY['HP', 'HO'],
  next_follow_up_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coordination.home_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  visit_date DATE NOT NULL,
  visit_time TIME,
  visit_duration_minutes INT,
  chw_user_id UUID NOT NULL REFERENCES auth.users(id),
  ho_facility_id UUID REFERENCES facilities(id),
  home_address TEXT,
  gps_latitude DECIMAL(9, 6),
  gps_longitude DECIMAL(9, 6),
  visit_purpose TEXT[] DEFAULT ARRAY['Follow-up'],
  vitals_taken BOOLEAN DEFAULT FALSE,
  vital_signs_id UUID REFERENCES vital_signs(id),
  medication_adherence VARCHAR(50),
  complications_noted BOOLEAN DEFAULT FALSE,
  complications_description TEXT,
  patient_found BOOLEAN DEFAULT TRUE,
  patient_condition VARCHAR(50),
  medications_delivered JSONB,
  health_education_provided TEXT,
  referral_made BOOLEAN DEFAULT FALSE,
  referral_id UUID REFERENCES coordination.cross_program_referrals(id),
  requires_hp_visit BOOLEAN DEFAULT FALSE,
  requires_urgent_attention BOOLEAN DEFAULT FALSE,
  next_home_visit_date DATE,
  shared_with_hp BOOLEAN DEFAULT TRUE,
  hp_acknowledged_by UUID REFERENCES auth.users(id),
  hp_acknowledged_at TIMESTAMP,
  visit_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coordination.missed_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  appointment_id UUID,
  scheduled_date DATE NOT NULL,
  scheduled_facility_id UUID REFERENCES facilities(id),
  scheduled_program VARCHAR(50),
  appointment_type VARCHAR(100),
  marked_missed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  marked_missed_by UUID REFERENCES auth.users(id),
  follow_up_attempts INT DEFAULT 0,
  last_follow_up_date DATE,
  follow_up_method VARCHAR(50),
  patient_contacted BOOLEAN DEFAULT FALSE,
  patient_response TEXT,
  rescheduled_date DATE,
  shared_with_ho BOOLEAN DEFAULT TRUE,
  ho_follow_up_assigned BOOLEAN DEFAULT FALSE,
  ho_follow_up_user_id UUID REFERENCES auth.users(id),
  ho_follow_up_completed BOOLEAN DEFAULT FALSE,
  ho_follow_up_notes TEXT,
  resolution_status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_patient ON coordination.cross_program_referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_from_program ON coordination.cross_program_referrals(from_program);
CREATE INDEX IF NOT EXISTS idx_referrals_to_program ON coordination.cross_program_referrals(to_program);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON coordination.cross_program_referrals(referral_status);

CREATE INDEX IF NOT EXISTS idx_follow_ups_patient ON coordination.shared_follow_ups(patient_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_date ON coordination.shared_follow_ups(follow_up_date);

CREATE INDEX IF NOT EXISTS idx_home_visits_patient ON coordination.home_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_home_visits_chw ON coordination.home_visits(chw_user_id);
CREATE INDEX IF NOT EXISTS idx_home_visits_date ON coordination.home_visits(visit_date DESC);

CREATE INDEX IF NOT EXISTS idx_missed_appointments_patient ON coordination.missed_appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_missed_appointments_status ON coordination.missed_appointments(resolution_status);
