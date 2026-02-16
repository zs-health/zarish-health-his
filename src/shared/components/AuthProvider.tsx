import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { isLoading } = useAuth();

    useEffect(() => {
        // Auth initialization happens in useAuth hook
    }, []);

    if (isLoading) {
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
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
