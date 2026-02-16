import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/shared/stores/appStore';
import { ShieldCheck, Lock } from 'lucide-react';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, userRole, isLoading } = useAppStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!userRole) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 bg-card p-10 rounded-2xl border shadow-xl">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck className="h-10 w-10 text-amber-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">Access Pending</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Your account is authenticated, but no access level has been assigned yet.
                        </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-[11px] font-medium text-muted-foreground leading-relaxed">
                        Please contact the system administrator (super_admin) to provision your role and facility access.
                    </div>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="text-primary font-bold text-xs uppercase tracking-widest hover:underline"
                    >
                        Sign Out
                    </button>

                    <button
                        onClick={async () => {
                            try {
                                const { supabase } = await import('@/shared/lib/supabase');
                                const { data: { session } } = await supabase.auth.getSession();
                                if (!session) {
                                    alert('No session found');
                                    return;
                                }
                                const { data, error } = await supabase.from('user_roles').select('*').eq('user_id', session.user.id);
                                alert(`Debug Info:\nUser ID: ${session.user.id}\nError: ${JSON.stringify(error)}\nData: ${JSON.stringify(data)}`);
                            } catch (e) {
                                alert(`Error: ${e}`);
                            }
                        }}
                        className="mt-4 block w-full text-center text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                        Debug Access
                    </button>
                </div>
            </div>
        );
    }

    if (requiredRole && !requiredRole.includes(userRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 bg-card p-10 rounded-2xl border shadow-xl">
                    <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="h-10 w-10 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">Unauthorized</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            You do not have the required permissions to access this clinical module.
                        </p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                        Return to Safety
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
