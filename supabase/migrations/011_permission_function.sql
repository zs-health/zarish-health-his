-- ============================================================
-- ZARISH HEALTH v3 — Permission Functions
-- Version: 3.0.0
-- Description: Generate default permissions based on role
-- ============================================================

-- ============================================================
-- Permission Generation Function
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_default_permissions(user_role VARCHAR)
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
    
    -- HP Nurse
    WHEN 'hp_nurse' THEN '{
      "patient": {"view": true, "create": false, "update": true, "delete": false},
      "encounter": {"view": true, "create": true, "update": true},
      "ncd": {"view": true, "create": false, "update": true},
      "prescription": {"view": true, "create": false},
      "lab": {"view": true, "create": true, "update": false},
      "billing": {"view": false, "create": false},
      "analytics": {"view": false, "export": false},
      "reports": {"view": false, "export": false},
      "import": {"execute": false},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    -- HP Pharmacist
    WHEN 'hp_pharmacist' THEN '{
      "patient": {"view": true, "create": false, "update": false, "delete": false},
      "encounter": {"view": true, "create": false, "update": false},
      "ncd": {"view": false, "create": false, "update": false},
      "prescription": {"view": true, "create": true},
      "lab": {"view": false, "create": false, "update": false},
      "billing": {"view": true, "create": true},
      "analytics": {"view": false, "export": false},
      "reports": {"view": false, "export": false},
      "import": {"execute": false},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    -- HP Lab Technician
    WHEN 'hp_lab_tech' THEN '{
      "patient": {"view": true, "create": false, "update": false, "delete": false},
      "encounter": {"view": true, "create": false, "update": false},
      "ncd": {"view": false, "create": false, "update": false},
      "prescription": {"view": false, "create": false},
      "lab": {"view": true, "create": true, "update": true},
      "billing": {"view": false, "create": false},
      "analytics": {"view": false, "export": false},
      "reports": {"view": false, "export": false},
      "import": {"execute": false},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    -- HP Registrar
    WHEN 'hp_registrar' THEN '{
      "patient": {"view": true, "create": true, "update": true, "delete": false},
      "encounter": {"view": true, "create": true, "update": false},
      "ncd": {"view": false, "create": false, "update": false},
      "prescription": {"view": false, "create": false},
      "lab": {"view": false, "create": false, "update": false},
      "billing": {"view": true, "create": true},
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
    
    -- HO Nurse
    WHEN 'ho_nurse' THEN '{
      "patient": {"view": true, "create": false, "update": true, "delete": false},
      "encounter": {"view": true, "create": true, "update": true},
      "ncd": {"view": true, "create": false, "update": true},
      "prescription": {"view": true, "create": false},
      "lab": {"view": true, "create": true, "update": false},
      "billing": {"view": false, "create": false},
      "analytics": {"view": false, "export": false},
      "reports": {"view": false, "export": false},
      "import": {"execute": false},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    -- HO Health Educator
    WHEN 'ho_educator' THEN '{
      "patient": {"view": true, "create": false, "update": false, "delete": false},
      "encounter": {"view": true, "create": true, "update": false},
      "ncd": {"view": true, "create": false, "update": false},
      "prescription": {"view": false, "create": false},
      "lab": {"view": false, "create": false, "update": false},
      "billing": {"view": false, "create": false},
      "analytics": {"view": false, "export": false},
      "reports": {"view": false, "export": false},
      "import": {"execute": false},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    -- HSS Coordinator
    WHEN 'hss_coordinator' THEN '{
      "patient": {"view": true, "create": false, "update": false, "delete": false},
      "encounter": {"view": true, "create": false, "update": false},
      "ncd": {"view": false, "create": false, "update": false},
      "prescription": {"view": false, "create": false},
      "lab": {"view": false, "create": false, "update": false},
      "billing": {"view": true, "create": false},
      "analytics": {"view": true, "export": true},
      "reports": {"view": true, "export": true},
      "import": {"execute": true},
      "users": {"view": true, "create": true, "update": true},
      "settings": {"view": true, "update": true}
    }'::jsonb
    
    -- HSS Trainer
    WHEN 'hss_trainer' THEN '{
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
    
    -- HSS Quality Officer
    WHEN 'hss_quality_officer' THEN '{
      "patient": {"view": false, "create": false, "update": false, "delete": false},
      "encounter": {"view": true, "create": false, "update": false},
      "ncd": {"view": true, "create": false, "update": false},
      "prescription": {"view": false, "create": false},
      "lab": {"view": true, "create": false, "update": false},
      "billing": {"view": true, "create": false},
      "analytics": {"view": true, "export": true},
      "reports": {"view": true, "export": true},
      "import": {"execute": false},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    -- HSS Data Officer
    WHEN 'hss_data_officer' THEN '{
      "patient": {"view": true, "create": false, "update": false, "delete": false},
      "encounter": {"view": true, "create": false, "update": false},
      "ncd": {"view": true, "create": false, "update": false},
      "prescription": {"view": false, "create": false},
      "lab": {"view": false, "create": false, "update": false},
      "billing": {"view": false, "create": false},
      "analytics": {"view": true, "export": true},
      "reports": {"view": true, "export": true},
      "import": {"execute": true},
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
    
    -- Legacy roles (for backward compatibility)
    WHEN 'super_admin' THEN '{
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
    
    WHEN 'admin' THEN '{
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
    
    WHEN 'facility_manager' THEN '{
      "patient": {"view": true, "create": true, "update": true, "delete": false},
      "encounter": {"view": true, "create": true, "update": true},
      "ncd": {"view": true, "create": true, "update": true},
      "prescription": {"view": true, "create": false},
      "lab": {"view": true, "create": true, "update": false},
      "billing": {"view": true, "create": true},
      "analytics": {"view": true, "export": true},
      "reports": {"view": true, "export": true},
      "import": {"execute": true},
      "users": {"view": true, "create": false, "update": false},
      "settings": {"view": true, "update": false}
    }'::jsonb
    
    WHEN 'provider' THEN '{
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
    
    WHEN 'chw' THEN '{
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
    
    WHEN 'data_entry' THEN '{
      "patient": {"view": true, "create": true, "update": true, "delete": false},
      "encounter": {"view": true, "create": true, "update": false},
      "ncd": {"view": true, "create": true, "update": false},
      "prescription": {"view": false, "create": false},
      "lab": {"view": true, "create": true, "update": false},
      "billing": {"view": false, "create": false},
      "analytics": {"view": false, "export": false},
      "reports": {"view": false, "export": false},
      "import": {"execute": true},
      "users": {"view": false, "create": false, "update": false},
      "settings": {"view": false, "update": false}
    }'::jsonb
    
    WHEN 'viewer' THEN '{
      "patient": {"view": true, "create": false, "update": false, "delete": false},
      "encounter": {"view": true, "create": false, "update": false},
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

