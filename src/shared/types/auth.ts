export type Program = 'HP' | 'HO' | 'HSS';

export type UserRole = 
  | 'hp_coordinator' | 'hp_doctor' | 'hp_nurse' | 'hp_pharmacist' | 'hp_lab_tech' | 'hp_registrar'
  | 'ho_coordinator' | 'ho_chw' | 'ho_nurse' | 'ho_educator'
  | 'hss_coordinator' | 'hss_trainer' | 'hss_quality_officer' | 'hss_data_officer'
  | 'management' | 'researcher' | 'me_officer' | 'donor' | 'admin';

export interface UserPermissions {
  patient: { view: boolean; create: boolean; update: boolean; delete: boolean };
  encounter: { view: boolean; create: boolean; update: boolean };
  ncd: { view: boolean; create: boolean; update: boolean };
  prescription: { view: boolean; create: boolean };
  lab: { view: boolean; create: boolean; update: boolean };
  billing: { view: boolean; create: boolean };
  analytics: { view: boolean; export: boolean };
  reports: { view: boolean; export: boolean };
  import: { execute: boolean };
  users: { view: boolean; create: boolean; update: boolean };
  settings: { view: boolean; update: boolean };
}

export interface UserProfile {
  id: string;
  employee_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  program?: Program;
  facility_id?: string;
  permissions: UserPermissions;
  access_scope: string[];
  can_view_hp_data: boolean;
  can_view_ho_data: boolean;
  can_view_hss_data: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
