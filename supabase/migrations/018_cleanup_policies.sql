-- ============================================================
-- ZARISH HEALTH v3 — Policy Cleanup Migration
-- Version: 3.0.1
-- Description: Cleanup conflicting RLS policies to resolve 503 errors
-- ============================================================

BEGIN;

-- ============================================================
-- 1. USER ROLES POLICIES
-- ============================================================

-- Drop all known policies to ensure a clean slate
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Anyone can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON user_roles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_roles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_own" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert_self" ON user_roles;


-- Create simple, non-recursive policies
CREATE POLICY "users_read_own_role" ON user_roles 
    FOR SELECT TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_role" ON user_roles 
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_role" ON user_roles 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = user_id);

-- ============================================================
-- 2. FACILITIES POLICIES
-- ============================================================

-- Drop all known policies
DROP POLICY IF EXISTS "Authenticated users can read facilities" ON facilities;
DROP POLICY IF EXISTS "Anyone can read facilities" ON facilities;
DROP POLICY IF EXISTS "Enable read access for all users" ON facilities;

-- Create simple policy for authenticated users
CREATE POLICY "authenticated_read_facilities" ON facilities 
    FOR SELECT TO authenticated 
    USING (true);

COMMIT;
