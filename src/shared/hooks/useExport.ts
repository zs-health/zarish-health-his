import { useState, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useAppStore } from '@/shared/stores/appStore';

export function useExport() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { userRole } = useAppStore();

    const canExport = ['super_admin', 'admin', 'facility_manager', 'viewer', 'data_entry'].includes(userRole || '');

    const exportPatients = useCallback(async (filters?: {
        facility_id?: string;
        origin?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    }) => {
        if (!canExport) {
            setError('You do not have permission to export data');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('patients')
                .select(`
                    id, mrn, given_name, family_name, middle_name, full_name_bn,
                    date_of_birth, age_years, sex, origin, marital_status,
                    phone_primary, phone_secondary, email,
                    father_name, mother_name, spouse_name,
                    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                    national_id, fcn, progress_id, ghc_number, legacy_ncd_number,
                    blood_group, is_vulnerable, is_pregnant,
                    patient_status, registration_date,
                    created_at, updated_at,
                    addresses(camp_name, block, new_sub_block, district, upazila, village)
                `)
                .is('deleted_at', null);

            if (filters?.facility_id) {
                query = query.eq('facility_id', filters.facility_id);
            }
            if (filters?.origin) {
                query = query.eq('origin', filters.origin);
            }
            if (filters?.status) {
                query = query.eq('patient_status', filters.status);
            }
            if (filters?.date_from) {
                query = query.gte('registration_date', filters.date_from);
            }
            if (filters?.date_to) {
                query = query.lte('registration_date', filters.date_to);
            }

            const { data, error: err } = await query;

            if (err) throw err;

            // Convert to CSV
            if (data && data.length > 0) {
                const csv = convertToCSV(data);
                downloadCSV(csv, `patients_export_${new Date().toISOString().split('T')[0]}`);
                return data.length;
            }

            return 0;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Export failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, [canExport]);

    const exportEncounters = useCallback(async (filters?: {
        patient_id?: string;
        facility_id?: string;
        encounter_type?: string;
        date_from?: string;
        date_to?: string;
    }) => {
        if (!canExport) {
            setError('You do not have permission to export data');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('encounters')
                .select(`
                    id, patient_id, encounter_type, visit_date, visit_time,
                    chief_complaint, history_present_illness, clinical_impression,
                    treatment_plan, follow_up_required, follow_up_date,
                    referral_required, referral_reason, referral_urgency,
                    encounter_status, provider_name, clinical_notes,
                    created_at,
                    patients(mrn, given_name, family_name),
                    facilities(facility_name)
                `);

            if (filters?.patient_id) {
                query = query.eq('patient_id', filters.patient_id);
            }
            if (filters?.facility_id) {
                query = query.eq('facility_id', filters.facility_id);
            }
            if (filters?.encounter_type) {
                query = query.eq('encounter_type', filters.encounter_type);
            }
            if (filters?.date_from) {
                query = query.gte('visit_date', filters.date_from);
            }
            if (filters?.date_to) {
                query = query.lte('visit_date', filters.date_to);
            }

            const { data, error: err } = await query;

            if (err) throw err;

            if (data && data.length > 0) {
                const csv = convertEncountersToCSV(data);
                downloadCSV(csv, `encounters_export_${new Date().toISOString().split('T')[0]}`);
                return data.length;
            }

            return 0;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Export failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, [canExport]);

    const exportNCDEnrollments = useCallback(async (filters?: {
        facility_id?: string;
        ncd_type?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    }) => {
        if (!canExport) {
            setError('You do not have permission to export data');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('ncd_enrollments')
                .select(`
                    id, patient_id, ncd_type, primary_ncd, enrollment_date,
                    enrollment_source, program_status,
                    initial_bp_systolic, initial_bp_diastolic,
                    initial_blood_glucose, initial_hba1c,
                    tobacco_use, alcohol_use,
                    family_history_cvd, family_history_diabetes,
                    created_at,
                    patients(mrn, given_name, family_name, date_of_birth, sex, origin),
                    facilities(facility_name)
                `);

            if (filters?.facility_id) {
                query = query.eq('facility_id', filters.facility_id);
            }
            if (filters?.ncd_type) {
                query = query.contains('ncd_type', [filters.ncd_type]);
            }
            if (filters?.status) {
                query = query.eq('program_status', filters.status);
            }
            if (filters?.date_from) {
                query = query.gte('enrollment_date', filters.date_from);
            }
            if (filters?.date_to) {
                query = query.lte('enrollment_date', filters.date_to);
            }

            const { data, error: err } = await query;

            if (err) throw err;

            if (data && data.length > 0) {
                const csv = convertNCDToCSV(data);
                downloadCSV(csv, `ncd_enrollments_export_${new Date().toISOString().split('T')[0]}`);
                return data.length;
            }

            return 0;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Export failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, [canExport]);

    const exportVitalSigns = useCallback(async (filters?: {
        patient_id?: string;
        date_from?: string;
        date_to?: string;
    }) => {
        if (!canExport) {
            setError('You do not have permission to export data');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('vital_signs')
                .select(`
                    id, patient_id, measurement_date, measurement_time,
                    systolic_bp, diastolic_bp, heart_rate_bpm,
                    temperature_celsius, respiratory_rate, oxygen_saturation,
                    height_cm, weight_kg, bmi,
                    blood_glucose_mmol_l, glucose_test_type, fasting_status,
                    pain_score, clinical_notes, created_at,
                    patients(mrn, given_name, family_name)
                `);

            if (filters?.patient_id) {
                query = query.eq('patient_id', filters.patient_id);
            }
            if (filters?.date_from) {
                query = query.gte('measurement_date', filters.date_from);
            }
            if (filters?.date_to) {
                query = query.lte('measurement_date', filters.date_to);
            }

            const { data, error: err } = await query;

            if (err) throw err;

            if (data && data.length > 0) {
                const csv = convertVitalsToCSV(data);
                downloadCSV(csv, `vital_signs_export_${new Date().toISOString().split('T')[0]}`);
                return data.length;
            }

            return 0;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Export failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, [canExport]);

    const exportFollowUps = useCallback(async (filters?: {
        patient_id?: string;
        date_from?: string;
        date_to?: string;
    }) => {
        if (!canExport) {
            setError('You do not have permission to export data');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('follow_up_visits')
                .select(`
                    id, patient_id, visit_date, visit_type,
                    medication_adherence, missed_doses_last_week,
                    side_effects_reported, side_effects_description,
                    current_bp_systolic, current_bp_diastolic,
                    current_blood_glucose, current_hba1c,
                    bp_target_met, glucose_target_met,
                    treatment_modified, treatment_modification_reason,
                    next_visit_scheduled, clinical_notes, created_at,
                    patients(mrn, given_name, family_name)
                `);

            if (filters?.patient_id) {
                query = query.eq('patient_id', filters.patient_id);
            }
            if (filters?.date_from) {
                query = query.gte('visit_date', filters.date_from);
            }
            if (filters?.date_to) {
                query = query.lte('visit_date', filters.date_to);
            }

            const { data, error: err } = await query;

            if (err) throw err;

            if (data && data.length > 0) {
                const csv = convertFollowUpsToCSV(data);
                downloadCSV(csv, `follow_ups_export_${new Date().toISOString().split('T')[0]}`);
                return data.length;
            }

            return 0;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Export failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, [canExport]);

    const exportResearchData = useCallback(async () => {
        if (!canExport) {
            setError('You do not have permission to export research data');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            // Get all patients with full data
            const { data: patients, error: pErr } = await supabase
                .from('patients')
                .select('*')
                .is('deleted_at', null);

            if (pErr) throw pErr;

            // Get all encounters
            const { data: encounters, error: eErr } = await supabase
                .from('encounters')
                .select('*');

            if (eErr) throw eErr;

            // Get all NCD enrollments
            const { data: ncdEnrollments, error: ncdErr } = await supabase
                .from('ncd_enrollments')
                .select('*');

            if (ncdErr) throw ncdErr;

            // Get all vital signs
            const { data: vitals, error: vErr } = await supabase
                .from('vital_signs')
                .select('*');

            if (vErr) throw vErr;

            // Get all follow-ups
            const { data: followUps, error: fErr } = await supabase
                .from('follow_up_visits')
                .select('*');

            if (fErr) throw fErr;

            // Create comprehensive research export
            const researchData = {
                export_date: new Date().toISOString(),
                total_patients: patients?.length || 0,
                total_encounters: encounters?.length || 0,
                total_ncd_enrollments: ncdEnrollments?.length || 0,
                total_vital_records: vitals?.length || 0,
                total_follow_ups: followUps?.length || 0,
                patients: patients,
                encounters: encounters,
                ncd_enrollments: ncdEnrollments,
                vital_signs: vitals,
                follow_up_visits: followUps
            };

            // Download as JSON for research
            const blob = new Blob([JSON.stringify(researchData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `research_data_export_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            return patients?.length || 0;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Export failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, [canExport]);

    return {
        loading,
        error,
        canExport,
        exportPatients,
        exportEncounters,
        exportNCDEnrollments,
        exportVitalSigns,
        exportFollowUps,
        exportResearchData
    };
}

function convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]).filter(k => k !== 'addresses');
    const rows = data.map(row => {
        return headers.map(h => {
            let val = row[h];
            if (typeof val === 'object') val = JSON.stringify(val);
            if (val === null || val === undefined) val = '';
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

function convertEncountersToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = [
        'id', 'patient_id', 'mrn', 'patient_name', 'encounter_type', 'visit_date',
        'chief_complaint', 'clinical_impression', 'treatment_plan',
        'follow_up_required', 'follow_up_date', 'referral_required',
        'encounter_status', 'provider_name', 'facility_name'
    ];

    const rows = data.map(row => {
        return [
            row.id,
            row.patient_id,
            row.patients?.mrn || '',
            `${row.patients?.given_name || ''} ${row.patients?.family_name || ''}`,
            row.encounter_type,
            row.visit_date,
            row.chief_complaint || '',
            row.clinical_impression || '',
            row.treatment_plan || '',
            row.follow_up_required,
            row.follow_up_date || '',
            row.referral_required,
            row.encounter_status,
            row.provider_name || '',
            row.facilities?.facility_name || ''
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

function convertNCDToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = [
        'id', 'patient_id', 'mrn', 'patient_name', 'age', 'sex', 'origin',
        'ncd_type', 'primary_ncd', 'enrollment_date', 'enrollment_source',
        'program_status', 'initial_bp', 'initial_glucose', 'tobacco_use',
        'family_history_cvd', 'family_history_diabetes', 'facility_name'
    ];

    const rows = data.map(row => {
        return [
            row.id,
            row.patient_id,
            row.patients?.mrn || '',
            `${row.patients?.given_name || ''} ${row.patients?.family_name || ''}`,
            row.patients?.date_of_birth ? calculateAge(row.patients.date_of_birth) : '',
            row.patients?.sex || '',
            row.patients?.origin || '',
            (row.ncd_type || []).join('; '),
            row.primary_ncd || '',
            row.enrollment_date || '',
            row.enrollment_source || '',
            row.program_status || '',
            row.initial_bp_systolic && row.initial_bp_diastolic ?
                `${row.initial_bp_systolic}/${row.initial_bp_diastolic}` : '',
            row.initial_blood_glucose || '',
            row.tobacco_use,
            row.family_history_cvd,
            row.family_history_diabetes,
            row.facilities?.facility_name || ''
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

function convertVitalsToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = [
        'id', 'patient_id', 'mrn', 'patient_name', 'measurement_date',
        'systolic_bp', 'diastolic_bp', 'heart_rate', 'temperature',
        'respiratory_rate', 'oxygen_saturation', 'height_cm', 'weight_kg', 'bmi',
        'blood_glucose', 'glucose_test_type', 'pain_score'
    ];

    const rows = data.map(row => {
        return [
            row.id,
            row.patient_id,
            row.patients?.mrn || '',
            `${row.patients?.given_name || ''} ${row.patients?.family_name || ''}`,
            row.measurement_date || '',
            row.systolic_bp || '',
            row.diastolic_bp || '',
            row.heart_rate_bpm || '',
            row.temperature_celsius || '',
            row.respiratory_rate || '',
            row.oxygen_saturation || '',
            row.height_cm || '',
            row.weight_kg || '',
            row.bmi || '',
            row.blood_glucose_mmol_l || '',
            row.glucose_test_type || '',
            row.pain_score || ''
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

function convertFollowUpsToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = [
        'id', 'patient_id', 'mrn', 'patient_name', 'visit_date', 'visit_type',
        'medication_adherence', 'missed_doses', 'side_effects',
        'current_bp', 'current_glucose', 'bp_target_met', 'glucose_target_met',
        'treatment_modified', 'next_visit', 'clinical_notes'
    ];

    const rows = data.map(row => {
        return [
            row.id,
            row.patient_id,
            row.patients?.mrn || '',
            `${row.patients?.given_name || ''} ${row.patients?.family_name || ''}`,
            row.visit_date || '',
            row.visit_type || '',
            row.medication_adherence || '',
            row.missed_doses_last_week || '',
            row.side_effects_reported ? 'Yes' : 'No',
            row.current_bp_systolic && row.current_bp_diastolic ?
                `${row.current_bp_systolic}/${row.current_bp_diastolic}` : '',
            row.current_blood_glucose || '',
            row.bp_target_met ? 'Yes' : 'No',
            row.glucose_target_met ? 'Yes' : 'No',
            row.treatment_modified ? 'Yes' : 'No',
            row.next_visit_scheduled || '',
            row.clinical_notes || ''
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

function calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
