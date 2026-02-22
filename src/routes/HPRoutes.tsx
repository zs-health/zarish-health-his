import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useUserProfile } from '@/shared/hooks/useUserProfile';
import { Layout } from '@/shared/components/Layout';
import { Dashboard } from '@/apps/provider-portal/pages/Dashboard';
import { PatientSearch } from '@/apps/provider-portal/pages/PatientSearch';
import { PatientRegistration } from '@/apps/provider-portal/pages/PatientRegistration';
import { PatientDetail } from '@/apps/provider-portal/pages/PatientDetail';
import { NCDScreening } from '@/apps/provider-portal/pages/NCDScreening';
import { NCDEnrollment } from '@/apps/provider-portal/pages/NCDEnrollment';
import { NCDFollowUp } from '@/apps/provider-portal/pages/NCDFollowUp';
import { EncounterFlow } from '@/apps/provider-portal/pages/EncounterFlow';
import { DispensingView } from '@/apps/provider-portal/pages/DispensingView';
import { ProfilePage } from '@/apps/provider-portal/pages/Profile';
import { InventoryManager } from '@/apps/admin-portal/pages/InventoryManager';
import { DataExport } from '@/apps/admin-portal/pages/DataExport';

function HPLayout() {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}

export function HPRoutes() {
    return (
        <Routes>
            <Route element={<HPLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/patients/search" element={<PatientSearch />} />
                <Route path="/patients/register" element={<PatientRegistration />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/encounters/new" element={<EncounterFlow />} />
                <Route path="/ncd/screening" element={<NCDScreening />} />
                <Route path="/ncd/enrollment" element={<NCDEnrollment />} />
                <Route path="/ncd/followup" element={<NCDFollowUp />} />
                <Route path="/pharmacy/dispensing" element={<DispensingView />} />
                <Route path="/pharmacy/inventory" element={<InventoryManager />} />
                <Route path="/referrals/outgoing" element={<div className="p-6">HP Outgoing Referrals - Coming Soon</div>} />
                <Route path="/referrals/incoming" element={<div className="p-6">HP Incoming Referrals - Coming Soon</div>} />
                <Route path="/referrals/create/:patientId" element={<div className="p-6">Create Referral - Coming Soon</div>} />
                <Route path="/shared-follow-ups" element={<div className="p-6">Shared Follow-ups - Coming Soon</div>} />
                <Route path="/home-visits" element={<div className="p-6">Home Visits from HO - Coming Soon</div>} />
                <Route path="/missed-appointments" element={<div className="p-6">Missed Appointments - Coming Soon</div>} />
                <Route path="/lab/orders" element={<div className="p-6">Lab Orders - Coming Soon</div>} />
                <Route path="/lab/results" element={<div className="p-6">Lab Results - Coming Soon</div>} />
                <Route path="/reports" element={<div className="p-6">HP Reports - Coming Soon</div>} />
                <Route path="/reports/export" element={<DataExport />} />
                <Route path="/import" element={<div className="p-6">Data Import - Coming Soon</div>} />
                <Route path="/settings" element={<div className="p-6">HP Settings - Coming Soon</div>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
