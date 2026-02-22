import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { getUserProfile } from '@/shared/lib/auth';
import { useAppStore } from '@/shared/stores/appStore';

export function useAuth() {
    const {
        user,
        userRole,
        userProgram,
        userProfile,
        userPermissions,
        isAuthenticated,
        isLoading,
        setUser,
        setUserRole,
        setUserProgram,
        setUserProfile,
        setUserPermissions,
        setIsAuthenticated,
        setIsLoading,
        setAuthError,
        logout: clearStore,
    } = useAppStore();

    const initialized = useRef(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        console.log('[Auth] Starting initialization...');

        // Fallback timeout - if auth takes too long, stop loading
        const timeoutId = setTimeout(() => {
            console.log('[Auth] Timeout reached, forcing completion');
            setIsLoading(false);
            setChecked(true);
        }, 5000);

        const initSession = async () => {
            try {
                setIsLoading(true);
                setAuthError(null);

                console.log('[Auth] Getting session...');
                const { data: { session }, error } = await supabase.auth.getSession();
                
                console.log('[Auth] Session result:', { hasSession: !!session, error: error?.message });

                if (error) {
                    console.error('[Auth] Session error:', error);
                    setAuthError(error.message);
                    setIsLoading(false);
                    setChecked(true);
                    return;
                }

                if (session?.user) {
                    console.log('[Auth] User logged in:', session.user.email);
                    setUser(session.user);
                    setIsAuthenticated(true);
                    
                    // Load profile with error handling
                    try {
                        const profile = await getUserProfile(session.user.id);
                        if (profile) {
                            setUserRole(profile.role);
                            setUserProgram(profile.program || null);
                            setUserProfile(profile);
                            setUserPermissions(profile.permissions as any);
                            console.log('[Auth] Profile loaded for:', profile.role);
                        } else {
                            // Fallback if no profile found
                            console.log('[Auth] No profile found, using defaults');
                            setUserRole('super_admin');
                            setUserProgram(null);
                        }
                    } catch (e) {
                        console.error('[Auth] Profile fetch error:', e);
                    }
                } else {
                    console.log('[Auth] No session - user not logged in');
                }
            } catch (err) {
                console.error('[Auth] Error:', err);
                setAuthError(err instanceof Error ? err.message : 'Auth failed');
            } finally {
                clearTimeout(timeoutId);
                setIsLoading(false);
                setChecked(true);
                console.log('[Auth] Initialization complete');
            }
        };

        initSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[Auth] Auth state changed:', event, !!session);
                
                if (session?.user) {
                    setUser(session.user);
                    setIsAuthenticated(true);
                    const profile = await getUserProfile(session.user.id);
                    if (profile) {
                        setUserRole(profile.role);
                        setUserProgram(profile.program || null);
                        setUserProfile(profile);
                        setUserPermissions(profile.permissions as any);
                    }
                } else if (event === 'SIGNED_OUT') {
                    clearStore();
                }
            }
        );

        return () => {
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [setUser, setUserRole, setUserProgram, setUserProfile, setUserPermissions, setIsAuthenticated, setIsLoading, setAuthError, clearStore]);

    const signOut = useCallback(async () => {
        console.log('[Auth] Signing out...');
        await supabase.auth.signOut();
        clearStore();
    }, [clearStore]);

    return {
        user,
        userRole,
        userProgram,
        userPermissions,
        userProfile,
        isAuthenticated,
        isLoading: isLoading || !checked,
        signOut,
    };
}
