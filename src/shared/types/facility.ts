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
    | 'admin'
    | 'doctor'
    | 'nurse'
    | 'registrar'
    | 'pharmacist'
    | 'lab_tech'
    | 'data_entry'
    | 'community_health_worker';

export interface UserProfile {
    user_id: string;
    role: UserRole;
    facility_id?: string;
    permissions?: Record<string, boolean>;
    created_at: string;
    // Joined
    facility?: Facility;
    email?: string;
}
