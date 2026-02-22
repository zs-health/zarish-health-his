-- ============================================================
-- ZARISH HEALTH v3 — Debugging Migration
-- Version: 3.0.2
-- Description: Temporarily disable RLS on user_roles to debug 503s
-- ============================================================

-- Disable RLS on user_roles to see if it fixes the 503 errors
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
