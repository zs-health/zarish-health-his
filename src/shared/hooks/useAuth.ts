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
                        let roleData = await getUserRole(session.user.id);
                        
                        // If no role exists, create a default one
                        if (!roleData) {
                            const defaultRole = 'hp_coordinator';
                            const { error: insertError } = await supabase
                                .from('user_roles')
                                .insert({
                                    user_id: session.user.id,
                                    role: defaultRole,
                                    program: 'HP',
                                    permissions: {
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
                                    },
                                    is_active: true
                                });
                            
                            if (!insertError) {
                                roleData = {
                                    role: defaultRole as any,
                                    program: 'HP',
                                    permissions: {
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
                                    }
                                };
                            }
                        }
                        
                        if (roleData) {
                            setUserRole(roleData.role);
                            setUserProgram(roleData.program as 'HP' | 'HO' | 'HSS' | null);
                            setUserPermissions(roleData.permissions || null);
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
                        
                        let roleData = await getUserRole(session.user.id);
                        
                        if (!roleData) {
                            const defaultRole = 'hp_coordinator';
                            await supabase
                                .from('user_roles')
                                .insert({
                                    user_id: session.user.id,
                                    role: defaultRole,
                                    program: 'HP',
                                    permissions: {
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
                                    },
                                    is_active: true
                                });
                            
                            roleData = {
                                role: defaultRole as any,
                                program: 'HP',
                                permissions: {
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
                                }
                            };
                        }
                        
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
