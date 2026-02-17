import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { getUserRole } from '@/shared/lib/auth';
import { useAppStore } from '@/shared/stores/appStore';

export function useAuth() {
    const {
        user,
        userRole,
        userProgram,
        userPermissions,
        isAuthenticated,
        isLoading,
        setUser,
        setUserRole,
        setUserProgram,
        setUserPermissions,
        setIsAuthenticated,
        setIsLoading,
        logout: clearStore,
    } = useAppStore();

    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initSession = async () => {
            try {
                setIsLoading(true);
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Session error:', error);
                    setIsLoading(false);
                    return;
                }

                if (session?.user) {
                    setUser(session.user);
                    setIsAuthenticated(true);
                    
                    try {
                        const roleData = await getUserRole(session.user.id);
                        if (roleData) {
                            setUserRole(roleData.role);
                            setUserProgram(roleData.program as 'HP' | 'HO' | 'HSS' | null);
                            setUserPermissions(roleData.permissions || null);
                        } else {
                            console.warn('No role found for user');
                        }
                    } catch (roleError) {
                        console.error('Role fetch error:', roleError);
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                try {
                    if (session?.user) {
                        setUser(session.user);
                        setIsAuthenticated(true);
                        const roleData = await getUserRole(session.user.id);
                        if (roleData) {
                            setUserRole(roleData.role);
                            setUserProgram(roleData.program as 'HP' | 'HO' | 'HSS' | null);
                            setUserPermissions(roleData.permissions || null);
                        }
                    } else {
                        clearStore();
                    }
                } catch (err) {
                    console.error('Auth state change error:', err);
                } finally {
                    setIsLoading(false);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setUserRole, setUserProgram, setUserPermissions, setIsAuthenticated, setIsLoading, clearStore]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        clearStore();
    }, [clearStore]);

    return {
        user,
        userRole,
        userProgram,
        userPermissions,
        isAuthenticated,
        isLoading,
        signOut,
    };
}
