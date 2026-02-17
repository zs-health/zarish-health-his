import { useState, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';

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
    visit_purpose?: string[];
    vitals_taken: boolean;
    vital_signs_id?: string;
    medication_adherence?: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Not Assessed';
    complications_noted: boolean;
    complications_description?: string;
    patient_found: boolean;
    patient_condition?: 'Stable' | 'Improved' | 'Worsened' | 'Emergency';
    medications_delivered?: Record<string, unknown>[];
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
    // Joined
    patient?: {
        given_name: string;
        family_name: string;
        phone_primary?: string;
    };
    chw?: {
        full_name: string;
    };
}

export function useHomeVisits() {
    const [homeVisits, setHomeVisits] = useState<HomeVisit[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHomeVisits = useCallback(async (options?: {
        userId?: string;
        date?: string;
        program?: 'HP' | 'HO';
    }) => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('coordination.home_visits')
                .select(`
                    *,
                    patient:patients(given_name, family_name, phone_primary),
                    chw:user_roles!chw_user_id(full_name)
                `)
                .order('visit_date', { ascending: false });

            if (options?.userId) {
                query = query.eq('chw_user_id', options.userId);
            }

            if (options?.date) {
                query = query.eq('visit_date', options.date);
            }

            if (options?.program === 'HP') {
                query = query.eq('shared_with_hp', true);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setHomeVisits(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch home visits');
        } finally {
            setLoading(false);
        }
    }, []);

    const createHomeVisit = useCallback(async (visit: Partial<HomeVisit>) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('coordination.home_visits')
                .insert(visit)
                .select()
                .single();

            if (insertError) throw insertError;
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create home visit');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateHomeVisit = useCallback(async (id: string, visit: Partial<HomeVisit>) => {
        setLoading(true);
        setError(null);
        try {
            const { error: updateError } = await supabase
                .from('coordination.home_visits')
                .update({ ...visit, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) throw updateError;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update home visit');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const acknowledgeHomeVisit = useCallback(async (id: string, userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { error: updateError } = await supabase
                .from('coordination.home_visits')
                .update({
                    hp_acknowledged_by: userId,
                    hp_acknowledged_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to acknowledge home visit');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        homeVisits,
        loading,
        error,
        fetchHomeVisits,
        createHomeVisit,
        updateHomeVisit,
        acknowledgeHomeVisit,
    };
}
