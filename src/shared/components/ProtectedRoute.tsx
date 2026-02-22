import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/shared/stores/appStore';
import { ShieldCheck, Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { Program } from '@/shared/types';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string[];
    requiredProgram?: Program[];
}

export function ProtectedRoute({ children, requiredRole, requiredProgram }: ProtectedRouteProps) {
    const { isAuthenticated, userRole, userProgram, isLoading } = useAppStore();

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

    if (requiredProgram && userProgram && !requiredProgram.includes(userProgram)) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 bg-card p-10 rounded-2xl border shadow-xl">
                    <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="h-10 w-10 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">Program Restricted</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            This module is restricted to {requiredProgram.join(', ')} programs. Your current program is {userProgram}.
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
