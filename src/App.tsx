import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/shared/components/AuthProvider';
import { LoginPage } from '@/apps/auth/LoginPage';
import { getRouteForRole } from '@/shared/hooks/useUserProfile';
import { useAppStore } from '@/shared/stores/appStore';
import { useEffect } from 'react';
import { HPRoutes } from './routes/HPRoutes';
import { HORoutes } from './routes/HORoutes';
import { HSSRoutes } from './routes/HSSRoutes';
import { ManagementRoutes } from './routes/ManagementRoutes';
import { ResearcherRoutes } from './routes/ResearcherRoutes';
import { MERoutes } from './routes/MERoutes';
import { DonorRoutes } from './routes/DonorRoutes';

function AuthenticatedRoutes() {
    const { userRole, user, isLoading } = useAppStore();

    useEffect(() => {
        if (user && userRole) {
            const targetRoute = getRouteForRole(userRole);
            if (window.location.pathname === '/' || window.location.pathname === '/login') {
                window.history.replaceState(null, '', targetRoute);
            }
        }
    }, [user, userRole]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If no user, go to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user exists but no role yet, use default HP dashboard
    if (!userRole) {
        return <HPRoutes />;
    }

    switch (userRole) {
        case 'super_admin':
        case 'admin':
        case 'hp_coordinator':
        case 'hp_doctor':
        case 'hp_nurse':
        case 'hp_pharmacist':
        case 'hp_lab_tech':
        case 'hp_registrar':
        case 'facility_manager':
        case 'provider':
        case 'chw':
        case 'data_entry':
        case 'viewer':
            return <HPRoutes />;
        case 'ho_coordinator':
        case 'ho_chw':
        case 'ho_nurse':
        case 'ho_educator':
            return <HORoutes />;
        case 'hss_coordinator':
        case 'hss_trainer':
        case 'hss_quality_officer':
        case 'hss_data_officer':
            return <HSSRoutes />;
        case 'management':
            return <ManagementRoutes />;
        case 'researcher':
            return <ResearcherRoutes />;
        case 'me_officer':
            return <MERoutes />;
        case 'donor':
            return <DonorRoutes />;
        default:
            return <HPRoutes />;
    }
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<AuthenticatedRoutes />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
