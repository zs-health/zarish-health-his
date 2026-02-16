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
        // Get initial        // Get initial session
        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) console.error('Session error:', error);

                if (session?.user) {
                    setUser(session.user);
                    setIsAuthenticated(true);
                    // Load role with error handling
                    try {
                        const roleData = await getUserRole(session.user.id);
                        if (roleData) setUserRole(roleData.role);
                    } catch (e) {
                        console.error('Role fetch error:', e);
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setIsLoading(false);
            }
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
