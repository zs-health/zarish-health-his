import { Navigate, useLocation } from 'react-router-dom';
import { useUserProfile, getRouteForRole } from '@/shared/hooks/useUserProfile';

interface RoleRouterProps {
    children: React.ReactNode;
}

export function RoleRouter({ children }: RoleRouterProps) {
    const { role } = useUserProfile();
    const location = useLocation();

    if (!role) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const expectedRoute = getRouteForRole(role);
    
    if (location.pathname === '/' || location.pathname === '/login') {
        return <Navigate to={expectedRoute} replace />;
    }

    return <>{children}</>;
}

export function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
    const { role } = useUserProfile();
    
    if (!role || !roles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }
    
    return <>{children}</>;
}
