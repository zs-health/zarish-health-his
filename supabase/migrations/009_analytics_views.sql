-- Priority: P1
-- Migration: Analytics Views (De-identified)

CREATE SCHEMA IF NOT EXISTS analytics;

CREATE OR REPLACE VIEW analytics.patients_deidentified AS
SELECT 
  p.id,
  p.age_years,
  p.sex,
  p.origin,
  p.nationality,
  p.marital_status,
  p.registered_program,
  p.primary_program,
  p.created_at
FROM patients p;

CREATE OR REPLACE VIEW analytics.program_performance AS
SELECT 
  registered_program,
  COUNT(id) as total_patients,
  COUNT(id) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '30 days') as new_patients_30d
FROM patients
GROUP BY registered_program;

CREATE OR REPLACE VIEW analytics.referral_stats AS
SELECT 
  from_program,
  to_program,
  referral_type,
  referral_status,
  COUNT(id) as count
FROM coordination.cross_program_referrals
GROUP BY from_program, to_program, referral_type, referral_status;
