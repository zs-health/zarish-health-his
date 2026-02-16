import { useEffect, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { getUserRole } from '@/shared/lib/auth';
import { useAppStore } from '@/shared/stores/appStore';

export function useAuth() {
    const {
        user,
        userRole,
        isAuthenticated,
        isLoading,
        setUser,
        setUserRole,
        setIsAuthenticated,
        setIsLoading,
        logout: clearStore,
    } = useAppStore();

    useEffect(() => {
        // Get initial session
        // Get initial session
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                setIsAuthenticated(true);
                // Load role
                const roleData = await getUserRole(session.user.id);
                if (roleData) setUserRole(roleData.role);
            }
            setIsLoading(false);
        };
        initSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    setIsAuthenticated(true);
                    const roleData = await getUserRole(session.user.id);
                    if (roleData) setUserRole(roleData.role);
                } else {
                    clearStore();
                }
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [setUser, setUserRole, setIsAuthenticated, setIsLoading, clearStore]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        clearStore();
    }, [clearStore]);

    return {
        user,
        userRole,
        isAuthenticated,
        isLoading,
        signOut,
    };
}
