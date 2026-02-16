export interface Patient {
    id: string;
    mrn: string;
    legacy_ncd_number?: string;
    legacy_patient_id?: string;
    progress_id?: string;
    ghc_number?: string;
    fcn?: string;
    given_name: string;
    family_name: string;
    middle_name?: string;
    full_name_bn?: string;
    full_name_my?: string;
    date_of_birth: string;
    age_at_registration?: number;
    age_years?: number;
    sex: 'Male' | 'Female' | 'Other';
    gender?: string;
    phone_primary?: string;
    phone_secondary?: string;
    email?: string;
    origin: 'Rohingya' | 'Bangladeshi' | 'Other';
    nationality?: string;
    marital_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated' | 'Unknown';
    father_name?: string;
    mother_name?: string;
    spouse_name?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    national_id?: string;
    passport_number?: string;
    birth_certificate_number?: string;
    blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
    is_vulnerable: boolean;
    is_pregnant: boolean;
    patient_status: PatientStatus;
    registration_facility_id?: string;
    registration_date: string;
    registered_by?: string;
    import_batch_id?: string;
    import_source?: string;
    import_date?: string;
    data_quality_score?: number;
    registered_program?: 'HP' | 'HO' | 'HSS';
    registered_by_user_id?: string;
    primary_program?: 'HP' | 'HO' | 'HSS';
    shared_with_programs?: string[];
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    // Joined
    addresses?: Address[];
}

export type PatientStatus = 'active' | 'inactive' | 'deceased' | 'transferred_out' | 'archived';

export interface Address {
    id: string;
    patient_id: string;
    address_type: 'current' | 'permanent' | 'temporary' | 'camp' | 'village' | 'other';
    camp_name?: string;
    block?: string;
    new_sub_block?: string;
    household_number?: string;
    shelter_number?: string;
    division?: string;
    district?: string;
    upazila?: string;
    union_pouroshova?: string;
    village?: string;
    ward_number?: string;
    post_office?: string;
    postal_code?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    country: string;
    latitude?: number;
    longitude?: number;
    is_primary: boolean;
    effective_from?: string;
    effective_to?: string;
    created_at: string;
    updated_at: string;
}

export interface PatientSearchResult {
    id: string;
    mrn: string;
    given_name: string;
    family_name: string;
    date_of_birth: string;
    age_years?: number;
    sex: string;
    origin: string;
    phone_primary?: string;
    fcn?: string;
    progress_id?: string;
    patient_status: PatientStatus;
}

export type PatientFormData = Omit<Patient, 'id' | 'mrn' | 'age_years' | 'created_at' | 'updated_at' | 'deleted_at' | 'addresses'>;
