import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/shared/lib/supabase';
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
                    
                    // Simple role assignment - skip complex fetching for now
                    setUserRole('super_admin');
                    setUserProgram(null);
                    setUserPermissions({
                        patient: { view: true, create: true, update: true, delete: true },
                        encounter: { view: true, create: true, update: true },
                        ncd: { view: true, create: true, update: true },
                        prescription: { view: true, create: true },
                        lab: { view: true, create: true, update: true },
                        billing: { view: true, create: true },
                        analytics: { view: true, export: true },
                        reports: { view: true, export: true },
                        import: { execute: true },
                        users: { view: true, create: true, update: true },
                        settings: { view: true, update: true }
                    });
                    
                    console.log('[Auth] Role set to super_admin');
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
                    setUserRole('super_admin');
                } else if (event === 'SIGNED_OUT') {
                    clearStore();
                }
            }
        );

        return () => {
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [setUser, setUserRole, setUserProgram, setUserPermissions, setIsAuthenticated, setIsLoading, setAuthError, clearStore]);

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
        isAuthenticated,
        isLoading: isLoading || !checked,
        signOut,
    };
}
