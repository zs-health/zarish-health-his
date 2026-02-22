# ZARISH HEALTH Multi-Program HIS - Product Requirements Document v3

**Version**: 3.0.0  
**Date**: February 16, 2026  
**Status**: Production Ready  
**Deployment**: https://zarish-health-dd05f.web.app  
**GitHub**: https://github.com/zs-health

---

## 📋 Executive Summary

### Vision
Build a **multi-program, role-based Hospital Information System** that enables coordinated care across decentralized health programs (HP, HO, HSS) while maintaining program autonomy, data security, and comprehensive analytics capabilities.

### Current Deployment Status
```yaml
Production URL: https://zarish-health-dd05f.web.app
Status: Deployed (Firebase Hosting + Supabase Backend)
Issue: Loading screen on root URL (requires authentication routing fix)
```

### Core Requirements - NEW
1. **Program-Based Access Control**: HP, HO, HSS operate independently but share data
2. **Role-Based Views**: Different interfaces for Coordinators, Clinicians, Researchers, M&E, Donors, Management
3. **Cross-Program Coordination**: HP ↔ HO referrals, follow-ups, home visits
4. **Analytics-Only Access**: Non-clinical staff can view statistics without patient management
5. **Data Export**: CSV download for research and reporting
6. **Program-Specific Imports**: Bulk import tagged to specific programs

---

## 🏢 Organizational Structure

### Health Programs (3 Wings)

#### 1. HP (Health Post)
```yaml
Type: Facility-based healthcare
Service Delivery: 
  - Fixed clinic locations
  - Daily outpatient services
  - NCD management
  - Lab services
  - Pharmacy services
  
Staff Roles:
  - HP Coordinator (Program Lead)
  - Doctors
  - Nurses
  - Pharmacists
  - Lab Technicians
  - Registrars

Facilities: Multiple Health Posts (HP-C1E, HP-C2W, etc.)
```

#### 2. HO (Health Outreach)
```yaml
Type: Community-based mobile healthcare
Service Delivery:
  - Home visits
  - Community screening
  - Follow-up visits
  - Health education
  - Referrals to HP
  
Staff Roles:
  - HO Coordinator (Program Lead)
  - Community Health Workers (CHW)
  - Outreach Nurses
  - Health Educators

Facilities: Mobile/temporary sites (HO-CAMP1, HO-CAMP2, etc.)
```

#### 3. HSS (Health Support Services)
```yaml
Type: Support & enabling services
Service Delivery:
  - Training & capacity building
  - Quality assurance
  - Supply chain management
  - Data management
  - Technical support
  
Staff Roles:
  - HSS Coordinator
  - Trainers
  - Quality Officers
  - Supply Chain Managers
  - Data Officers
```

### Cross-Cutting Roles (Not Program-Specific)

#### Management
```yaml
Role: Senior Management / Directors
Access: All programs, all data
Permissions:
  - View all patient data across programs
  - View all program statistics
  - Generate cross-program reports
  - User management
  - System configuration
  - Budget and resource allocation
```

#### Researchers
```yaml
Role: Academic/Clinical Researchers
Access: De-identified data, statistics
Permissions:
  - View aggregated patient statistics
  - Export anonymized data (CSV)
  - View quality indicators
  - View program outcomes
  - NO access to PII (personally identifiable information)
  - NO patient management functions
```

#### M&E (Monitoring & Evaluation)
```yaml
Role: M&E Officers
Access: Statistics, indicators, reports
Permissions:
  - View all program indicators
  - Generate M&E reports
  - Export data for DHIS2
  - View patient demographics (limited)
  - Track program performance
  - Compare HP vs HO outcomes
```

#### Donors
```yaml
Role: Funding Organizations
Access: High-level statistics only
Permissions:
  - View dashboards (read-only)
  - View aggregated outcomes
  - Download summary reports
  - NO access to patient-level data
  - NO system configuration
```

---

## 🔐 Authentication & Authorization System

### Authentication Flow

```
User visits: https://zarish-health-dd05f.web.app
    ↓
Redirect to: /login (if not authenticated)
    ↓
User enters credentials OR Google OAuth2
    ↓
Supabase Auth validates
    ↓
Query auth.user_profiles for:
    - role
    - program (HP, HO, HSS, or NULL for cross-cutting)
    - facility_id
    - permissions
    ↓
Redirect to role-specific dashboard:
    - HP Coordinator → /hp/dashboard
    - HO Coordinator → /ho/dashboard
    - HSS Coordinator → /hss/dashboard
    - Management → /management/dashboard
    - Researcher → /analytics/dashboard
    - M&E → /me/dashboard
    - Donor → /donor/dashboard
```

### Enhanced User Profile Schema

```sql
-- Schema: auth (Supabase Auth extension)

CREATE TABLE auth.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  employee_id VARCHAR(50) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  
  -- Role & Program Assignment
  role VARCHAR(50) NOT NULL CHECK (role IN (
    -- Program-specific roles
    'hp_coordinator', 'hp_doctor', 'hp_nurse', 'hp_pharmacist', 'hp_lab_tech', 'hp_registrar',
    'ho_coordinator', 'ho_chw', 'ho_nurse', 'ho_educator',
    'hss_coordinator', 'hss_trainer', 'hss_quality_officer', 'hss_data_officer',
    
    -- Cross-cutting roles
    'management', 'researcher', 'me_officer', 'donor',
    
    -- System roles
    'admin', 'data_entry'
  )),
  
  -- Program Assignment (NULL for cross-cutting roles)
  program VARCHAR(50) CHECK (program IN ('HP', 'HO', 'HSS') OR program IS NULL),
  
  -- Facility Assignment (NULL for mobile/cross-cutting)
  facility_id UUID REFERENCES facility.facilities(id),
  
  -- Permissions (JSONB for flexibility)
  permissions JSONB NOT NULL DEFAULT '{
    "patient": {"view": false, "create": false, "update": false, "delete": false},
    "encounter": {"view": false, "create": false, "update": false},
    "ncd": {"view": false, "create": false, "update": false},
    "prescription": {"view": false, "create": false},
    "lab": {"view": false, "create": false, "update": false},
    "billing": {"view": false, "create": false},
    "analytics": {"view": false, "export": false},
    "reports": {"view": false, "export": false},
    "import": {"execute": false},
    "users": {"view": false, "create": false, "update": false},
    "settings": {"view": false, "update": false}
  }'::jsonb,
  
  -- Access Scope (defines which programs' data user can see)
  access_scope TEXT[] DEFAULT ARRAY['own_program'],
  -- Possible values: 'own_program', 'all_programs', 'hp', 'ho', 'hss', 'analytics_only'
  
  -- Data Sharing Permissions
  can_view_hp_data BOOLEAN DEFAULT FALSE,
  can_view_ho_data BOOLEAN DEFAULT FALSE,
  can_view_hss_data BOOLEAN DEFAULT FALSE,
  can_share_to_hp BOOLEAN DEFAULT FALSE,
  can_share_to_ho BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  employment_start_date DATE,
  employment_end_date DATE,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  last_login_at TIMESTAMP
);

CREATE INDEX idx_user_profiles_role ON auth.user_profiles(role);
CREATE INDEX idx_user_profiles_program ON auth.user_profiles(program);
CREATE INDEX idx_user_profiles_facility ON auth.user_profiles(facility_id);
CREATE INDEX idx_user_profiles_active ON auth.user_profiles(is_active) WHERE is_active = TRUE;
```

### Role-Permission Matrix

