-- ============================================================
-- ZARISH HEALTH v3 — Analytics Views
-- Version: 3.0.0
-- Description: De-identified views for researchers and M&E
-- ============================================================

-- ============================================================
-- De-identified Patient View
-- ============================================================
CREATE OR REPLACE VIEW analytics.patients_deidentified AS
SELECT 
    p.id,
    p.age_years,
    p.sex,
    p.origin,
    p.marital_status,
    p.registered_program,
    p.primary_program,
    p.registration_date,
    p.patient_status,
    p.is_vulnerable,
    p.is_pregnant,
    p.blood_group,
    p.facility_id,
    NULL::TEXT AS given_name,
    NULL::TEXT AS family_name,
    NULL::TEXT AS full_name_bn,
    NULL::TEXT AS phone_primary,
    NULL::TEXT AS phone_secondary,
    NULL::TEXT AS email,
    NULL::TEXT AS national_id,
    NULL::TEXT AS fcn,
    NULL::TEXT AS progress_id,
    NULL::TEXT AS ghc_number,
    NULL::TEXT AS legacy_ncd_number,
    NULL::TEXT AS father_name,
    NULL::TEXT AS mother_name,
    NULL::TEXT AS spouse_name,
    NULL::TEXT AS emergency_contact_name,
    NULL::TEXT AS emergency_contact_phone
FROM patients p
WHERE p.deleted_at IS NULL;

-- ============================================================
-- NCD Outcomes by Program View
-- ============================================================
CREATE OR REPLACE VIEW analytics.ncd_outcomes_by_program AS
SELECT 
    ne.primary_ncd,
    p.registered_program AS program,
    COUNT(DISTINCT ne.patient_id) AS total_patients,
    COUNT(DISTINCT CASE WHEN ne.program_status = 'active' THEN ne.patient_id END) AS active_patients,
    COUNT(DISTINCT CASE WHEN ne.program_status = 'completed' THEN ne.patient_id END) AS completed_patients,
    COUNT(DISTINCT CASE WHEN ne.program_status = 'lost_to_followup' THEN ne.patient_id END) AS lost_to_followup,
    AVG(fv.current_bp_systolic) AS avg_systolic_bp,
    AVG(fv.current_bp_diastolic) AS avg_diastolic_bp,
    AVG(fv.current_blood_glucose) AS avg_blood_glucose,
    COUNT(fv.id) AS total_follow_ups,
    COUNT(CASE WHEN fv.bp_target_met = TRUE THEN 1 END)::FLOAT / NULLIF(COUNT(fv.id), 0) AS bp_control_rate,
    COUNT(CASE WHEN fv.glucose_target_met = TRUE THEN 1 END)::FLOAT / NULLIF(COUNT(fv.id), 0) AS glucose_control_rate,
    COUNT(CASE WHEN fv.bp_target_met = TRUE AND fv.glucose_target_met = TRUE THEN 1 END)::FLOAT / NULLIF(COUNT(fv.id), 0) AS combined_control_rate
FROM ncd_enrollments ne
JOIN patients p ON p.id = ne.patient_id
LEFT JOIN follow_up_visits fv ON fv.enrollment_id = ne.id
GROUP BY ne.primary_ncd, p.registered_program;

-- ============================================================
-- Program Comparison Summary View
-- ============================================================
CREATE OR REPLACE VIEW analytics.program_summary AS
SELECT 
    'HP'::TEXT AS program,
    COUNT(DISTINCT p.id)::INTEGER AS total_patients,
    COUNT(DISTINCT CASE WHEN p.patient_status = 'active' THEN p.id END)::INTEGER AS active_patients,
    COUNT(DISTINCT e.id)::INTEGER AS total_encounters,
    COUNT(DISTINCT ne.id)::INTEGER AS ncd_enrollments,
    COUNT(DISTINCT CASE WHEN ne.program_status = 'active' THEN ne.id END)::INTEGER AS active_ncd_enrollments,
    0::INTEGER AS ncd_screenings,
    0::INTEGER AS referrals_outgoing,
    0::INTEGER AS referrals_completed
FROM patients p
LEFT JOIN encounters e ON e.patient_id = p.id
LEFT JOIN ncd_enrollments ne ON ne.patient_id = p.id
WHERE p.registered_program = 'HP' OR p.registered_program IS NULL

UNION ALL

SELECT 
    'HO'::TEXT AS program,
    COUNT(DISTINCT p.id)::INTEGER AS total_patients,
    COUNT(DISTINCT CASE WHEN p.patient_status = 'active' THEN p.id END)::INTEGER AS active_patients,
    COUNT(DISTINCT e.id)::INTEGER AS total_encounters,
    COUNT(DISTINCT ne.id)::INTEGER AS ncd_enrollments,
    COUNT(DISTINCT CASE WHEN ne.program_status = 'active' THEN ne.id END)::INTEGER AS active_ncd_enrollments,
    0::INTEGER AS ncd_screenings,
    0::INTEGER AS referrals_outgoing,
    0::INTEGER AS referrals_completed
