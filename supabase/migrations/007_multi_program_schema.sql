-- ============================================================
-- ZARISH HEALTH v3 — Multi-Program Schema Migration
-- Version: 3.0.0
-- Description: Add multi-program support (HP, HO, HSS)
-- ============================================================

-- Extend facilities table with programs array
ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS programs TEXT[] DEFAULT ARRAY['HP']::TEXT[];

-- Update existing facilities to have HP program
UPDATE facilities 
SET programs = ARRAY['HP']::TEXT[] 
WHERE programs IS NULL OR programs = ARRAY[]::TEXT[];

-- Extend user_roles table with new v3 roles and program support
ALTER TABLE user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check,
ADD CONSTRAINT user_roles_role_check CHECK (role IN (
  'hp_coordinator', 'hp_doctor', 'hp_nurse', 'hp_pharmacist', 'hp_lab_tech', 'hp_registrar',
  'ho_coordinator', 'ho_chw', 'ho_nurse', 'ho_educator',
  'hss_coordinator', 'hss_trainer', 'hss_quality_officer', 'hss_data_officer',
  'management', 'researcher', 'me_officer', 'donor',
  'super_admin', 'admin', 'facility_manager', 'provider', 'chw', 'data_entry', 'viewer'
));

-- Add new columns to user_roles
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS program VARCHAR(50) CHECK (program IN ('HP', 'HO', 'HSS') OR program IS NULL),
ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS access_scope TEXT[] DEFAULT ARRAY['own_program']::TEXT[],
ADD COLUMN IF NOT EXISTS can_view_hp_data BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_view_ho_data BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_view_hss_data BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_share_to_hp BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_share_to_ho BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_share_to_hss BOOLEAN DEFAULT FALSE;

-- Extend patients table with program tags
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS registered_program VARCHAR(50) CHECK (registered_program IN ('HP', 'HO', 'HSS') OR registered_program IS NULL),
ADD COLUMN IF NOT EXISTS registered_by_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS primary_program VARCHAR(50) DEFAULT 'HP' CHECK (primary_program IN ('HP', 'HO', 'HSS') OR primary_program IS NULL),
ADD COLUMN IF NOT EXISTS shared_with_programs TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing patients to have HP as their registered program
UPDATE patients 
SET registered_program = 'HP', 
    primary_program = 'HP'
WHERE registered_program IS NULL;

-- Create indexes for program queries
CREATE INDEX IF NOT EXISTS idx_patients_program ON patients(registered_program);
CREATE INDEX IF NOT EXISTS idx_patients_primary_program ON patients(primary_program);
CREATE INDEX IF NOT EXISTS idx_patients_shared ON patients USING gin(shared_with_programs);
CREATE INDEX IF NOT EXISTS idx_facilities_programs ON facilities USING gin(programs);
CREATE INDEX IF NOT EXISTS idx_user_roles_program ON user_roles(program);

-- Add program column to encounters table
ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS program VARCHAR(50) CHECK (program IN ('HP', 'HO', 'HSS') OR program IS NULL);

UPDATE encounters
SET program = 'HP'
WHERE program IS NULL;

-- Enable UUID extension for new tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create coordination schema
CREATE SCHEMA IF NOT EXISTS coordination;

-- Create analytics schema  
CREATE SCHEMA IF NOT EXISTS analytics;

COMMENT ON COLUMN patients.registered_program IS 'Program where patient was initially registered (HP, HO, HSS)';
COMMENT ON COLUMN patients.primary_program IS 'Primary program managing patient care';
COMMENT ON COLUMN patients.shared_with_programs IS 'Array of programs that have access to this patient record';
COMMENT ON COLUMN user_roles.program IS 'Program this user belongs to (HP, HO, HSS)';
COMMENT ON COLUMN user_roles.permissions IS 'JSONB object defining granular permissions';
COMMENT ON COLUMN user_roles.access_scope IS 'Array defining which programs data user can access';