```sql
-- Function to generate default permissions based on role
CREATE OR REPLACE FUNCTION auth.get_default_permissions(user_role VARCHAR)
RETURNS JSONB AS $$
BEGIN
  RETURN CASE user_role
    
    -- HP Coordinator: Full access to HP program
    WHEN 'hp_coordinator' THEN '{
      "patient": {"view": true, "create": true, "update": true, "delete": true},
      "encounter": {"view": true, "create": true, "update": true},
      "ncd": {"view": true, "create": true, "update": true},
      "prescription": {"view": true, "create": true},
      "lab": {"view": true, "create": true, "update": true},
      "billing": {"view": true, "create": true},
      "analytics": {"view": true, "export": true},
      "reports": {"view": true, "export": true},
      "import": {"execute": true},
      "users": {"view": true, "create": true, "update": true},
      "settings": {"view": true, "update": true}
    }'::jsonb
    
    -- HP Doctor: Clinical access only
    WHEN 'hp_doctor' THEN '{
      "patient": {"view": true, "create": false, "update": true, "delete": false},
      "encounter": {"view": true, "create": true, "update": true},
      "ncd": {"view": true, "create": true, "update": true},
      "prescription": {"view": true, "create": true},
      "lab": {"view": true, "create": true, "update": false},
      "billing": {"view": true, "create": false},
      "analytics": {"view": false, "export": false},
      "reports": {"view": false, "export": false},
      "import": {"execute": false},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    -- HO Coordinator: Full access to HO program + view HP referrals
    WHEN 'ho_coordinator' THEN '{
      "patient": {"view": true, "create": true, "update": true, "delete": false},
      "encounter": {"view": true, "create": true, "update": true},
      "ncd": {"view": true, "create": true, "update": true},
      "prescription": {"view": true, "create": false},
      "lab": {"view": true, "create": false, "update": false},
      "billing": {"view": false, "create": false},
      "analytics": {"view": true, "export": true},
      "reports": {"view": true, "export": true},
      "import": {"execute": true},
      "users": {"view": true, "create": true, "update": true},
      "settings": {"view": true, "update": true}
    }'::jsonb
    
    -- HO CHW: Limited field access
    WHEN 'ho_chw' THEN '{
      "patient": {"view": true, "create": true, "update": true, "delete": false},
      "encounter": {"view": true, "create": true, "update": true},
      "ncd": {"view": true, "create": false, "update": true},
      "prescription": {"view": true, "create": false},
      "lab": {"view": false, "create": false, "update": false},
      "billing": {"view": false, "create": false},
      "analytics": {"view": false, "export": false},
      "reports": {"view": false, "export": false},
      "import": {"execute": false},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    -- Management: View-all, no clinical operations
    WHEN 'management' THEN '{
      "patient": {"view": true, "create": false, "update": false, "delete": false},
      "encounter": {"view": true, "create": false, "update": false},
      "ncd": {"view": true, "create": false, "update": false},
      "prescription": {"view": true, "create": false},
      "lab": {"view": true, "create": false, "update": false},
      "billing": {"view": true, "create": false},
      "analytics": {"view": true, "export": true},
      "reports": {"view": true, "export": true},
      "import": {"execute": false},
      "users": {"view": true, "create": true, "update": true},
      "settings": {"view": true, "update": true}
    }'::jsonb
    
    -- Researcher: Analytics only, de-identified data
    WHEN 'researcher' THEN '{
      "patient": {"view": false, "create": false, "update": false, "delete": false},
      "encounter": {"view": false, "create": false, "update": false},
      "ncd": {"view": false, "create": false, "update": false},
      "prescription": {"view": false, "create": false},
      "lab": {"view": false, "create": false, "update": false},
      "billing": {"view": false, "create": false},
      "analytics": {"view": true, "export": true},
      "reports": {"view": true, "export": true},
      "import": {"execute": false},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    -- M&E Officer: Statistics + limited patient demographics
    WHEN 'me_officer' THEN '{
      "patient": {"view": true, "create": false, "update": false, "delete": false},
      "encounter": {"view": true, "create": false, "update": false},
      "ncd": {"view": true, "create": false, "update": false},
      "prescription": {"view": false, "create": false},
      "lab": {"view": true, "create": false, "update": false},
      "billing": {"view": false, "create": false},
      "analytics": {"view": true, "export": true},
      "reports": {"view": true, "export": true},
      "import": {"execute": false},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    -- Donor: Dashboard only
    WHEN 'donor' THEN '{
      "patient": {"view": false, "create": false, "update": false, "delete": false},
      "encounter": {"view": false, "create": false, "update": false},
      "ncd": {"view": false, "create": false, "update": false},
      "prescription": {"view": false, "create": false},
      "lab": {"view": false, "create": false, "update": false},
      "billing": {"view": false, "create": false},
      "analytics": {"view": true, "export": false},
      "reports": {"view": true, "export": false},
      "import": {"execute": false},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    ELSE '{}'::jsonb
  END;
END;
$$ LANGUAGE plpgsql;
```

---

## 🗄️ Enhanced Database Schema for Multi-Program

### Program-Tagged Patient Records

```sql
-- Extend patient.patients table
ALTER TABLE patient.patients ADD COLUMN IF NOT EXISTS
  registered_program VARCHAR(50) CHECK (registered_program IN ('HP', 'HO', 'HSS')),
  registered_by_user_id UUID REFERENCES auth.user_profiles(id),
  primary_program VARCHAR(50) DEFAULT 'HP' CHECK (primary_program IN ('HP', 'HO', 'HSS')),
  shared_with_programs TEXT[] DEFAULT ARRAY[]::TEXT[];  -- Programs with shared access

CREATE INDEX idx_patients_program ON patient.patients(registered_program);
CREATE INDEX idx_patients_primary_program ON patient.patients(primary_program);
CREATE INDEX idx_patients_shared ON patient.patients USING gin(shared_with_programs);
```

### Cross-Program Referrals & Coordination

```sql
-- Schema: coordination (NEW)

CREATE TABLE coordination.cross_program_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referral Information
  patient_id UUID NOT NULL REFERENCES patient.patients(id),
  source_encounter_id UUID REFERENCES clinical.encounters(id),
  
  -- Programs
  from_program VARCHAR(50) NOT NULL CHECK (from_program IN ('HP', 'HO', 'HSS')),
  to_program VARCHAR(50) NOT NULL CHECK (to_program IN ('HP', 'HO', 'HSS')),
  
  from_facility_id UUID REFERENCES facility.facilities(id),
  to_facility_id UUID REFERENCES facility.facilities(id),
  
  -- Referral Details
  referral_date DATE NOT NULL DEFAULT CURRENT_DATE,
  referral_reason TEXT NOT NULL,
  referral_type VARCHAR(50) CHECK (referral_type IN (
    'Follow-up Required',
    'Home Visit Needed',
    'Clinic Consultation',
    'Lab Investigation',
    'Medication Refill',
    'Missed Appointment',
    'Step-down Care',
    'Step-up Care'
  )),
  
  urgency VARCHAR(50) DEFAULT 'routine' CHECK (urgency IN (
    'routine', 'urgent', 'emergency'
  )),
  
  -- Clinical Context
  current_diagnosis TEXT,
  current_medications JSONB,
  special_instructions TEXT,
  
  -- Referral Status
  referral_status VARCHAR(50) DEFAULT 'pending' CHECK (referral_status IN (
    'pending', 'acknowledged', 'scheduled', 'completed', 'cancelled', 'declined'
  )),
  
  -- Response
  acknowledged_by UUID REFERENCES auth.user_profiles(id),
  acknowledged_at TIMESTAMP,
  scheduled_date DATE,
  completed_date DATE,
  completion_notes TEXT,
  
  -- Outcome
  outcome_encounter_id UUID REFERENCES clinical.encounters(id),
  outcome_summary TEXT,
  
  -- Created By
  referred_by UUID NOT NULL REFERENCES auth.user_profiles(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referrals_patient ON coordination.cross_program_referrals(patient_id);
CREATE INDEX idx_referrals_from_program ON coordination.cross_program_referrals(from_program);
CREATE INDEX idx_referrals_to_program ON coordination.cross_program_referrals(to_program);
CREATE INDEX idx_referrals_status ON coordination.cross_program_referrals(referral_status);
CREATE INDEX idx_referrals_date ON coordination.cross_program_referrals(referral_date DESC);
```

### Shared Follow-up Tracking

