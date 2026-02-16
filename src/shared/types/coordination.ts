import { Program } from './auth';

export type ReferralStatus = 'pending' | 'acknowledged' | 'scheduled' | 'completed' | 'cancelled' | 'declined';
export type ReferralUrgency = 'routine' | 'urgent' | 'emergency';
export type ReferralType = 
  | 'Follow-up Required' | 'Home Visit Needed' | 'Clinic Consultation'
  | 'Lab Investigation' | 'Medication Refill' | 'Missed Appointment'
  | 'Step-down Care' | 'Step-up Care';

export interface CrossProgramReferral {
  id: string;
  patient_id: string;
  source_encounter_id?: string;
  from_program: Program;
  to_program: Program;
  from_facility_id?: string;
  to_facility_id?: string;
  referral_date: string;
  referral_reason: string;
  referral_type: ReferralType;
  urgency: ReferralUrgency;
  current_diagnosis?: string;
  current_medications?: any;
  special_instructions?: string;
  referral_status: ReferralStatus;
  acknowledged_by?: string;
  acknowledged_at?: string;
  scheduled_date?: string;
  completed_date?: string;
  completion_notes?: string;
  outcome_encounter_id?: string;
  outcome_summary?: string;
  referred_by: string;
  created_at: string;
  updated_at: string;
}

export interface HomeVisit {
  id: string;
  patient_id: string;
  visit_date: string;
  visit_time?: string;
  visit_duration_minutes?: number;
  chw_user_id: string;
  ho_facility_id?: string;
  home_address?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  visit_purpose: string[];
  vitals_taken: boolean;
  vital_signs_id?: string;
  medication_adherence?: string;
  complications_noted: boolean;
  complications_description?: string;
  patient_found: boolean;
  patient_condition?: string;
  medications_delivered?: any;
  health_education_provided?: string;
  referral_made: boolean;
  referral_id?: string;
  requires_hp_visit: boolean;
  requires_urgent_attention: boolean;
  next_home_visit_date?: string;
  shared_with_hp: boolean;
  hp_acknowledged_by?: string;
  hp_acknowledged_at?: string;
  visit_notes?: string;
  created_at: string;
  updated_at: string;
}
