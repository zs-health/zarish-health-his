-- Fix RLS on user_roles to prevent login hang
-- The circular reference in existing policies causes auth to hang

BEGIN;

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can manage user_roles" ON user_roles;

-- Allow authenticated users to read their own role
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role" ON user_roles 
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

-- Allow authenticated users to insert their own role (for self-registration)
CREATE POLICY "Users can insert own role" ON user_roles 
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to update their own role
CREATE POLICY "Users can update own role" ON user_roles 
    FOR UPDATE TO authenticated 
    USING (user_id = auth.uid());

COMMIT;