```sql
CREATE TABLE coordination.shared_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  patient_id UUID NOT NULL REFERENCES patient.patients(id),
  ncd_enrollment_id UUID REFERENCES ncd.enrollments(id),
  
  -- Originating Program
  scheduled_by_program VARCHAR(50) NOT NULL CHECK (scheduled_by_program IN ('HP', 'HO', 'HSS')),
  scheduled_by_user_id UUID REFERENCES auth.user_profiles(id),
  scheduled_by_facility_id UUID REFERENCES facility.facilities(id),
  
  -- Follow-up Details
  follow_up_date DATE NOT NULL,
  follow_up_type VARCHAR(50) CHECK (follow_up_type IN (
    'NCD Review',
    'Medication Check',
    'Home Visit',
    'Clinic Visit',
    'Lab Review',
    'Complication Assessment'
  )),
  
  -- Can be completed by any program
  completed_by_program VARCHAR(50) CHECK (completed_by_program IN ('HP', 'HO', 'HSS')),
  completed_by_user_id UUID REFERENCES auth.user_profiles(id),
  completed_at TIMESTAMP,
  completion_notes TEXT,
  
  -- Status
  follow_up_status VARCHAR(50) DEFAULT 'scheduled' CHECK (follow_up_status IN (
    'scheduled', 'reminded', 'completed', 'missed', 'cancelled', 'rescheduled'
  )),
  
  -- Visibility (which programs can see this follow-up)
  visible_to_programs TEXT[] DEFAULT ARRAY['HP', 'HO'],
  
  -- Next Follow-up
  next_follow_up_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_follow_ups_patient ON coordination.shared_follow_ups(patient_id);
CREATE INDEX idx_follow_ups_scheduled_program ON coordination.shared_follow_ups(scheduled_by_program);
CREATE INDEX idx_follow_ups_completed_program ON coordination.shared_follow_ups(completed_by_program);
CREATE INDEX idx_follow_ups_date ON coordination.shared_follow_ups(follow_up_date);
CREATE INDEX idx_follow_ups_status ON coordination.shared_follow_ups(follow_up_status);
CREATE INDEX idx_follow_ups_visible ON coordination.shared_follow_ups USING gin(visible_to_programs);
```

### Home Visit Tracking (HO-specific, visible to HP)

```sql
CREATE TABLE coordination.home_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  patient_id UUID NOT NULL REFERENCES patient.patients(id),
  
  -- Visit Information
  visit_date DATE NOT NULL,
  visit_time TIME,
  visit_duration_minutes INT,
  
  -- HO Team
  chw_user_id UUID NOT NULL REFERENCES auth.user_profiles(id),
  ho_facility_id UUID REFERENCES facility.facilities(id),
  
  -- Location
  home_address TEXT,
  gps_latitude DECIMAL(9, 6),
  gps_longitude DECIMAL(9, 6),
  
  -- Visit Purpose
  visit_purpose TEXT[] DEFAULT ARRAY['Follow-up'],
  -- Possible: 'Follow-up', 'Medication Delivery', 'Vital Signs Check', 
  --          'Education', 'Referral Follow-up', 'Missed Appointment'
  
  -- Clinical Observations
  vitals_taken BOOLEAN DEFAULT FALSE,
  vital_signs_id UUID REFERENCES clinical.vital_signs(id),
  
  medication_adherence VARCHAR(50) CHECK (medication_adherence IN (
    'Excellent', 'Good', 'Fair', 'Poor', 'Not Assessed'
  )),
  
  complications_noted BOOLEAN DEFAULT FALSE,
  complications_description TEXT,
  
  -- Patient Status
  patient_found BOOLEAN DEFAULT TRUE,
  patient_condition VARCHAR(50),  -- 'Stable', 'Improved', 'Worsened', 'Emergency'
  
  -- Actions Taken
  medications_delivered JSONB,
  health_education_provided TEXT,
  referral_made BOOLEAN DEFAULT FALSE,
  referral_id UUID REFERENCES coordination.cross_program_referrals(id),
  
  -- Next Steps
  requires_hp_visit BOOLEAN DEFAULT FALSE,
  requires_urgent_attention BOOLEAN DEFAULT FALSE,
  next_home_visit_date DATE,
  
  -- Visibility
  shared_with_hp BOOLEAN DEFAULT TRUE,  -- Always shared with HP
  hp_acknowledged_by UUID REFERENCES auth.user_profiles(id),
  hp_acknowledged_at TIMESTAMP,
  
  -- Visit Notes
  visit_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_home_visits_patient ON coordination.home_visits(patient_id);
CREATE INDEX idx_home_visits_chw ON coordination.home_visits(chw_user_id);
CREATE INDEX idx_home_visits_date ON coordination.home_visits(visit_date DESC);
CREATE INDEX idx_home_visits_shared ON coordination.home_visits(shared_with_hp) WHERE shared_with_hp = TRUE;
CREATE INDEX idx_home_visits_urgent ON coordination.home_visits(requires_urgent_attention) WHERE requires_urgent_attention = TRUE;
```

### Missed Appointments Sharing

```sql
CREATE TABLE coordination.missed_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  patient_id UUID NOT NULL REFERENCES patient.patients(id),
  appointment_id UUID,  -- Reference to appointments table (if exists)
  
  -- Appointment Details
  scheduled_date DATE NOT NULL,
  scheduled_facility_id UUID REFERENCES facility.facilities(id),
  scheduled_program VARCHAR(50) CHECK (scheduled_program IN ('HP', 'HO', 'HSS')),
  appointment_type VARCHAR(100),
  
  -- Missed Status
  marked_missed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  marked_missed_by UUID REFERENCES auth.user_profiles(id),
  
  -- Follow-up Actions
  follow_up_attempts INT DEFAULT 0,
  last_follow_up_date DATE,
  follow_up_method VARCHAR(50),  -- 'Phone', 'SMS', 'Home Visit', 'Community Contact'
  
  -- Outcome
  patient_contacted BOOLEAN DEFAULT FALSE,
  patient_response TEXT,
  rescheduled_date DATE,
  
  -- Sharing for Home Follow-up
  shared_with_ho BOOLEAN DEFAULT TRUE,
  ho_follow_up_assigned BOOLEAN DEFAULT FALSE,
  ho_follow_up_user_id UUID REFERENCES auth.user_profiles(id),
  ho_follow_up_completed BOOLEAN DEFAULT FALSE,
  ho_follow_up_notes TEXT,
  
  -- Status
  resolution_status VARCHAR(50) DEFAULT 'open' CHECK (resolution_status IN (
    'open', 'contacted', 'rescheduled', 'patient_relocated', 'patient_deceased', 'closed'
  )),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_missed_appointments_patient ON coordination.missed_appointments(patient_id);
CREATE INDEX idx_missed_appointments_program ON coordination.missed_appointments(scheduled_program);
CREATE INDEX idx_missed_appointments_shared ON coordination.missed_appointments(shared_with_ho) WHERE shared_with_ho = TRUE;
CREATE INDEX idx_missed_appointments_status ON coordination.missed_appointments(resolution_status);
```

---

## 📊 Row-Level Security (RLS) Policies for Multi-Program Access

### Patient Data Access

```sql
-- Enable RLS
ALTER TABLE patient.patients ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view patients from their own program
CREATE POLICY patient_view_own_program ON patient.patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          -- Admin can see all
          user_profiles.role = 'admin'
          
          -- Management can see all
          OR user_profiles.role = 'management'
          
          -- M&E can see all
          OR user_profiles.role = 'me_officer'
          
          -- Researcher can see all (but PII will be masked in view)
          OR user_profiles.role = 'researcher'
          
          -- Program-specific: can see own program
          OR (
            user_profiles.program = patients.registered_program
            AND user_profiles.permissions->'patient'->>'view' = 'true'
          )
          
          -- Can see if patient is shared with their program
          OR user_profiles.program = ANY(patients.shared_with_programs)
        )
    )
  );

-- Policy 2: Users can only create patients in their own program
CREATE POLICY patient_insert_own_program ON patient.patients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          user_profiles.role = 'admin'
          OR (
            user_profiles.program = registered_program
            AND user_profiles.permissions->'patient'->>'create' = 'true'
          )
        )
    )
  );

-- Policy 3: Users can update patients from their own program
CREATE POLICY patient_update_own_program ON patient.patients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          user_profiles.role = 'admin'
          OR (
            user_profiles.program = registered_program
            AND user_profiles.permissions->'patient'->>'update' = 'true'
          )
          OR (
            -- HO can update if shared
            user_profiles.program = ANY(shared_with_programs)
            AND user_profiles.permissions->'patient'->>'update' = 'true'
          )
        )
    )
  );
```

