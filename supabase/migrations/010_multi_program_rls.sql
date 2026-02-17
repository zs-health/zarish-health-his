-- ============================================================
-- ZARISH HEALTH v3 — Multi-Program RLS Policies
-- Version: 3.0.0
-- Description: Updated Row-Level Security for multi-program access
-- ============================================================

-- ============================================================
-- Drop old patient policies (if exist)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read patients" ON patients;
DROP POLICY IF EXISTS "Anyone can insert patients" ON patients;
DROP POLICY IF EXISTS "Anyone can update patients" ON patients;
DROP POLICY IF EXISTS "Anyone can delete patients" ON patients;
DROP POLICY IF EXISTS "Users can view patients" ON patients;
DROP POLICY IF EXISTS "Users can insert patients" ON patients;
DROP POLICY IF EXISTS "Users can update patients" ON patients;

-- ============================================================
-- Patient Table RLS Policies
-- ============================================================

-- View: Users can view patients from their own program or shared programs
CREATE POLICY patient_view_own_program ON patients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                -- Admin and system roles can see all
                user_roles.role IN ('super_admin', 'admin')
                
                -- Cross-cutting roles can see all
                OR user_roles.role IN ('management', 'me_officer', 'researcher')
                
                -- Program-specific: can see own program
                OR (
                    user_roles.program = patients.registered_program
                    AND COALESCE((user_roles.permissions->'patient'->>'view')::boolean, false) = true
                )
                
                -- Can see if patient is shared with their program
                OR user_roles.program = ANY(COALESCE(patients.shared_with_programs, ARRAY[]::TEXT[]))
                
                -- Fallback: if no program set, can view all (legacy support)
                OR user_roles.program IS NULL
              )
        )
    );

-- Insert: Users can only create patients in their own program
CREATE POLICY patient_insert_own_program ON patients
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                -- Admin can create any
                user_roles.role IN ('super_admin', 'admin')
                
                -- Program-specific: can create in own program
                OR (
                    user_roles.program IS NOT NULL
                    AND (user_roles.program = NEW.registered_program OR NEW.registered_program IS NULL)
                    AND COALESCE((user_roles.permissions->'patient'->>'create')::boolean, false) = true
                )
              )
        )
    );

-- Update: Users can update patients from their own program or shared programs
CREATE POLICY patient_update_own_program ON patients
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                -- Admin can update any
                user_roles.role IN ('super_admin', 'admin')
                
                -- Program-specific: can update own program
                OR (
                    user_roles.program = patients.registered_program
                    AND COALESCE((user_roles.permissions->'patient'->>'update')::boolean, false) = true
                )
                
                -- Can update if shared with their program
                OR (
                    user_roles.program = ANY(COALESCE(patients.shared_with_programs, ARRAY[]::TEXT[]))
                    AND COALESCE((user_roles.permissions->'patient'->>'update')::boolean, false) = true
                )
              )
        )
    );

-- ============================================================
-- Encounters RLS Policies
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read encounters" ON encounters;
DROP POLICY IF EXISTS "Anyone can insert encounters" ON encounters;
DROP POLICY IF EXISTS "Anyone can update encounters" ON encounters;

CREATE POLICY encounter_view_program ON encounters
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles up
            JOIN facilities f ON f.id = encounters.facility_id
            WHERE up.user_id = auth.uid()
              AND (
                up.role IN ('super_admin', 'admin', 'management', 'me_officer')
                OR up.program = encounters.program
                OR up.program = ANY(COALESCE(f.programs, ARRAY['HP']::TEXT[]))
                OR COALESCE((up.permissions->'encounter'->>'view')::boolean, false) = true
              )
        )
    );

CREATE POLICY encounter_insert_program ON encounters
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles up
            WHERE up.user_id = auth.uid()
              AND (
                up.role IN ('super_admin', 'admin')
                OR (
                    up.program = NEW.program
                    AND COALESCE((up.permissions->'encounter'->>'create')::boolean, false) = true
                )
              )
        )
    );

CREATE POLICY encounter_update_program ON encounters
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles up
            WHERE up.user_id = auth.uid()
              AND (
                up.role IN ('super_admin', 'admin')
                OR (
                    up.program = encounters.program
                    AND COALESCE((up.permissions->'encounter'->>'update')::boolean, false) = true
                )
              )
        )
    );

