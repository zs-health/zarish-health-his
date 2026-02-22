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
                user_roles.role IN ('super_admin', 'admin')
                OR user_roles.role IN ('management', 'me_officer', 'researcher')
                OR user_roles.program = patients.registered_program
                OR user_roles.program IS NULL
              )
        )
    );

-- Insert: Allow authenticated users to insert
CREATE POLICY patient_insert_own_program ON patients
    FOR INSERT
    WITH CHECK (true);

-- Update: Allow authenticated users to update
CREATE POLICY patient_update_own_program ON patients
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'facility_manager')
                OR user_roles.program = patients.registered_program
                OR user_roles.program IS NULL
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
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'management', 'me_officer', 'viewer', 'data_entry')
                OR user_roles.role IS NOT NULL
              )
        )
    );

CREATE POLICY encounter_insert_program ON encounters
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY encounter_update_program ON encounters
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'facility_manager', 'provider')
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
                user_roles.role IN ('super_admin', 'admin', 'management', 'me_officer')
                OR user_roles.role IS NOT NULL
              )
        )
    );

CREATE POLICY referrals_insert_program ON coordination.cross_program_referrals
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY referrals_update_program ON coordination.cross_program_referrals
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
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
                OR user_roles.role IS NOT NULL
              )
        )
    );

CREATE POLICY follow_ups_insert_program ON coordination.shared_follow_ups
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY follow_ups_update_program ON coordination.shared_follow_ups
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
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
                OR user_roles.role IS NOT NULL
              )
        )
    );

CREATE POLICY home_visits_insert_program ON coordination.home_visits
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY home_visits_update_program ON coordination.home_visits
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
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
                OR user_roles.role IS NOT NULL
              )
        )
    );

CREATE POLICY missed_appts_insert_program ON coordination.missed_appointments
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY missed_appts_update_program ON coordination.missed_appointments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
        )
    );

-- ============================================================
-- Vital Signs RLS
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read vital_signs" ON vital_signs;

CREATE POLICY vital_signs_view_program ON vital_signs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
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
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
              AND (
                user_roles.role IN ('super_admin', 'admin', 'management', 'me_officer', 'researcher')
                OR user_roles.role IS NOT NULL
              )
        )
    );