### Encounter Access (Program-specific)

```sql
ALTER TABLE clinical.encounters ENABLE ROW LEVEL SECURITY;

-- Users can view encounters from facilities in their program
CREATE POLICY encounter_view_program ON clinical.encounters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.user_profiles up
      JOIN facility.facilities f ON f.id = encounters.facility_id
      WHERE up.id = auth.uid()
        AND (
          up.role IN ('admin', 'management', 'me_officer')
          OR up.program = ANY(f.programs)
          OR up.permissions->'encounter'->>'view' = 'true'
        )
    )
  );
```

### Cross-Program Referrals Access

```sql
ALTER TABLE coordination.cross_program_referrals ENABLE ROW LEVEL SECURITY;

-- View referrals FROM your program OR TO your program
CREATE POLICY referrals_view_program ON coordination.cross_program_referrals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          user_profiles.role IN ('admin', 'management')
          OR user_profiles.program = from_program
          OR user_profiles.program = to_program
        )
    )
  );
```

---

## 🎨 Frontend Application Architecture

### Route Structure by Role

```typescript
// src/routes/index.tsx

import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />; // FIX for root URL issue
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Route based on user role
  switch (user.role) {
    case 'hp_coordinator':
    case 'hp_doctor':
    case 'hp_nurse':
    case 'hp_pharmacist':
    case 'hp_lab_tech':
    case 'hp_registrar':
      return <HPRoutes />;
      
    case 'ho_coordinator':
    case 'ho_chw':
    case 'ho_nurse':
    case 'ho_educator':
      return <HORoutes />;
      
    case 'hss_coordinator':
    case 'hss_trainer':
    case 'hss_quality_officer':
    case 'hss_data_officer':
      return <HSSRoutes />;
      
    case 'management':
      return <ManagementRoutes />;
      
    case 'researcher':
      return <ResearcherRoutes />;
      
    case 'me_officer':
      return <MERoutes />;
      
    case 'donor':
      return <DonorRoutes />;
      
    case 'admin':
      return <AdminRoutes />;
      
    default:
      return <Navigate to="/unauthorized" />;
  }
}
```

### HP (Health Post) Routes

```typescript
// src/routes/HPRoutes.tsx

import { Routes, Route } from 'react-router-dom';
import HPLayout from '@/layouts/HPLayout';

export function HPRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HPLayout />}>
        {/* Dashboard */}
        <Route index element={<HPDashboard />} />
        
        {/* Patient Management */}
        <Route path="patients">
          <Route index element={<PatientList program="HP" />} />
          <Route path="register" element={<PatientRegistration program="HP" />} />
          <Route path=":id" element={<PatientDetail />} />
          <Route path=":id/encounter" element={<CreateEncounter />} />
        </Route>
        
        {/* NCD Management */}
        <Route path="ncd">
          <Route index element={<NCDDashboard program="HP" />} />
          <Route path="enroll/:patientId" element={<NCDEnrollment />} />
          <Route path="follow-up/:enrollmentId" element={<NCDFollowUp />} />
          <Route path="protocols/:enrollmentId" element={<TreatmentProtocols />} />
        </Route>
        
        {/* Shared Follow-ups (from HO) */}
        <Route path="shared-follow-ups">
          <Route index element={<SharedFollowUpList viewProgram="HP" />} />
          <Route path=":id" element={<SharedFollowUpDetail />} />
        </Route>
        
        {/* Referrals */}
        <Route path="referrals">
          <Route path="outgoing" element={<OutgoingReferrals fromProgram="HP" />} />
          <Route path="incoming" element={<IncomingReferrals toProgram="HP" />} />
          <Route path="create/:patientId" element={<CreateReferral fromProgram="HP" />} />
        </Route>
        
        {/* Home Visits (shared from HO) */}
        <Route path="home-visits">
          <Route index element={<HomeVisitList viewerProgram="HP" />} />
          <Route path=":id" element={<HomeVisitDetail />} />
        </Route>
        
        {/* Missed Appointments */}
        <Route path="missed-appointments">
          <Route index element={<MissedAppointmentsList program="HP" />} />
          <Route path=":id/assign-ho" element={<AssignHOFollowUp />} />
        </Route>
        
        {/* Pharmacy */}
        <Route path="pharmacy">
          <Route index element={<PharmacyDashboard />} />
          <Route path="dispense" element={<MedicationDispensing />} />
          <Route path="inventory" element={<InventoryManagement />} />
        </Route>
        
        {/* Lab */}
        <Route path="lab">
          <Route index element={<LabDashboard />} />
          <Route path="orders" element={<LabOrders />} />
          <Route path="results" element={<LabResults />} />
        </Route>
        
        {/* Reports */}
        <Route path="reports">
          <Route index element={<HPReports />} />
          <Route path="export" element={<DataExport program="HP" />} />
        </Route>
        
        {/* Data Import */}
        <Route path="import">
          <Route index element={<DataImport program="HP" />} />
          <Route path="history" element={<ImportHistory program="HP" />} />
        </Route>
        
        {/* Settings */}
        <Route path="settings" element={<HPSettings />} />
      </Route>
    </Routes>
  );
}
```

### HO (Health Outreach) Routes

```typescript
// src/routes/HORoutes.tsx

export function HORoutes() {
  return (
    <Routes>
      <Route path="/" element={<HOLayout />}>
        {/* Dashboard */}
        <Route index element={<HODashboard />} />
        
        {/* Patient Management */}
        <Route path="patients">
          <Route index element={<PatientList program="HO" />} />
          <Route path="register" element={<PatientRegistration program="HO" />} />
          <Route path=":id" element={<PatientDetail />} />
        </Route>
        
        {/* Community Screening */}
        <Route path="screening">
          <Route index element={<ScreeningDashboard />} />
          <Route path="session" element={<ScreeningSession />} />
          <Route path="results" element={<ScreeningResults />} />
        </Route>
        
        {/* Home Visits */}
        <Route path="home-visits">
          <Route index element={<HomeVisitList viewerProgram="HO" />} />
          <Route path="schedule" element={<ScheduleHomeVisit />} />
          <Route path="conduct/:patientId" element={<ConductHomeVisit />} />
          <Route path=":id" element={<HomeVisitDetail />} />
        </Route>
        
        {/* Referrals to HP */}
        <Route path="referrals">
          <Route path="to-hp" element={<ReferralsToHP />} />
          <Route path="create/:patientId" element={<CreateReferral fromProgram="HO" />} />
          <Route path="track/:id" element={<TrackReferral />} />
        </Route>
        
        {/* Shared Follow-ups (from HP) */}
        <Route path="follow-ups">
          <Route index element={<SharedFollowUpList viewProgram="HO" />} />
          <Route path="complete/:id" element={<CompleteFollowUp program="HO" />} />
        </Route>
        
        {/* HP Missed Appointments (assigned to HO) */}
        <Route path="missed-appointments">
          <Route index element={<AssignedMissedAppointments program="HO" />} />
          <Route path=":id/follow-up" element={<FollowUpMissedAppointment />} />
        </Route>
        
        {/* NCD Management (Limited) */}
        <Route path="ncd">
          <Route index element={<NCDDashboard program="HO" />} />
          <Route path="screening" element={<NCDScreening />} />
          <Route path="follow-up/:enrollmentId" element={<NCDFollowUp />} />
        </Route>
        
        {/* Health Education */}
        <Route path="education">
          <Route index element={<EducationSessions />} />
          <Route path="conduct" element={<ConductSession />} />
        </Route>
        
        {/* Reports */}
        <Route path="reports">
          <Route index element={<HOReports />} />
          <Route path="export" element={<DataExport program="HO" />} />
        </Route>
        
        {/* Data Import */}
        <Route path="import">
          <Route index element={<DataImport program="HO" />} />
          <Route path="history" element={<ImportHistory program="HO" />} />
        </Route>
        
        {/* Settings */}
        <Route path="settings" element={<HOSettings />} />
      </Route>
    </Routes>
  );
}
```

