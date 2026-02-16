-- Fix RLS policies for user_roles
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;

-- Allow authenticated users to read their own role
CREATE POLICY "Anyone can read own role" ON user_roles 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);
