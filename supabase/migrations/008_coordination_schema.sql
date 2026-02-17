-- ============================================================
-- ZARISH HEALTH v3 — Coordination Tables
-- Version: 3.0.0
-- Description: Cross-program referrals, follow-ups, home visits, missed appointments
-- ============================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Cross-Program Referrals
-- ============================================================
CREATE TABLE IF NOT EXISTS coordination.cross_program_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referral Information
    patient_id UUID NOT NULL REFERENCES patients(id),
    source_encounter_id UUID REFERENCES encounters(id),
    
    -- Programs
    from_program VARCHAR(50) NOT NULL CHECK (from_program IN ('HP', 'HO', 'HSS')),
    to_program VARCHAR(50) NOT NULL CHECK (to_program IN ('HP', 'HO', 'HSS')),
    
    from_facility_id UUID REFERENCES facilities(id),
    to_facility_id UUID REFERENCES facilities(id),
    
    -- Referral Details
    referral_date DATE NOT NULL DEFAULT CURRENT_DATE,
    referral_reason TEXT NOT NULL,
    referral_type VARCHAR(50) CHECK (referral_type IN (
        'Follow-up Required', 'Home Visit Needed', 'Clinic Consultation',
        'Lab Investigation', 'Medication Refill', 'Missed Appointment',
        'Step-down Care', 'Step-up Care'
    )),
    
    urgency VARCHAR(50) DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
    
    -- Clinical Context
    current_diagnosis TEXT,
    current_medications JSONB,
    special_instructions TEXT,
    
    -- Referral Status
    referral_status VARCHAR(50) DEFAULT 'pending' CHECK (referral_status IN (
        'pending', 'acknowledged', 'scheduled', 'completed', 'cancelled', 'declined'
    )),
    
    -- Response
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMPTZ,
    scheduled_date DATE,
    completed_date DATE,
    completion_notes TEXT,
    
    -- Outcome
    outcome_encounter_id UUID REFERENCES encounters(id),
    outcome_summary TEXT,
    
    -- Created By
    referred_by UUID NOT NULL REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_patient ON coordination.cross_program_referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_from_program ON coordination.cross_program_referrals(from_program);
