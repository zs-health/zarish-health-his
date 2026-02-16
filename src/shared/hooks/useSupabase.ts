import { useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';

export function useSupabase() {
    const from = useCallback(
        (table: string) => supabase.from(table),
        []
    );

    const rpc = useCallback(
        (fn: string, params?: Record<string, unknown>) => supabase.rpc(fn, params),
        []
    );

    return { supabase, from, rpc };
}
