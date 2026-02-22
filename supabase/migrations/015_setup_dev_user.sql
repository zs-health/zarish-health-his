-- Set up dev43ariful@gmail.com as super_admin
INSERT INTO user_roles (user_id, role, program, permissions, is_active)
VALUES (
    '66e70a2d-b187-4019-9682-6bbbbd74a107',
    'super_admin',
    NULL,
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
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', permissions = '{
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
    }'::jsonb;
