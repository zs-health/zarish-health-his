-- Create a trigger to auto-assign role to new users
-- This will give new users a default hp_coordinator role

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default role for new user
    INSERT INTO user_roles (user_id, role, program, permissions, is_active)
    VALUES (
        NEW.id,
        'hp_coordinator'::text,
        'HP'::varchar(50),
        '{
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
        }'::jsonb,
        true
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