CREATE INDEX IF NOT EXISTS idx_referrals_to_program ON coordination.cross_program_referrals(to_program);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON coordination.cross_program_referrals(referral_status);
CREATE INDEX IF NOT EXISTS idx_referrals_date ON coordination.cross_program_referrals(referral_date DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_by ON coordination.cross_program_referrals(referred_by);

-- ============================================================
-- Shared Follow-ups (HP ↔ HO)
-- ============================================================
CREATE TABLE IF NOT EXISTS coordination.shared_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    patient_id UUID NOT NULL REFERENCES patients(id),
    ncd_enrollment_id UUID REFERENCES ncd_enrollments(id),
    
    -- Originating Program
    scheduled_by_program VARCHAR(50) NOT NULL CHECK (scheduled_by_program IN ('HP', 'HO', 'HSS')),
    scheduled_by_user_id UUID REFERENCES auth.users(id),
    scheduled_by_facility_id UUID REFERENCES facilities(id),
    
    -- Follow-up Details
    follow_up_date DATE NOT NULL,
    follow_up_type VARCHAR(50) CHECK (follow_up_type IN (
        'NCD Review', 'Medication Check', 'Home Visit',
        'Clinic Visit', 'Lab Review', 'Complication Assessment'
    )),
    
    -- Can be completed by any program
    completed_by_program VARCHAR(50) CHECK (completed_by_program IN ('HP', 'HO', 'HSS') OR completed_by_program IS NULL),
    completed_by_user_id UUID REFERENCES auth.users(id),
    completed_at TIMESTAMPTZ,
    completion_notes TEXT,
    
    -- Status
    follow_up_status VARCHAR(50) DEFAULT 'scheduled' CHECK (follow_up_status IN (
        'scheduled', 'reminded', 'completed', 'missed', 'cancelled', 'rescheduled'
    )),
    
    -- Visibility (which programs can see this follow-up)
    visible_to_programs TEXT[] DEFAULT ARRAY['HP', 'HO']::TEXT[],
    
    -- Next Follow-up
    next_follow_up_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for follow-ups
CREATE INDEX IF NOT EXISTS idx_follow_ups_patient ON coordination.shared_follow_ups(patient_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_program ON coordination.shared_follow_ups(scheduled_by_program);
CREATE INDEX IF NOT EXISTS idx_follow_ups_completed_program ON coordination.shared_follow_ups(completed_by_program);
CREATE INDEX IF NOT EXISTS idx_follow_ups_date ON coordination.shared_follow_ups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON coordination.shared_follow_ups(follow_up_status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_visible ON coordination.shared_follow_ups USING gin(visible_to_programs);
CREATE INDEX IF NOT EXISTS idx_follow_ups_enrollment ON coordination.shared_follow_ups(ncd_enrollment_id);

-- ============================================================
-- Home Visits (HO-specific, visible to HP)
-- ============================================================
CREATE TABLE IF NOT EXISTS coordination.home_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    patient_id UUID NOT NULL REFERENCES patients(id),
    
    -- Visit Information
    visit_date DATE NOT NULL,
    visit_time TIME,
    visit_duration_minutes INT,
    
    -- HO Team
    chw_user_id UUID NOT NULL REFERENCES auth.users(id),
    ho_facility_id UUID REFERENCES facilities(id),
    
    -- Location
    home_address TEXT,
    gps_latitude NUMERIC(9, 6),
    gps_longitude NUMERIC(9, 6),
    
    -- Visit Purpose
    visit_purpose TEXT[] DEFAULT ARRAY['Follow-up']::TEXT[],
    
    -- Clinical Observations
    vitals_taken BOOLEAN DEFAULT FALSE,
    vital_signs_id UUID REFERENCES vital_signs(id),
    
    medication_adherence VARCHAR(50) CHECK (medication_adherence IN (
        'Excellent', 'Good', 'Fair', 'Poor', 'Not Assessed'
    )),
    
    complications_noted BOOLEAN DEFAULT FALSE,
    complications_description TEXT,
    
    -- Patient Status
    patient_found BOOLEAN DEFAULT TRUE,
    patient_condition VARCHAR(50),
    
    -- Actions Taken
    medications_delivered JSONB,
    health_education_provided TEXT,
    referral_made BOOLEAN DEFAULT FALSE,
    referral_id UUID REFERENCES coordination.cross_program_referrals(id),
    
    -- Next Steps
    requires_hp_visit BOOLEAN DEFAULT FALSE,
    requires_urgent_attention BOOLEAN DEFAULT FALSE,
    next_home_visit_date DATE,
    
    -- Visibility (shared with HP)
    shared_with_hp BOOLEAN DEFAULT TRUE,
    hp_acknowledged_by UUID REFERENCES auth.users(id),
    hp_acknowledged_at TIMESTAMPTZ,
    
    -- Visit Notes
    visit_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for home visits
CREATE INDEX IF NOT EXISTS idx_home_visits_patient ON coordination.home_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_home_visits_chw ON coordination.home_visits(chw_user_id);
CREATE INDEX IF NOT EXISTS idx_home_visits_date ON coordination.home_visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_home_visits_shared ON coordination.home_visits(shared_with_hp) WHERE shared_with_hp = TRUE;
CREATE INDEX IF NOT EXISTS idx_home_visits_urgent ON coordination.home_visits(requires_urgent_attention) WHERE requires_urgent_attention = TRUE;
CREATE INDEX IF NOT EXISTS idx_home_visits_facility ON coordination.home_visits(ho_facility_id);

-- ============================================================
-- Missed Appointments Sharing (HP → HO for follow-up)
-- ============================================================
CREATE TABLE IF NOT EXISTS coordination.missed_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    patient_id UUID NOT NULL REFERENCES patients(id),
    appointment_id UUID,
    
    -- Appointment Details
    scheduled_date DATE NOT NULL,
    scheduled_facility_id UUID REFERENCES facilities(id),
    scheduled_program VARCHAR(50) CHECK (scheduled_program IN ('HP', 'HO', 'HSS')),
    appointment_type VARCHAR(100),
    
    -- Missed Status
    marked_missed_at TIMESTAMPTZ DEFAULT now(),
    marked_missed_by UUID REFERENCES auth.users(id),
    
    -- Follow-up Actions
    follow_up_attempts INT DEFAULT 0,
    last_follow_up_date DATE,
    follow_up_method VARCHAR(50),
    
    -- Outcome
    patient_contacted BOOLEAN DEFAULT FALSE,
    patient_response TEXT,
    rescheduled_date DATE,
    
    -- Sharing for Home Follow-up
    shared_with_ho BOOLEAN DEFAULT TRUE,
    ho_follow_up_assigned BOOLEAN DEFAULT FALSE,
    ho_follow_up_user_id UUID REFERENCES auth.users(id),
    ho_follow_up_completed BOOLEAN DEFAULT FALSE,
    ho_follow_up_notes TEXT,
    
    -- Status
    resolution_status VARCHAR(50) DEFAULT 'open' CHECK (resolution_status IN (
        'open', 'contacted', 'rescheduled', 'patient_relocated', 'patient_deceased', 'closed'
    )),
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for missed appointments
CREATE INDEX IF NOT EXISTS idx_missed_appointments_patient ON coordination.missed_appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_missed_appointments_program ON coordination.missed_appointments(scheduled_program);
CREATE INDEX IF NOT EXISTS idx_missed_appointments_shared ON coordination.missed_appointments(shared_with_ho) WHERE shared_with_ho = TRUE;
CREATE INDEX IF NOT EXISTS idx_missed_appointments_status ON coordination.missed_appointments(resolution_status);
CREATE INDEX IF NOT EXISTS idx_missed_appointments_assigned_ho ON coordination.missed_appointments(ho_follow_up_user_id);
CREATE INDEX IF NOT EXISTS idx_missed_appointments_date ON coordination.missed_appointments(scheduled_date DESC);

-- Enable RLS on coordination tables
ALTER TABLE coordination.cross_program_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination.shared_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination.home_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination.missed_appointments ENABLE ROW LEVEL SECURITY;
