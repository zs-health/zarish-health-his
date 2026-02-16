import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/shared/components/AuthProvider';
import { Layout } from '@/shared/components/Layout';
import { LoginPage } from '@/apps/auth/LoginPage';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { Dashboard } from '@/apps/provider-portal/pages/Dashboard';
import { PatientSearch } from '@/apps/provider-portal/pages/PatientSearch';
import { PatientRegistration } from '@/apps/provider-portal/pages/PatientRegistration';
import { PatientDetail } from '@/apps/provider-portal/pages/PatientDetail';
import { NCDScreening } from '@/apps/provider-portal/pages/NCDScreening';
import { NCDEnrollment } from '@/apps/provider-portal/pages/NCDEnrollment';
import { NCDFollowUp } from '@/apps/provider-portal/pages/NCDFollowUp';
import { EncounterFlow } from '@/apps/provider-portal/pages/EncounterFlow';
import { InventoryManager } from '@/apps/admin-portal/pages/InventoryManager';
import { DispensingView } from '@/apps/provider-portal/pages/DispensingView';
import { ImportWizard } from '@/apps/admin-portal/pages/ImportWizard';
import { AdminFacilities, AdminUsers, AdminReports } from '@/apps/admin-portal/pages/AdminPages';
import { ProfilePage } from '@/apps/provider-portal/pages/Profile';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Auth */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Main app with Layout and Protection */}
                    <Route element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        {/* Provider Portal */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/patients/search" element={<PatientSearch />} />
                        <Route path="/patients/register" element={<PatientRegistration />} />
                        <Route path="/patients/:id" element={<PatientDetail />} />
                        <Route path="/encounters/new" element={<EncounterFlow />} />
                        <Route path="/ncd/screening" element={<NCDScreening />} />
                        <Route path="/ncd/enrollment" element={<NCDEnrollment />} />
                        <Route path="/ncd/followup" element={<NCDFollowUp />} />
                        <Route path="/pharmacy/dispensing" element={<DispensingView />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        {/* Admin Portal - Protected by Role */}
                        <Route path="/admin/facilities" element={
                            <ProtectedRoute requiredRole={['super_admin', 'admin']}>
                                <AdminFacilities />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/users" element={
                            <ProtectedRoute requiredRole={['super_admin', 'admin']}>
                                <AdminUsers />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/inventory" element={<InventoryManager />} />
                        <Route path="/admin/import" element={
                            <ProtectedRoute requiredRole={['super_admin', 'admin']}>
                                <ImportWizard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/reports" element={<AdminReports />} />
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
