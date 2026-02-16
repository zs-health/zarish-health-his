import { useState, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';
import type { NCDEnrollment, TreatmentProtocol, FollowUpVisit, CVDRiskAssessment } from '@/shared/types';

export function useNCD() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getEnrollments = useCallback(async (patientId: string): Promise<NCDEnrollment[]> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('ncd_enrollments')
                .select('*, treatment_protocols(*), follow_up_visits(*)')
                .eq('patient_id', patientId)
                .order('enrollment_date', { ascending: false });

            if (err) throw err;
            return (data || []) as NCDEnrollment[];
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load enrollments');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createEnrollment = useCallback(async (enrollmentData: Partial<NCDEnrollment>): Promise<NCDEnrollment | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('ncd_enrollments')
                .insert(enrollmentData)
                .select()
                .single();

            if (err) throw err;
            return data as NCDEnrollment;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create enrollment');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createProtocol = useCallback(async (protocolData: Partial<TreatmentProtocol>): Promise<TreatmentProtocol | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('treatment_protocols')
                .insert(protocolData)
                .select()
                .single();

            if (err) throw err;
            return data as TreatmentProtocol;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create protocol');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createFollowUp = useCallback(async (followUpData: Partial<FollowUpVisit>): Promise<FollowUpVisit | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('follow_up_visits')
                .insert(followUpData)
                .select()
                .single();

            if (err) throw err;
            return data as FollowUpVisit;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create follow-up');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createCVDAssessment = useCallback(async (assessmentData: Partial<CVDRiskAssessment>): Promise<CVDRiskAssessment | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('cvd_risk_assessments')
                .insert(assessmentData)
                .select()
                .single();

            if (err) throw err;
            return data as CVDRiskAssessment;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create assessment');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getUpcomingFollowUps = useCallback(async (facilityId?: string, days = 7): Promise<FollowUpVisit[]> => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const futureDate = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

            let query = supabase
                .from('follow_up_visits')
                .select('*')
                .gte('next_visit_scheduled', today)
                .lte('next_visit_scheduled', futureDate)
                .order('next_visit_scheduled', { ascending: true });

            if (facilityId) {
                query = query.eq('facility_id', facilityId);
            }

            const { data, error: err } = await query;
            if (err) throw err;
            return (data || []) as FollowUpVisit[];
        } catch {
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getEnrollments,
        createEnrollment,
        createProtocol,
        createFollowUp,
        createCVDAssessment,
        getUpcomingFollowUps,
    };
}