### Management Routes

```typescript
// src/routes/ManagementRoutes.tsx

export function ManagementRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ManagementLayout />}>
        {/* Cross-Program Dashboard */}
        <Route index element={<ManagementDashboard />} />
        
        {/* Program Comparison */}
        <Route path="comparison">
          <Route index element={<ProgramComparison />} />
          <Route path="hp-vs-ho" element={<HPvsHOAnalysis />} />
          <Route path="ncd-outcomes" element={<NCDOutcomesComparison />} />
        </Route>
        
        {/* All Patients (Cross-Program View) */}
        <Route path="patients">
          <Route index element={<AllPatientsView />} />
          <Route path=":id" element={<PatientDetailCrossProgram />} />
        </Route>
        
        {/* Coordination Monitoring */}
        <Route path="coordination">
          <Route path="referrals" element={<AllReferralsMonitor />} />
          <Route path="follow-ups" element={<AllFollowUpsMonitor />} />
          <Route path="home-visits" element={<AllHomeVisitsMonitor />} />
          <Route path="missed-appointments" element={<AllMissedAppointments />} />
        </Route>
        
        {/* User Management */}
        <Route path="users">
          <Route index element={<UserManagement />} />
          <Route path="create" element={<CreateUser />} />
          <Route path=":id" element={<EditUser />} />
          <Route path="roles" element={<RoleManagement />} />
        </Route>
        
        {/* Facility Management */}
        <Route path="facilities">
          <Route index element={<FacilityManagement />} />
          <Route path="create" element={<CreateFacility />} />
          <Route path=":id" element={<EditFacility />} />
        </Route>
        
        {/* Analytics */}
        <Route path="analytics">
          <Route index element={<AnalyticsDashboard scope="all" />} />
          <Route path="hp" element={<AnalyticsDashboard scope="HP" />} />
          <Route path="ho" element={<AnalyticsDashboard scope="HO" />} />
          <Route path="hss" element={<AnalyticsDashboard scope="HSS" />} />
        </Route>
        
        {/* Reports */}
        <Route path="reports">
          <Route index element={<AllReports />} />
          <Route path="generate" element={<ReportGenerator />} />
          <Route path="scheduled" element={<ScheduledReports />} />
          <Route path="export" element={<DataExport scope="all" />} />
        </Route>
        
        {/* Settings */}
        <Route path="settings">
          <Route index element={<SystemSettings />} />
          <Route path="permissions" element={<PermissionManagement />} />
          <Route path="data-sharing" element={<DataSharingRules />} />
        </Route>
      </Route>
    </Routes>
  );
}
```

### Researcher Routes

```typescript
// src/routes/ResearcherRoutes.tsx

export function ResearcherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ResearcherLayout />}>
        {/* Analytics Dashboard (De-identified) */}
        <Route index element={<ResearchAnalyticsDashboard />} />
        
        {/* Patient Statistics (No PII) */}
        <Route path="statistics">
          <Route path="demographics" element={<DemographicsStats />} />
          <Route path="ncd" element={<NCDStats />} />
          <Route path="outcomes" element={<OutcomesStats />} />
          <Route path="quality" element={<QualityMetrics />} />
        </Route>
        
        {/* Program Comparison */}
        <Route path="comparison">
          <Route path="hp-ho" element={<HPvsHOResearch />} />
          <Route path="effectiveness" element={<ProgramEffectiveness />} />
        </Route>
        
        {/* Data Export (De-identified) */}
        <Route path="export">
          <Route index element={<ResearchDataExport />} />
          <Route path="custom" element={<CustomDatasetBuilder />} />
        </Route>
        
        {/* Visualizations */}
        <Route path="visualizations">
          <Route index element={<DataVisualizationHub />} />
          <Route path="trends" element={<TrendsAnalysis />} />
        </Route>
      </Route>
    </Routes>
  );
}
```

---

## 🔄 Cross-Program Workflows

### Workflow 1: HP → HO Referral for Home Follow-up

```typescript
// Use Case: HP doctor identifies patient needs home follow-up

// Step 1: HP Doctor creates referral
const createHomeFollowUpReferral = async (patientId: string) => {
  const { data, error } = await supabase
    .from('coordination.cross_program_referrals')
    .insert({
      patient_id: patientId,
      from_program: 'HP',
      to_program: 'HO',
      from_facility_id: currentUser.facility_id,
      referral_reason: 'Patient unable to travel to clinic, requires home monitoring',
      referral_type: 'Home Visit Needed',
      urgency: 'routine',
      current_diagnosis: 'Hypertension Stage 2',
      current_medications: [
        { drug: 'Amlodipine', dose: '10mg', frequency: 'Once daily' }
      ],
      special_instructions: 'Monitor BP, check medication adherence',
      referred_by: currentUser.id,
    })
    .select()
    .single();
  
  // Notify HO coordinator
  await sendNotification({
    to_user_role: 'ho_coordinator',
    subject: 'New Home Visit Referral',
    message: `Patient ${patientId} referred for home follow-up`,
  });
  
  return data;
};

// Step 2: HO Coordinator acknowledges and assigns CHW
const acknowledgeReferral = async (referralId: string, assignedCHW: string) => {
  await supabase
    .from('coordination.cross_program_referrals')
    .update({
      referral_status: 'acknowledged',
      acknowledged_by: currentUser.id,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', referralId);
  
  // Create home visit schedule
  await supabase
    .from('coordination.home_visits')
    .insert({
      patient_id: patientId,
      chw_user_id: assignedCHW,
      visit_date: addDays(new Date(), 3), // Schedule 3 days out
      visit_purpose: ['Follow-up', 'Medication Check'],
      shared_with_hp: true,
    });
};

// Step 3: CHW conducts home visit
const conductHomeVisit = async (homeVisitId: string, visitData: any) => {
  // Record vital signs
  const vitals = await supabase
    .from('clinical.vital_signs')
    .insert({
      patient_id: visitData.patient_id,
      measurement_date: new Date(),
      systolic_bp: visitData.systolic_bp,
      diastolic_bp: visitData.diastolic_bp,
      measured_by: currentUser.full_name,
    })
    .select()
    .single();
  
  // Update home visit record
  await supabase
    .from('coordination.home_visits')
    .update({
      patient_found: true,
      patient_condition: visitData.condition,
      vitals_taken: true,
      vital_signs_id: vitals.data.id,
      medication_adherence: visitData.adherence,
      visit_notes: visitData.notes,
      requires_hp_visit: visitData.needsClinicVisit,
    })
    .eq('id', homeVisitId);
  
  // If urgent, create referral back to HP
  if (visitData.requiresUrgentAttention) {
    await createHomeFollowUpReferral(visitData.patient_id, 'HO', 'HP', 'urgent');
  }
  
  // Update original referral as completed
  await supabase
    .from('coordination.cross_program_referrals')
    .update({
      referral_status: 'completed',
      completed_date: new Date(),
      completion_notes: `Home visit completed by ${currentUser.full_name}`,
    })
    .eq('id', originalReferralId);
};

// Step 4: HP team views home visit update
// Automatic - visible in HP dashboard via RLS policy
```

### Workflow 2: HO Community Screening → HP Enrollment