FROM patients p
LEFT JOIN encounters e ON e.patient_id = p.id
LEFT JOIN ncd_enrollments ne ON ne.patient_id = p.id
WHERE p.registered_program = 'HO';

-- ============================================================
-- Cross-Program Coordination Metrics View
-- ============================================================
CREATE OR REPLACE VIEW analytics.coordination_metrics AS
SELECT 
    CURRENT_DATE AS report_date,
    'referrals' AS metric_type,
    from_program || ' -> ' || to_program AS description,
    COUNT(*) AS count,
    COUNT(CASE WHEN referral_status = 'completed' THEN 1 END) AS completed,
    COUNT(CASE WHEN referral_status = 'pending' THEN 1 END) AS pending,
    COUNT(CASE WHEN urgency IN ('urgent', 'emergency') THEN 1 END) AS urgent
FROM coordination.cross_program_referrals
WHERE referral_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY from_program, to_program

UNION ALL

SELECT 
    CURRENT_DATE AS report_date,
    'home_visits' AS metric_type,
    'HO Home Visits' AS description,
    COUNT(*) AS count,
    COUNT(CASE WHEN patient_condition IN ('Improved', 'Stable') THEN 1 END) AS completed,
    0 AS pending,
    COUNT(CASE WHEN requires_urgent_attention = TRUE THEN 1 END) AS urgent
FROM coordination.home_visits
WHERE visit_date >= CURRENT_DATE - INTERVAL '30 days'

UNION ALL

SELECT 
    CURRENT_DATE AS report_date,
    'missed_appointments' AS metric_type,
    'HP Missed -> HO Follow-up' AS description,
    COUNT(*) AS count,
    COUNT(CASE WHEN ho_follow_up_completed = TRUE THEN 1 END) AS completed,
    COUNT(CASE WHEN resolution_status = 'open' THEN 1 END) AS pending,
    0 AS urgent
FROM coordination.missed_appointments
WHERE scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
    AND shared_with_ho = TRUE;

-- ============================================================
-- Grant Permissions on Analytics Views
-- ============================================================
GRANT SELECT ON analytics.patients_deidentified TO authenticated;
GRANT SELECT ON analytics.ncd_outcomes_by_program TO authenticated;
GRANT SELECT ON analytics.program_summary TO authenticated;
GRANT SELECT ON analytics.coordination_metrics TO authenticated;

-- ============================================================
-- Function for cross-program stats
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_cross_program_stats()
RETURNS TABLE (
    program TEXT,
    total_patients BIGINT,
    active_patients BIGINT,
    total_encounters BIGINT,
    ncd_enrollments BIGINT,
    active_ncd_enrollments BIGINT,
    referrals_outgoing BIGINT,
    referrals_incoming BIGINT,
    home_visits BIGINT,
    missed_appointments BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'HP'::TEXT AS program,
        COUNT(DISTINCT p.id)::BIGINT AS total_patients,
        COUNT(DISTINCT CASE WHEN p.patient_status = 'active' THEN p.id END)::BIGINT AS active_patients,
        COUNT(DISTINCT e.id)::BIGINT AS total_encounters,
        COUNT(DISTINCT ne.id)::BIGINT AS ncd_enrollments,
        COUNT(DISTINCT CASE WHEN ne.program_status = 'active' THEN ne.id END)::BIGINT AS active_ncd_enrollments,
        COALESCE((SELECT COUNT(*)::BIGINT FROM coordination.cross_program_referrals r WHERE r.from_program = 'HP'), 0) AS referrals_outgoing,
        COALESCE((SELECT COUNT(*)::BIGINT FROM coordination.cross_program_referrals r WHERE r.to_program = 'HP'), 0) AS referrals_incoming,
        COALESCE((SELECT COUNT(*)::BIGINT FROM coordination.home_visits hv WHERE hv.visit_date >= CURRENT_DATE - INTERVAL '30 days'), 0) AS home_visits,
        COALESCE((SELECT COUNT(*)::BIGINT FROM coordination.missed_appointments ma WHERE ma.scheduled_program = 'HP' AND ma.resolution_status = 'open'), 0) AS missed_appointments
    FROM patients p
    LEFT JOIN encounters e ON e.patient_id = p.id
    LEFT JOIN ncd_enrollments ne ON ne.patient_id = p.id
    WHERE p.registered_program = 'HP' OR p.registered_program IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_cross_program_stats() TO authenticated;
