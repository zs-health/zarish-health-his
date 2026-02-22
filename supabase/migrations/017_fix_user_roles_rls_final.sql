-- Fix RLS policies on user_roles table
-- This is critical for login to work properly

BEGIN;

-- Drop all existing policies on user_roles
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can read user_roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can insert user_roles" ON user_roles;

-- Create simple policies that allow authenticated users to work with their own role
-- This is needed for login to work

-- Allow any authenticated user to SELECT their own role
CREATE POLICY "user_roles_select_own" ON user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Allow any authenticated user to INSERT their own role (for initial setup)
CREATE POLICY "user_roles_insert_own" ON user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Allow any authenticated user to UPDATE their own role
CREATE POLICY "user_roles_update_own" ON user_roles
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Allow authenticated users to read all user_roles (needed for admin features)
CREATE POLICY "user_roles_select_all" ON user_roles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('super_admin', 'admin', 'management')
        )
    );

COMMIT;
