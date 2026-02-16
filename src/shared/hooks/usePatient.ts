import { useState, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';
import type { Patient, PatientSearchResult, PatientFormData } from '@/shared/types';

export function usePatient() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchPatients = useCallback(async (query: string): Promise<PatientSearchResult[]> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('patients')
                .select('id, mrn, given_name, family_name, date_of_birth, age_years, sex, origin, phone_primary, fcn, progress_id, patient_status')
                .or(`mrn.ilike.%${query}%,given_name.ilike.%${query}%,family_name.ilike.%${query}%,phone_primary.ilike.%${query}%,fcn.ilike.%${query}%,progress_id.ilike.%${query}%`)
                .eq('patient_status', 'active')
                .is('deleted_at', null)
                .limit(20);

            if (err) throw err;
            return (data || []) as PatientSearchResult[];
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Search failed');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getPatient = useCallback(async (id: string): Promise<Patient | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('patients')
                .select('*, addresses(*)')
                .eq('id', id)
                .single();

            if (err) throw err;
            return data as Patient;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load patient');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createPatient = useCallback(async (patientData: Partial<PatientFormData>): Promise<Patient | null> => {
        setLoading(true);
        setError(null);
        try {
            // Generate MRN if not provided - using client-side generation
            const mrn = `MRN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
            
            const { data, error: err } = await supabase
                .from('patients')
                .insert({ ...patientData, mrn } as Record<string, unknown>)
                .select()
                .single();

            if (err) throw err;
            return data as Patient;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create patient');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePatient = useCallback(async (id: string, updates: Partial<Patient>): Promise<Patient | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('patients')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (err) throw err;
            return data as Patient;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to update patient');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getRecentPatients = useCallback(async (limit = 10): Promise<PatientSearchResult[]> => {
        setLoading(true);
        try {
            const { data, error: err } = await supabase
                .from('patients')
                .select('id, mrn, given_name, family_name, date_of_birth, age_years, sex, origin, phone_primary, fcn, progress_id, patient_status')
                .eq('patient_status', 'active')
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (err) throw err;
            return (data || []) as PatientSearchResult[];
        } catch {
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        searchPatients,
        getPatient,
        createPatient,
        updatePatient,
        getRecentPatients,
    };
}
