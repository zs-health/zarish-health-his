-- Set up dev43ariful@gmail.com as super_admin
INSERT INTO user_roles (user_id, role, program, permissions, is_active)
SELECT 
    id, 
    'super_admin'::text, 
    NULL::varchar(50),
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
FROM auth.users 
WHERE email = 'dev43ariful@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
