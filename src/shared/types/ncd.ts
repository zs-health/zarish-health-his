export type NCDType = 'Hypertension' | 'Type 2 Diabetes' | 'CVD' | 'COPD' | 'Asthma' | 'CKD';

export type EnrollmentSource =
    | 'Community Screening'
    | 'OPD Diagnosis'
    | 'Referral'
    | 'Self-Referral'
    | 'Legacy Import';

export type ProgramStatus = 'active' | 'completed' | 'transferred' | 'deceased' | 'lost_to_follow_up' | 'withdrawn';

export interface NCDEnrollment {
    id: string;
    patient_id: string;
    enrollment_date: string;
    enrollment_facility_id: string;
    enrolled_by?: string;
    ncd_type: string[];
    primary_ncd: NCDType;
    enrollment_source?: EnrollmentSource;
    screening_visit_id?: string;
    initial_cvd_risk_score?: number;
    initial_cvd_risk_category?: string;
    initial_bp_systolic?: number;
    initial_bp_diastolic?: number;
    initial_blood_glucose?: number;
    initial_hba1c?: number;
    tobacco_use: boolean;
    tobacco_type?: string;
    tobacco_quantity_per_day?: number;
    tobacco_quit_date?: string;
    alcohol_use: boolean;
    alcohol_units_per_week?: number;
    physical_activity_minutes_per_week?: number;
    family_history_cvd: boolean;
    family_history_diabetes: boolean;
    family_history_details?: string;
    has_ckd: boolean;
    has_copd: boolean;
    has_asthma: boolean;
    other_comorbidities?: string[];
    has_retinopathy: boolean;
    has_neuropathy: boolean;
    has_nephropathy: boolean;
    has_foot_complications: boolean;
    complications_notes?: string;
    program_status: ProgramStatus;
    discharge_date?: string;
    discharge_reason?: string;
    legacy_enrollment_id?: string;
    created_at: string;
    updated_at: string;
    // Joined
    treatment_protocols?: TreatmentProtocol[];
    follow_up_visits?: FollowUpVisit[];
}

export type ProtocolType =
    | 'Hypertension Protocol I'
    | 'Hypertension Protocol II'
    | 'Diabetes Protocol'
    | 'Integrated CVD Risk';

export type ProtocolStatus = 'active' | 'escalated' | 'target_met' | 'referred' | 'discontinued';

export interface TreatmentProtocol {
    id: string;
    patient_id: string;
    enrollment_id: string;
    protocol_type: ProtocolType;
    start_date: string;
    end_date?: string;
    bp_target_systolic?: number;
    bp_target_diastolic?: number;
    glucose_target_fpg?: number;
    glucose_target_hba1c?: number;
    current_medications?: MedicationEntry[];
    medication_history?: MedicationHistoryEntry[];
    dietary_plan?: string;
    exercise_plan?: string;
    weight_loss_goal_kg?: number;
    next_review_date?: string;
    review_interval_weeks: number;
    protocol_status: ProtocolStatus;
    escalation_step: number;
    prescribing_provider_id?: string;
    prescribing_facility_id?: string;
    clinical_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface MedicationEntry {
    drug: string;
    dose: string;
    frequency: string;
}

export interface MedicationHistoryEntry {
    date: string;
    action: string;
    drug: string;
    from?: string;
    to?: string;
}

export type CVDRiskCategory = '<10%' | '10-20%' | '20-30%' | '≥30%';

export interface CVDRiskAssessment {
    id: string;
    patient_id: string;
    enrollment_id?: string;
    encounter_id?: string;
    assessment_date: string;
    assessed_by?: string;
    chest_pain?: boolean;
    breathlessness?: boolean;
    irregular_heartbeat?: boolean;
    headache_dizziness?: boolean;
    difficulty_talking?: boolean;
    weakness_numbness?: boolean;
    swelling_feet_legs?: boolean;
    increased_thirst_urination?: boolean;
    unexplained_weight_loss?: boolean;
    tobacco_current?: boolean;
    tobacco_type?: string;
    tobacco_years?: number;
    alcohol_current?: boolean;
    alcohol_units_per_day?: number;
    physical_activity_minutes_week?: number;
    salt_intake?: 'low' | 'moderate' | 'high';
    fruit_vegetable_servings_day?: number;
    family_history_premature_cvd?: boolean;
    family_history_diabetes?: boolean;
    height_cm?: number;
    weight_kg?: number;
    bmi?: number;
    waist_circumference_cm?: number;
    systolic_bp?: number;
    diastolic_bp?: number;
    pulse_rate?: number;
    pulse_rhythm?: string;
    total_cholesterol_mmol_l?: number;
    hdl_cholesterol_mmol_l?: number;
    ldl_cholesterol_mmol_l?: number;
    triglycerides_mmol_l?: number;
    fasting_glucose_mmol_l?: number;
    hba1c_percent?: number;
    urine_protein?: string;
    urine_ketones?: string;
    serum_creatinine_umol_l?: number;
    egfr?: number;
    cvd_risk_10year_percent?: number;
    cvd_risk_category?: CVDRiskCategory;
    risk_chart_used?: string;
    urgent_referral_required: boolean;
    referral_reasons?: string[];
    referral_facility_id?: string;
    assessment_summary?: string;
    created_at: string;
}

export type MedicationAdherence = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface FollowUpVisit {
    id: string;
    patient_id: string;
    enrollment_id: string;
    encounter_id: string;
    visit_date: string;
    visit_type?: 'Scheduled Follow-up' | 'Unscheduled' | 'Phone Consultation' | 'Home Visit';
    medication_adherence?: MedicationAdherence;
    missed_doses_last_week?: number;
    side_effects_reported: boolean;
    side_effects_description?: string;
    diet_adherence?: string;
    exercise_adherence?: string;
    tobacco_cessation_progress?: string;
    current_bp_systolic?: number;
    current_bp_diastolic?: number;
    current_weight_kg?: number;
    current_blood_glucose?: number;
    current_hba1c?: number;
    bp_target_met: boolean;
    glucose_target_met: boolean;
    weight_target_met: boolean;
    complications_assessed: boolean;
    new_complications_detected: boolean;
    complications_notes?: string;
    treatment_modified: boolean;
    treatment_modification_reason?: string;
    new_medications?: MedicationEntry[];
    discontinued_medications?: MedicationEntry[];
    next_visit_scheduled?: string;
    next_visit_reason?: string;
    provider_id?: string;
    facility_id?: string;
    clinical_notes?: string;
    created_at: string;
}