```typescript
// Step 1: HO CHW conducts community screening
const conductNCDScreening = async (screeningData: any) => {
  // Create patient record (if new)
  const patient = await supabase
    .from('patient.patients')
    .insert({
      given_name: screeningData.given_name,
      family_name: screeningData.family_name,
      date_of_birth: screeningData.dob,
      sex: screeningData.sex,
      registered_program: 'HO',
      registered_by_user_id: currentUser.id,
      shared_with_programs: ['HP'], // Immediately share with HP
    })
    .select()
    .single();
  
  // Create screening encounter
  const encounter = await supabase
    .from('clinical.encounters')
    .insert({
      patient_id: patient.data.id,
      facility_id: currentUser.facility_id,
      encounter_type: 'NCD Screening',
      visit_date: new Date(),
      chief_complaint: 'Community NCD screening',
    })
    .select()
    .single();
  
  // Record vital signs
  await supabase
    .from('clinical.vital_signs')
    .insert({
      encounter_id: encounter.data.id,
      patient_id: patient.data.id,
      systolic_bp: screeningData.systolic_bp,
      diastolic_bp: screeningData.diastolic_bp,
      blood_glucose_mmol_l: screeningData.blood_glucose,
      glucose_test_type: 'RBS',
      // Auto-calculated fields will trigger
    })
    .select()
    .single();
  
  // If high risk, create referral to HP
  if (screeningData.systolic_bp >= 140 || screeningData.blood_glucose >= 7.8) {
    await supabase
      .from('coordination.cross_program_referrals')
      .insert({
        patient_id: patient.data.id,
        source_encounter_id: encounter.data.id,
        from_program: 'HO',
        to_program: 'HP',
        referral_reason: 'High-risk NCD screening result',
        referral_type: 'Clinic Consultation',
        urgency: screeningData.systolic_bp >= 160 ? 'urgent' : 'routine',
        current_diagnosis: 'Suspected HTN/DM',
        referred_by: currentUser.id,
      });
  }
};

// Step 2: HP team sees referral and enrolls in NCD program
// (Standard NCD enrollment workflow from previous PRD)
```

### Workflow 3: Missed Appointment → HO Follow-up

```typescript
// Step 1: HP system marks appointment as missed (automated)
const markAppointmentMissed = async (appointmentId: string) => {
  const appointment = await getAppointment(appointmentId);
  
  const missedRecord = await supabase
    .from('coordination.missed_appointments')
    .insert({
      patient_id: appointment.patient_id,
      appointment_id: appointmentId,
      scheduled_date: appointment.scheduled_date,
      scheduled_facility_id: appointment.facility_id,
      scheduled_program: 'HP',
      appointment_type: appointment.type,
      marked_missed_by: 'system',
      shared_with_ho: true, // Automatically share with HO
    })
    .select()
    .single();
  
  return missedRecord.data;
};

// Step 2: HO coordinator assigns CHW for follow-up
const assignMissedAppointmentFollowUp = async (
  missedAppointmentId: string,
  chw_id: string
) => {
  await supabase
    .from('coordination.missed_appointments')
    .update({
      ho_follow_up_assigned: true,
      ho_follow_up_user_id: chw_id,
    })
    .eq('id', missedAppointmentId);
  
  // Notify CHW
  await sendNotification({
    to_user_id: chw_id,
    subject: 'Missed Appointment Follow-up Assigned',
    message: `Please follow up with patient for missed HP appointment`,
  });
};

// Step 3: CHW conducts follow-up (phone or home visit)
const completeM issedAppointmentFollowUp = async (
  missedAppointmentId: string,
  followUpData: any
) => {
  await supabase
    .from('coordination.missed_appointments')
    .update({
      patient_contacted: followUpData.contacted,
      patient_response: followUpData.response,
      follow_up_method: followUpData.method,
      follow_up_attempts: followUpData.attempts,
      last_follow_up_date: new Date(),
      ho_follow_up_completed: true,
      ho_follow_up_notes: followUpData.notes,
      resolution_status: followUpData.rescheduled ? 'rescheduled' : 'contacted',
      rescheduled_date: followUpData.rescheduled_date,
    })
    .eq('id', missedAppointmentId);
};
```

---

## 📊 Analytics & Reporting System

### De-identified Data Views for Researchers

```sql
-- Create view with de-identified patient data
CREATE VIEW analytics.patients_deidentified AS
SELECT 
  p.id,
  p.age_years,
  p.sex,
  p.origin,
  p.nationality,
  p.marital_status,
  p.registered_program,
  p.primary_program,
  p.registration_date,
  p.patient_status,
  p.is_vulnerable,
  -- NO PII FIELDS
  NULL as given_name,
  NULL as family_name,
  NULL as phone_primary,
  NULL as email,
  NULL as national_id,
  NULL as fcn,
  NULL as progress_id
FROM patient.patients p
WHERE p.deleted_at IS NULL;

-- Grant access to researchers
GRANT SELECT ON analytics.patients_deidentified TO researcher;

-- Similar views for encounters, diagnoses, etc.
CREATE VIEW analytics.encounters_summary AS
SELECT 
  e.id,
  e.patient_id,  -- UUID only, no way to link to PII
  e.facility_id,
  f.facility_type,
  ARRAY_AGG(DISTINCT f.programs) as programs,
  e.encounter_type,
  e.visit_date,
  e.encounter_status,
  -- Aggregated clinical data
  (SELECT COUNT(*) FROM clinical.diagnoses d WHERE d.encounter_id = e.id) as diagnosis_count,
  (SELECT COUNT(*) FROM clinical.vital_signs v WHERE v.encounter_id = e.id) as vitals_count
FROM clinical.encounters e
JOIN facility.facilities f ON f.id = e.facility_id
GROUP BY e.id, f.facility_type;
```

### Program Comparison Queries

```sql
-- Compare HP vs HO NCD outcomes
CREATE VIEW analytics.ncd_outcomes_by_program AS
SELECT 
  ne.primary_ncd,
  p.registered_program,
  COUNT(DISTINCT ne.patient_id) as total_patients,
  COUNT(DISTINCT CASE WHEN ne.program_status = 'active' THEN ne.patient_id END) as active_patients,
  AVG(fv.current_bp_systolic) as avg_systolic_bp,
  AVG(fv.current_bp_diastolic) as avg_diastolic_bp,
  AVG(fv.current_blood_glucose) as avg_blood_glucose,
  COUNT(CASE WHEN fv.bp_target_met = TRUE THEN 1 END)::FLOAT / NULLIF(COUNT(fv.id), 0) as bp_control_rate,
  COUNT(CASE WHEN fv.glucose_target_met = TRUE THEN 1 END)::FLOAT / NULLIF(COUNT(fv.id), 0) as glucose_control_rate
FROM ncd.enrollments ne
JOIN patient.patients p ON p.id = ne.patient_id
LEFT JOIN ncd.follow_up_visits fv ON fv.enrollment_id = ne.id
GROUP BY ne.primary_ncd, p.registered_program;
```

### Data Export Function

```typescript
// Edge Function: /functions/export-data

export async function POST(req: Request) {
  const { user, filters, format } = await req.json();
  
  // Check permissions
  const { data: userProfile } = await supabase
    .from('auth.user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (!userProfile.permissions.analytics.export) {
    return new Response('Unauthorized', { status: 403 });
  }
  
  // Build query based on user role
  let query = supabase.from('analytics.patients_deidentified');
  
  if (userProfile.role === 'researcher') {
    // Researchers get de-identified data only
    query = query.select('*');
  } else if (userProfile.role === 'me_officer') {
    // M&E gets demographics + program data
    query = supabase
      .from('patient.patients')
      .select(`
        id, age_years, sex, origin, nationality,
        registered_program, registration_date, patient_status
      `);
  } else if (userProfile.role === 'management') {
    // Management gets full access
    query = supabase.from('patient.patients').select('*');
  }
  
  // Apply program filter if user is program-specific
  if (userProfile.program && userProfile.access_scope.includes('own_program')) {
    query = query.eq('registered_program', userProfile.program);
  }
  
  // Apply user filters
  if (filters.date_range) {
    query = query
      .gte('registration_date', filters.date_range.start)
      .lte('registration_date', filters.date_range.end);
  }
  
  // Execute query
  const { data, error } = await query;
  
  // Convert to CSV
  if (format === 'csv') {
    const csv = convertToCSV(data);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="zarish-export-${Date.now()}.csv"`,
      },
    });
  }
  
  // Return JSON
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 🎨 Dashboard Components by Role

