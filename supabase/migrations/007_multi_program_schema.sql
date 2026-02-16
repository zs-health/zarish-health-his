-- Priority: P0 (Blocking all other work)
-- Migration: Multi-program schema extensions

ALTER TABLE patients ADD COLUMN IF NOT EXISTS
  registered_program VARCHAR(50) CHECK (registered_program IN ('HP', 'HO', 'HSS')),
  registered_by_user_id UUID REFERENCES auth.users(id),
  primary_program VARCHAR(50) DEFAULT 'HP' CHECK (primary_program IN ('HP', 'HO', 'HSS')),
  shared_with_programs TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE facilities ADD COLUMN IF NOT EXISTS
  programs TEXT[] DEFAULT ARRAY['HP'];

-- Update existing data
UPDATE patients SET registered_program = 'HP' WHERE registered_program IS NULL;
UPDATE facilities SET programs = ARRAY['HP'] WHERE programs IS NULL;

-- Update user_roles table (if it exists) or prepare for user_profiles
-- The PRD mentions user_roles and user_profiles. Let's handle both or adapt.
-- Based on the PRD, we are moving towards a more robust user_profiles table.

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
        ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN (
          'hp_coordinator', 'hp_doctor', 'hp_nurse', 'hp_pharmacist', 'hp_lab_tech', 'hp_registrar',
          'ho_coordinator', 'ho_chw', 'ho_nurse', 'ho_educator',
          'hss_coordinator', 'hss_trainer', 'hss_quality_officer', 'hss_data_officer',
          'management', 'researcher', 'me_officer', 'donor', 'admin'
        ));

        ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS
          program VARCHAR(50) CHECK (program IN ('HP', 'HO', 'HSS') OR program IS NULL),
          permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
          access_scope TEXT[] DEFAULT ARRAY['own_program'],
          can_view_hp_data BOOLEAN DEFAULT FALSE,
          can_view_ho_data BOOLEAN DEFAULT FALSE,
          can_view_hss_data BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
