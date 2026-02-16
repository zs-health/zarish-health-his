import { useEffect, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { getUserProfile } from '@/shared/lib/auth';
import { useAppStore } from '@/shared/stores/appStore';

export function useAuth() {
    const {
        user,
        userRole,
        userProgram,
        userProfile,
        isAuthenticated,
        isLoading,
        setUser,
        setUserRole,
        setUserProgram,
        setUserProfile,
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
                    // Load profile with error handling
                    try {
                        const profile = await getUserProfile(session.user.id);
                        if (profile) {
                            setUserRole(profile.role);
                            setUserProgram(profile.program || null);
                            setUserProfile(profile);
                        }
                    } catch (e) {
                        console.error('Profile fetch error:', e);
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
                    const profile = await getUserProfile(session.user.id);
                    if (profile) {
                        setUserRole(profile.role);
                        setUserProgram(profile.program || null);
                        setUserProfile(profile);
                    }
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