-- ============================================================
-- Function to update user permissions based on role
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
    NEW.permissions := COALESCE(NEW.permissions, get_default_permissions(NEW.role));
    
    -- Set access scope based on role
    NEW.access_scope := CASE
        WHEN NEW.role IN ('management', 'me_officer', 'researcher', 'donor', 'super_admin', 'admin') 
        THEN ARRAY['all_programs']::TEXT[]
        WHEN NEW.role IN ('hp_coordinator', 'hp_doctor', 'hp_nurse', 'hp_pharmacist', 'hp_lab_tech', 'hp_registrar')
        THEN ARRAY['hp']::TEXT[]
        WHEN NEW.role IN ('ho_coordinator', 'ho_chw', 'ho_nurse', 'ho_educator')
        THEN ARRAY['ho']::TEXT[]
        WHEN NEW.role IN ('hss_coordinator', 'hss_trainer', 'hss_quality_officer', 'hss_data_officer')
        THEN ARRAY['hss']::TEXT[]
        ELSE ARRAY['own_program']::TEXT[]
    END;
    
    -- Set program-specific data access
    NEW.can_view_hp_data := CASE
        WHEN NEW.role IN ('management', 'me_officer', 'super_admin', 'admin') THEN TRUE
        WHEN NEW.role LIKE 'hp_%' THEN TRUE
        ELSE FALSE
    END;
    
    NEW.can_view_ho_data := CASE
        WHEN NEW.role IN ('management', 'me_officer', 'super_admin', 'admin') THEN TRUE
        WHEN NEW.role LIKE 'ho_%' THEN TRUE
        ELSE FALSE
    END;
    
    NEW.can_view_hss_data := CASE
        WHEN NEW.role IN ('management', 'me_officer', 'super_admin', 'admin') THEN TRUE
        WHEN NEW.role LIKE 'hss_%' THEN TRUE
        ELSE FALSE
    END;
    
    -- Set program if not already set
    NEW.program := CASE
        WHEN NEW.role LIKE 'hp_%' THEN 'HP'::VARCHAR(50)
        WHEN NEW.role LIKE 'ho_%' THEN 'HO'::VARCHAR(50)
        WHEN NEW.role LIKE 'hss_%' THEN 'HSS'::VARCHAR(50)
        WHEN NEW.role IN ('management', 'me_officer', 'researcher', 'donor', 'super_admin', 'admin', 'facility_manager', 'provider', 'chw', 'data_entry', 'viewer') THEN NULL
        ELSE NEW.program
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update permissions
DROP TRIGGER IF EXISTS set_default_permissions ON user_roles;
CREATE TRIGGER set_default_permissions
    BEFORE INSERT OR UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_permissions();

-- ============================================================
-- Grant execute permission to authenticated users
-- ============================================================
GRANT EXECUTE ON FUNCTION public.get_default_permissions(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_permissions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cross_program_stats() TO authenticated;
