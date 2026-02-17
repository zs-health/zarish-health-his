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
    const { userRole, user } = useAppStore();

    useEffect(() => {
        if (user && userRole) {
            const targetRoute = getRouteForRole(userRole);
            if (window.location.pathname === '/') {
                window.history.replaceState(null, '', targetRoute);
            }
        }
    }, [user, userRole]);

    switch (userRole) {
        case 'hp_coordinator':
        case 'hp_doctor':
        case 'hp_nurse':
        case 'hp_pharmacist':
        case 'hp_lab_tech':
        case 'hp_registrar':
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
            return (
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            );
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
