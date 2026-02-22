import { useEffect, type ReactNode, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAppStore } from '@/shared/stores/appStore';
import { useNavigate } from 'react-router-dom';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { isLoading, isAuthenticated, user } = useAuth();
    const { authError } = useAppStore();
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);

    // Force show login after 10 seconds of loading
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoading) {
                console.log('[AuthProvider] Forced to show login after timeout');
                setShowLogin(true);
            }
        }, 10000);
        return () => clearTimeout(timer);
    }, [isLoading]);

    useEffect(() => {
        console.log('[AuthProvider] State:', { isLoading, isAuthenticated, hasUser: !!user, authError });
    }, [isLoading, isAuthenticated, user, authError]);

    if (isLoading && !showLogin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">ZARISH HEALTH</h2>
                        <p className="text-sm text-muted-foreground mt-1">Loading...</p>
                    </div>
                    {authError && (
                        <p className="text-xs text-destructive mt-2 px-4 max-w-md">{authError}</p>
                    )}
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