### HP Coordinator Dashboard

```typescript
// src/pages/hp/Dashboard.tsx

export function HPDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    loadDashboardStats();
  }, []);
  
  const loadDashboardStats = async () => {
    // HP-specific statistics
    const { data } = await supabase.rpc('get_hp_dashboard_stats', {
      facility_id: user.facility_id,
    });
    setStats(data);
  };
  
  return (
    <div className="space-y-6">
      <h1>HP Dashboard - {user.facility_name}</h1>
      
      {/* Today's Overview */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Today's Encounters" value={stats?.today_encounters} />
        <StatCard title="Pending Lab Results" value={stats?.pending_labs} />
        <StatCard title="Medication to Dispense" value={stats?.pending_prescriptions} />
        <StatCard title="Scheduled Appointments" value={stats?.today_appointments} />
      </div>
      
      {/* NCD Program */}
      <Card>
        <h2>NCD Program</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Active Enrollments" value={stats?.active_ncd} />
          <StatCard title="Due for Follow-up" value={stats?.due_followups} />
          <StatCard title="Missed Appointments" value={stats?.missed_appointments} />
        </div>
      </Card>
      
      {/* Cross-Program Coordination */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3>Incoming from HO</h3>
          <ul>
            <li>Pending Referrals: {stats?.incoming_referrals}</li>
            <li>Home Visit Updates: {stats?.home_visit_updates}</li>
          </ul>
          <Button onClick={() => navigate('/hp/referrals/incoming')}>
            View All
          </Button>
        </Card>
        
        <Card>
          <h3>Shared with HO</h3>
          <ul>
            <li>Follow-ups Assigned to HO: {stats?.ho_followups}</li>
            <li>Missed Appts Tracking: {stats?.ho_missed_tracking}</li>
          </ul>
          <Button onClick={() => navigate('/hp/shared-follow-ups')}>
            View All
          </Button>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <h3>Quick Actions</h3>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/hp/patients/register')}>
            Register New Patient
          </Button>
          <Button onClick={() => navigate('/hp/ncd/enroll')}>
            Enroll in NCD
          </Button>
          <Button onClick={() => navigate('/hp/referrals/create')}>
            Create Referral to HO
          </Button>
          <Button onClick={() => navigate('/hp/import')}>
            Import Patient Data
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

### HO CHW Mobile Interface

```typescript
// src/pages/ho/CHWDashboard.tsx

export function CHWDashboard() {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState([]);
  
  useEffect(() => {
    loadTodayTasks();
  }, []);
  
  const loadTodayTasks = async () => {
    // Home visits scheduled for today
    const { data: homeVisits } = await supabase
      .from('coordination.home_visits')
      .select('*, patient:patient_id(given_name, family_name)')
      .eq('chw_user_id', user.id)
      .eq('visit_date', format(new Date(), 'yyyy-MM-dd'))
      .order('visit_time');
    
    // Missed appointments assigned to me
    const { data: missedAppts } = await supabase
      .from('coordination.missed_appointments')
      .select('*, patient:patient_id(given_name, family_name, phone_primary)')
      .eq('ho_follow_up_user_id', user.id)
      .eq('ho_follow_up_completed', false);
    
    // Shared follow-ups from HP
    const { data: sharedFollowUps } = await supabase
      .from('coordination.shared_follow_ups')
      .select('*, patient:patient_id(given_name, family_name)')
      .contains('visible_to_programs', ['HO'])
      .eq('follow_up_status', 'scheduled')
      .lte('follow_up_date', format(addDays(new Date(), 7), 'yyyy-MM-dd'));
    
    setTodayTasks({
      homeVisits,
      missedAppts,
      sharedFollowUps,
    });
  };
  
  return (
    <div className="mobile-optimized space-y-4">
      <h1>My Tasks - {format(new Date(), 'MMM dd, yyyy')}</h1>
      
      {/* Home Visits */}
      <Card>
        <h2>Scheduled Home Visits ({todayTasks.homeVisits?.length})</h2>
        {todayTasks.homeVisits?.map(visit => (
          <div key={visit.id} className="border-b py-2">
            <div className="flex justify-between">
              <span className="font-bold">
                {visit.patient.given_name} {visit.patient.family_name}
              </span>
              <span>{visit.visit_time}</span>
            </div>
            <div className="text-sm text-gray-600">
              Purpose: {visit.visit_purpose.join(', ')}
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate(`/ho/home-visits/conduct/${visit.patient_id}`)}
            >
              Conduct Visit
            </Button>
          </div>
        ))}
      </Card>
      
      {/* Missed Appointments to Follow Up */}
      <Card>
        <h2>Missed Appt Follow-ups ({todayTasks.missedAppts?.length})</h2>
        {todayTasks.missedAppts?.map(appt => (
          <div key={appt.id} className="border-b py-2">
            <div className="font-bold">
              {appt.patient.given_name} {appt.patient.family_name}
            </div>
            <div className="text-sm">
              Missed: {format(appt.scheduled_date, 'MMM dd')}
            </div>
            <div className="text-sm">
              Phone: {appt.patient.phone_primary}
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => callPatient(appt.patient.phone_primary)}>
                Call
              </Button>
              <Button size="sm" onClick={() => navigate(`/ho/missed-appointments/${appt.id}/follow-up`)}>
                Record Follow-up
              </Button>
            </div>
          </div>
        ))}
      </Card>
      
      {/* HP Follow-ups */}
      <Card>
        <h2>HP Follow-ups This Week ({todayTasks.sharedFollowUps?.length})</h2>
        {todayTasks.sharedFollowUps?.map(followUp => (
          <div key={followUp.id} className="border-b py-2">
            <div className="font-bold">
              {followUp.patient.given_name} {followUp.patient.family_name}
            </div>
            <div className="text-sm">
              Due: {format(followUp.follow_up_date, 'MMM dd')}
            </div>
            <div className="text-sm">
              Type: {followUp.follow_up_type}
            </div>
            <Button 
              size="sm"
              onClick={() => navigate(`/ho/follow-ups/complete/${followUp.id}`)}
            >
              Complete
            </Button>
          </div>
        ))}
      </Card>
      
      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button onClick={() => navigate('/ho/screening/session')}>
          Start Screening
        </Button>
        <Button onClick={() => navigate('/ho/patients/register')}>
          Register Patient
        </Button>
      </div>
    </div>
  );
}
```

### Management Cross-Program Dashboard

```typescript
// src/pages/management/Dashboard.tsx

