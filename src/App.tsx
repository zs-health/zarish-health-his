import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/shared/components/AuthProvider';
import { Layout } from '@/shared/components/Layout';
import { LoginPage } from '@/apps/auth/LoginPage';
import { Dashboard } from '@/apps/provider-portal/pages/Dashboard';
import { PatientSearch } from '@/apps/provider-portal/pages/PatientSearch';
import { PatientRegistration } from '@/apps/provider-portal/pages/PatientRegistration';
import { PatientDetail } from '@/apps/provider-portal/pages/PatientDetail';
import { ClinicalEncounter } from '@/apps/provider-portal/pages/ClinicalEncounter';
import { NCDEnrollment } from '@/apps/provider-portal/pages/NCDEnrollment';
import { NCDFollowUp } from '@/apps/provider-portal/pages/NCDFollowUp';
import { ImportWizard } from '@/apps/admin-portal/pages/ImportWizard';
import { AdminFacilities, AdminUsers, AdminReports } from '@/apps/admin-portal/pages/AdminPages';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Auth */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Main app with Layout */}
                    <Route element={<Layout />}>
                        {/* Provider Portal */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/patients/search" element={<PatientSearch />} />
                        <Route path="/patients/register" element={<PatientRegistration />} />
                        <Route path="/patients/:id" element={<PatientDetail />} />
                        <Route path="/encounters/new" element={<ClinicalEncounter />} />
                        <Route path="/ncd/enrollment" element={<NCDEnrollment />} />
                        <Route path="/ncd/followup" element={<NCDFollowUp />} />

                        {/* Admin Portal */}
                        <Route path="/admin/facilities" element={<AdminFacilities />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/import" element={<ImportWizard />} />
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
