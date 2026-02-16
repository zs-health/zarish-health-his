export type EncounterType =
    | 'Registration'
    | 'OPD'
    | 'Follow-up'
    | 'NCD Screening'
    | 'NCD Review'
    | 'Emergency'
    | 'Referral'
    | 'Triage'
    | 'Phone'
    | 'Home Visit';

export type EncounterStatus = 'active' | 'completed' | 'cancelled' | 'no-show';

export interface Encounter {
    id: string;
    patient_id: string;
    facility_id: string;
    provider_id?: string;
    encounter_type: EncounterType;
    visit_date: string;
    visit_number?: number;
    visit_time?: string;
    chief_complaint?: string;
    history_present_illness?: string;
    general_examination?: Record<string, unknown>;
    systemic_examination?: Record<string, unknown>;
    clinical_impression?: string;
    treatment_plan?: string;
    medications_prescribed?: MedicationPrescription[];
    investigations_ordered?: Investigation[];
    follow_up_required: boolean;
    follow_up_date?: string;
    follow_up_instructions?: string;
    referral_required: boolean;
    referral_facility_id?: string;
    referral_reason?: string;
    referral_urgency?: 'routine' | 'urgent' | 'emergency';
    encounter_status: EncounterStatus;
    provider_name?: string;
    provider_designation?: string;
    legacy_visit_id?: string;
    clinical_notes?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    // Joined
    vital_signs?: VitalSigns[];
    diagnoses?: Diagnosis[];
}

export interface MedicationPrescription {
    drug: string;
    dose: string;
    frequency: string;
    duration?: string;
    route?: string;
    instructions?: string;
}

export interface Investigation {
    name: string;
    type: string;
    priority?: 'routine' | 'urgent';
    notes?: string;
}

export type GlucoseTestType = 'FPG' | 'RPG' | '2h-PG' | 'HbA1c' | 'RBS';

export interface VitalSigns {
    id: string;
    encounter_id: string;
    patient_id: string;
    measurement_date: string;
    measurement_time?: string;
    temperature_celsius?: number;
    heart_rate_bpm?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    systolic_bp?: number;
    diastolic_bp?: number;
    bp_position?: string;
    bp_arm?: string;
    height_cm?: number;
    weight_kg?: number;
    bmi?: number;
    waist_circumference_cm?: number;
    hip_circumference_cm?: number;
    blood_glucose_mmol_l?: number;
    blood_glucose_mg_dl?: number;
    glucose_test_type?: GlucoseTestType;
    fasting_status?: boolean;
    head_circumference_cm?: number;
    mid_upper_arm_circumference_cm?: number;
    pain_score?: number;
    measured_by?: string;
    measurement_device?: string;
    hypertension_stage?: string;
    bmi_category?: string;
    diabetes_risk?: string;
    clinical_notes?: string;
    created_at: string;
}

export interface Diagnosis {
    id: string;
    encounter_id: string;
    patient_id: string;
    icd11_code: string;
    disease_name_en: string;
    disease_name_bn?: string;
    diagnosis_type?: 'primary' | 'secondary' | 'complication' | 'comorbidity';
    is_primary: boolean;
    clinical_status: 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved';
    verification_status: 'provisional' | 'differential' | 'confirmed' | 'refuted';
    severity?: 'mild' | 'moderate' | 'severe' | 'critical';
    onset_date?: string;
    resolution_date?: string;
    body_site?: string;
    laterality?: string;
    is_ncd: boolean;
    ncd_type?: string;
    diagnosed_by?: string;
    diagnosed_at?: string;
    clinical_notes?: string;
    created_at: string;
    updated_at: string;
}