export function ManagementDashboard() {
  const [programStats, setProgramStats] = useState(null);
  
  useEffect(() => {
    loadCrossProgramStats();
  }, []);
  
  return (
    <div className="space-y-6">
      <h1>Management Dashboard - All Programs</h1>
      
      {/* Program Comparison */}
      <Card>
        <h2>Program Overview</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th>Metric</th>
              <th>HP</th>
              <th>HO</th>
              <th>HSS</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Active Patients</td>
              <td>{programStats?.hp.active_patients}</td>
              <td>{programStats?.ho.active_patients}</td>
              <td>-</td>
              <td>{programStats?.total.active_patients}</td>
            </tr>
            <tr>
              <td>Encounters (MTD)</td>
              <td>{programStats?.hp.encounters_mtd}</td>
              <td>{programStats?.ho.encounters_mtd}</td>
              <td>-</td>
              <td>{programStats?.total.encounters_mtd}</td>
            </tr>
            <tr>
              <td>NCD Enrollments</td>
              <td>{programStats?.hp.ncd_enrollments}</td>
              <td>{programStats?.ho.ncd_enrollments}</td>
              <td>-</td>
              <td>{programStats?.total.ncd_enrollments}</td>
            </tr>
          </tbody>
        </table>
      </Card>
      
      {/* Coordination Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <h3>Cross-Program Referrals</h3>
          <p className="text-3xl">{programStats?.coordination.total_referrals}</p>
          <ul className="text-sm mt-2">
            <li>HP → HO: {programStats?.coordination.hp_to_ho}</li>
            <li>HO → HP: {programStats?.coordination.ho_to_hp}</li>
            <li>Pending: {programStats?.coordination.pending_referrals}</li>
          </ul>
        </Card>
        
        <Card>
          <h3>Home Visits (HO)</h3>
          <p className="text-3xl">{programStats?.coordination.home_visits_mtd}</p>
          <ul className="text-sm mt-2">
            <li>This Month: {programStats?.coordination.home_visits_mtd}</li>
            <li>Avg per CHW: {programStats?.coordination.avg_visits_per_chw}</li>
            <li>Urgent: {programStats?.coordination.urgent_home_visits}</li>
          </ul>
        </Card>
        
        <Card>
          <h3>Missed Appointments</h3>
          <p className="text-3xl">{programStats?.coordination.missed_appointments}</p>
          <ul className="text-sm mt-2">
            <li>Total: {programStats?.coordination.missed_appointments}</li>
            <li>Followed Up: {programStats?.coordination.followed_up}</li>
            <li>Pending: {programStats?.coordination.pending_followup}</li>
          </ul>
        </Card>
      </div>
      
      {/* NCD Quality Indicators */}
      <Card>
        <h2>NCD Quality Indicators</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3>BP Control Rate</h3>
            <div className="flex gap-4">
              <div>
                <p className="text-sm">HP</p>
                <p className="text-2xl">{programStats?.quality.hp_bp_control}%</p>
              </div>
              <div>
                <p className="text-sm">HO</p>
                <p className="text-2xl">{programStats?.quality.ho_bp_control}%</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3>Glucose Control Rate</h3>
            <div className="flex gap-4">
              <div>
                <p className="text-sm">HP</p>
                <p className="text-2xl">{programStats?.quality.hp_glucose_control}%</p>
              </div>
              <div>
                <p className="text-sm">HO</p>
                <p className="text-2xl">{programStats?.quality.ho_glucose_control}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Quick Navigation */}
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={() => navigate('/management/comparison/hp-vs-ho')}>
          HP vs HO Analysis
        </Button>
        <Button onClick={() => navigate('/management/coordination/referrals')}>
          All Referrals
        </Button>
        <Button onClick={() => navigate('/management/reports/export')}>
          Export Data
        </Button>
        <Button onClick={() => navigate('/management/users')}>
          User Management
        </Button>
      </div>
    </div>
  );
}
```

---

## 🔧 Implementation Checklist

### Phase 1: Authentication & Authorization (Week 1)
- [ ] Extend auth.user_profiles table with program & permissions
- [ ] Implement role-permission matrix function
- [ ] Create RLS policies for all tables
- [ ] Build login page with Google OAuth2
- [ ] Implement role-based routing
- [ ] Fix loading issue on root URL (redirect logic)

### Phase 2: Cross-Program Coordination (Week 2)
- [ ] Create coordination schema tables
- [ ] Implement cross_program_referrals workflow
- [ ] Implement shared_follow_ups workflow
- [ ] Implement home_visits workflow
- [ ] Implement missed_appointments workflow
- [ ] Build notification system for cross-program events

### Phase 3: Program-Specific Dashboards (Week 3)
- [ ] Build HP Dashboard & routes
- [ ] Build HO Dashboard & routes (mobile-optimized)
- [ ] Build HSS Dashboard & routes
- [ ] Build Management Dashboard (cross-program)
- [ ] Build Researcher Dashboard (analytics only)
- [ ] Build M&E Dashboard
- [ ] Build Donor Dashboard

### Phase 4: Analytics & Reporting (Week 4)
- [ ] Create de-identified views for researchers
- [ ] Build data export function (CSV)
- [ ] Implement program comparison queries
- [ ] Build cross-program analytics dashboards
- [ ] Create automated reports
- [ ] Implement DHIS2 export format

### Phase 5: Bulk Import (Week 5)
- [ ] Extend import schema with program tagging
- [ ] Build program-specific import UI
- [ ] Implement program-based duplicate detection
- [ ] Test import with existing NCD data
- [ ] Test import with HP vs HO data segregation

### Phase 6: Testing & Deployment (Week 6)
- [ ] End-to-end testing of HP workflows
- [ ] End-to-end testing of HO workflows
- [ ] Test cross-program coordination
- [ ] Test all role-based access
- [ ] Performance testing
- [ ] Security audit
- [ ] Production deployment

---

## 📚 User Guides

### HP Coordinator Quick Start

```markdown
# HP Coordinator Guide

## Daily Workflow

1. **Morning Review**
   - Check Dashboard → Today's Overview
   - Review Pending Lab Results
   - Check Incoming Referrals from HO

2. **Patient Registration**
   - Patients → Register New Patient
   - Select Program: HP
   - Complete registration form
   - Patient automatically tagged to HP program

3. **NCD Management**
   - NCD → Enroll for new NCD patients
   - NCD → Follow-up for existing enrollments
   - View Treatment Protocols for medication updates

4. **Coordinating with HO**
   - Referrals → Create Referral (for home visit needs)
   - Shared Follow-ups → View HO home visit updates
   - Missed Appointments → Assign to HO for follow-up

5. **Data Management**
   - Import → Upload CSV for bulk patient import
   - Reports → Export data for analysis
```

### HO CHW Field Guide

```markdown
# Community Health Worker Guide

## Field Workflow (Mobile-Optimized)

1. **Morning Preparation**
   - Dashboard → Check Today's Tasks
   - Review Scheduled Home Visits
   - Check Missed Appointment Follow-ups
   - Download patient list for offline access

2. **Community Screening**
   - Screening → Start Screening Session
   - Record vitals for each participant
   - High-risk patients auto-flagged for HP referral
   - Submit screening results (syncs when online)

3. **Home Visit**
   - Home Visits → Conduct Visit
   - Record GPS location
   - Take vital signs
   - Assess medication adherence
   - Create urgent referral to HP if needed
   - Notes automatically shared with HP team

4. **Missed Appointment Follow-up**
   - Missed Appointments → Select patient
   - Call or visit patient
   - Record outcome (contacted, rescheduled, etc.)
   - HP team notified automatically

5. **End of Day**
   - Sync all offline data
   - Review completed tasks
   - Plan tomorrow's visits
```

---

## 🚀 Deployment Instructions

### Update Firebase Hosting

```bash
# 1. Fix root URL routing issue
# Edit public/index.html to add redirect meta tag

# 2. Update src/App.tsx
# Add proper authentication check at root

# 3. Build and deploy
npm run build
firebase deploy --only hosting

# 4. Test
# https://zarish-health-dd05f.web.app → Should redirect to /login if not authenticated
# After login → Should redirect to role-specific dashboard
```

### Supabase Migrations

```bash
# Run all new migrations
supabase db push

# Migrations include:
# - auth.user_profiles extensions
# - coordination schema
# - RLS policies
# - Analytics views
# - Program comparison queries

# Seed sample users
supabase db seed
```

---

## 📄 Document Control

```yaml
Document: ZARISH HEALTH Multi-Program HIS PRD v3
Version: 3.0.0
Date: February 16, 2026
Status: Active
Deployment: https://zarish-health-dd05f.web.app
GitHub: https://github.com/zs-health

Key Features:
  - Multi-program architecture (HP, HO, HSS)
  - Role-based access control (10+ roles)
  - Cross-program coordination workflows
  - Program-specific data segregation with sharing
  - Analytics-only access for researchers
  - De-identified data exports
  - Mobile-optimized for field workers
  - Bulk import with program tagging

Revision History:
  3.0.0 (2026-02-16): Multi-program, cross-program coordination, role-based views
  2.0.0 (2026-02-16): Firebase/Supabase, bulk import, NCD protocols
  1.0.0 (2026-02-15): Initial Kubernetes architecture
```

---

**END OF DOCUMENT**

This PRD provides complete specifications for a multi-program, role-based HIS with seamless cross-program coordination while maintaining program autonomy and data security.
