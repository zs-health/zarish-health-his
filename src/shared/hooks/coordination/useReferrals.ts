import { useState, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';

export interface Referral {
    id: string;
    patient_id: string;
    source_encounter_id?: string;
    from_program: 'HP' | 'HO' | 'HSS';
    to_program: 'HP' | 'HO' | 'HSS';
    from_facility_id?: string;
    to_facility_id?: string;
    referral_date: string;
    referral_reason: string;
    referral_type: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    current_diagnosis?: string;
    current_medications?: Record<string, unknown>[];
    special_instructions?: string;
    referral_status: 'pending' | 'acknowledged' | 'scheduled' | 'completed' | 'cancelled' | 'declined';
    acknowledged_by?: string;
    acknowledged_at?: string;
    scheduled_date?: string;
    completed_date?: string;
    completion_notes?: string;
    outcome_encounter_id?: string;
    outcome_summary?: string;
    referred_by: string;
    created_at: string;
    // Joined
    patient?: {
        given_name: string;
        family_name: string;
        phone_primary?: string;
    };
}

export function useReferrals(program?: 'HP' | 'HO' | 'HSS') {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReferrals = useCallback(async (type: 'incoming' | 'outgoing') => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('coordination.cross_program_referrals')
                .select(`
                    *,
                    patient:patients(given_name, family_name, phone_primary)
                `)
                .order('referral_date', { ascending: false });

            if (program) {
                if (type === 'outgoing') {
                    query = query.eq('from_program', program);
                } else {
                    query = query.eq('to_program', program);
                }
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setReferrals(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch referrals');
        } finally {
            setLoading(false);
        }
    }, [program]);

    const createReferral = useCallback(async (referral: Partial<Referral>) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('coordination.cross_program_referrals')
                .insert(referral)
                .select()
                .single();

            if (insertError) throw insertError;
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create referral');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateReferralStatus = useCallback(async (id: string, status: Partial<Referral>) => {
        setLoading(true);
        setError(null);
        try {
            const { error: updateError } = await supabase
                .from('coordination.cross_program_referrals')
                .update({ ...status, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) throw updateError;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update referral');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        referrals,
        loading,
        error,
        fetchReferrals,
        createReferral,
        updateReferralStatus,
    };
}

export function useOutgoingReferrals(program: 'HP' | 'HO' | 'HSS') {
    return useReferrals(program);
}

export function useIncomingReferrals(program: 'HP' | 'HO' | 'HSS') {
    return useReferrals(program);
}