-- ============================================================
-- Cross-Program Referrals RLS Policies
-- ============================================================
CREATE POLICY referrals_view_program ON coordination.cross_program_referrals
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'management')
                OR user_roles.program = from_program
                OR user_roles.program = to_program
                OR user_roles.can_view_hp_data = true
                OR user_roles.can_view_ho_data = true
              )
        )
    );

CREATE POLICY referrals_insert_program ON coordination.cross_program_referrals
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin')
                OR user_roles.program = NEW.from_program
              )
        )
    );

CREATE POLICY referrals_update_program ON coordination.cross_program_referrals
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'management')
                OR user_roles.program = from_program
                OR user_roles.program = to_program
              )
        )
    );

-- ============================================================
-- Shared Follow-ups RLS Policies
-- ============================================================
CREATE POLICY follow_ups_view_program ON coordination.shared_follow_ups
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'management', 'me_officer')
                OR user_roles.program = ANY(visible_to_programs)
                OR user_roles.program = scheduled_by_program
                OR user_roles.program = completed_by_program
              )
        )
    );

CREATE POLICY follow_ups_insert_program ON coordination.shared_follow_ups
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin')
                OR user_roles.program = NEW.scheduled_by_program
              )
        )
    );

CREATE POLICY follow_ups_update_program ON coordination.shared_follow_ups
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'management')
                OR user_roles.program = ANY(visible_to_programs)
              )
        )
    );

-- ============================================================
-- Home Visits RLS Policies
-- ============================================================
CREATE POLICY home_visits_view_program ON coordination.home_visits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'management', 'me_officer')
                OR user_roles.user_id = chw_user_id
                OR (user_roles.program = 'HO' AND shared_with_hp = false)
                OR (user_roles.program = 'HP' AND shared_with_hp = true)
              )
        )
    );

CREATE POLICY home_visits_insert_program ON coordination.home_visits
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin')
                OR user_roles.program = 'HO'
                OR user_roles.role = 'ho_chw'
              )
        )
    );

CREATE POLICY home_visits_update_program ON coordination.home_visits
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'management')
                OR user_roles.user_id = chw_user_id
                OR (user_roles.program = 'HP' AND hp_acknowledged_by IS NOT NULL)
              )
        )
    );

-- ============================================================
-- Missed Appointments RLS Policies
-- ============================================================
CREATE POLICY missed_appts_view_program ON coordination.missed_appointments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'management', 'me_officer')
                OR user_roles.program = scheduled_program
                OR (user_roles.program = 'HO' AND shared_with_ho = true)
                OR user_roles.user_id = ho_follow_up_user_id
              )
        )
    );

CREATE POLICY missed_appts_insert_program ON coordination.missed_appointments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin')
                OR user_roles.program = NEW.scheduled_program
              )
        )
    );

CREATE POLICY missed_appts_update_program ON coordination.missed_appointments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'management')
                OR user_roles.program = scheduled_program
                OR user_roles.user_id = ho_follow_up_user_id
              )
        )
    );

-- ============================================================
-- Vital Signs RLS (for home visits to reference)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read vital_signs" ON vital_signs;

CREATE POLICY vital_signs_view_program ON vital_signs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'management', 'me_officer')
                OR COALESCE((user_roles.permissions->'lab'->>'view')::boolean, false) = true
                OR COALESCE((user_roles.permissions->'encounter'->>'view')::boolean, false) = true
              )
        )
    );

-- ============================================================
-- NCD Enrollments RLS
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read ncd_enrollments" ON ncd_enrollments;

CREATE POLICY ncd_enrollments_view_program ON ncd_enrollments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles up
            JOIN patients p ON p.id = ncd_enrollments.patient_id
            WHERE up.user_id = auth.uid()
              AND (
                up.role IN ('super_admin', 'admin', 'management', 'me_officer', 'researcher')
                OR up.program = ncd_enrollments.program
                OR up.program = p.registered_program
                OR up.program = ANY(COALESCE(p.shared_with_programs, ARRAY[]::TEXT[]))
              )
        )
    );
