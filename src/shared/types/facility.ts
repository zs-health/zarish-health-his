export type FacilityType =
    | 'Health Post'
    | 'Health Outreach'
    | 'Primary Health Center'
    | 'District Hospital'
    | 'Specialized Clinic'
    | 'Community Point'
    | 'CPI HP'
    | 'CPI HO'
    | 'CPI NCD';

export type OperationalStatus = 'active' | 'inactive' | 'temporarily_closed' | 'permanently_closed';

export interface Facility {
    id: string;
    facility_code: string;
    facility_name_en: string;
    facility_name_bn?: string;
    facility_type: FacilityType;
    service_level: 1 | 2 | 3 | 4;
    programs: string[];
    camp_name?: string;
    camp_block?: string;
    district?: string;
    upazila?: string;
    division?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    email?: string;
    operational_status: OperationalStatus;
    opening_date?: string;
    closing_date?: string;
    operational_hours?: Record<string, string>;
    staff_count?: number;
    patient_capacity_per_day?: number;
    consultation_rooms?: number;
    services_offered?: string[];
    parent_facility_id?: string;
    referral_network_id?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export type UserRole =
    | 'super_admin'
    | 'admin'
    | 'facility_manager'
    | 'provider'
    | 'chw'
    | 'data_entry'
    | 'viewer'
    | 'hp_coordinator'
    | 'hp_doctor'
    | 'hp_nurse'
    | 'hp_pharmacist'
    | 'hp_lab_tech'
    | 'hp_registrar'
    | 'ho_coordinator'
    | 'ho_chw'
    | 'ho_nurse'
    | 'ho_educator'
    | 'hss_coordinator'
    | 'hss_trainer'
    | 'hss_quality_officer'
    | 'hss_data_officer'
    | 'management'
    | 'researcher'
    | 'me_officer'
    | 'donor';

export type Program = 'HP' | 'HO' | 'HSS' | null;

export interface UserProfile {
    user_id: string;
    role: UserRole;
    facility_id?: string;
    program?: Program;
    permissions?: Record<string, Record<string, boolean>>;
    access_scope?: string[];
    can_view_hp_data?: boolean;
    can_view_ho_data?: boolean;
    can_view_hss_data?: boolean;
    can_share_to_hp?: boolean;
    can_share_to_ho?: boolean;
    can_share_to_hss?: boolean;
    created_at: string;
    // Joined
    facility?: Facility;
    email?: string;
    full_name?: string;
}
