import { useState, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';

export interface MissedAppointment {
    id: string;
    patient_id: string;
    appointment_id?: string;
    scheduled_date: string;
    scheduled_facility_id?: string;
    scheduled_program?: 'HP' | 'HO' | 'HSS';
    appointment_type?: string;
    marked_missed_at: string;
    marked_missed_by?: string;
    follow_up_attempts: number;
    last_follow_up_date?: string;
    follow_up_method?: 'Phone' | 'SMS' | 'Home Visit' | 'Community Contact';
    patient_contacted: boolean;
    patient_response?: string;
    rescheduled_date?: string;
    shared_with_ho: boolean;
    ho_follow_up_assigned: boolean;
    ho_follow_up_user_id?: string;
    ho_follow_up_completed: boolean;
    ho_follow_up_notes?: string;
    resolution_status: 'open' | 'contacted' | 'rescheduled' | 'patient_relocated' | 'patient_deceased' | 'closed';
    created_at: string;
    // Joined
    patient?: {
        given_name: string;
        family_name: string;
        phone_primary?: string;
    };
}

export function useMissedAppointments(program?: 'HP' | 'HO') {
    const [missedAppointments, setMissedAppointments] = useState<MissedAppointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMissedAppointments = useCallback(async (type: 'assigned' | 'all' = 'all') => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('coordination.missed_appointments')
                .select(`
                    *,
                    patient:patients(given_name, family_name, phone_primary)
                `)
                .order('scheduled_date', { ascending: false });

            if (type === 'assigned' && program === 'HO') {
                query = query
                    .eq('shared_with_ho', true)
                    .eq('ho_follow_up_assigned', true)
                    .eq('ho_follow_up_completed', false);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setMissedAppointments(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch missed appointments');
        } finally {
            setLoading(false);
        }
    }, [program]);

    const assignFollowUp = useCallback(async (appointmentId: string, userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { error: updateError } = await supabase
                .from('coordination.missed_appointments')
                .update({
                    ho_follow_up_assigned: true,
                    ho_follow_up_user_id: userId,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', appointmentId);

            if (updateError) throw updateError;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign follow-up');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const completeFollowUp = useCallback(async (appointmentId: string, followUpData: {
        patient_contacted: boolean;
        patient_response?: string;
        follow_up_method?: string;
        follow_up_attempts: number;
        rescheduled_date?: string;
        resolution_status: string;
        notes?: string;
    }) => {
        setLoading(true);
        setError(null);
        try {
            const { error: updateError } = await supabase
                .from('coordination.missed_appointments')
                .update({
                    patient_contacted: followUpData.patient_contacted,
                    patient_response: followUpData.patient_response,
                    follow_up_method: followUpData.follow_up_method,
                    follow_up_attempts: followUpData.follow_up_attempts + 1,
                    last_follow_up_date: new Date().toISOString(),
                    rescheduled_date: followUpData.rescheduled_date,
                    resolution_status: followUpData.resolution_status,
                    ho_follow_up_completed: followUpData.resolution_status === 'rescheduled' || followUpData.resolution_status === 'contacted',
                    ho_follow_up_notes: followUpData.notes,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', appointmentId);

            if (updateError) throw updateError;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete follow-up');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createMissedAppointment = useCallback(async (appointment: Partial<MissedAppointment>) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('coordination.missed_appointments')
                .insert(appointment)
                .select()
                .single();

            if (insertError) throw insertError;
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create missed appointment record');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        missedAppointments,
        loading,
        error,
        fetchMissedAppointments,
        assignFollowUp,
        completeFollowUp,
        createMissedAppointment,
    };
}
