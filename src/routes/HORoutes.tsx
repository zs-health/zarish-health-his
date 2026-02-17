import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { PatientSearch } from '@/apps/provider-portal/pages/PatientSearch';
import { PatientRegistration } from '@/apps/provider-portal/pages/PatientRegistration';
import { PatientDetail } from '@/apps/provider-portal/pages/PatientDetail';
import { NCDScreening } from '@/apps/provider-portal/pages/NCDScreening';
import { NCDFollowUp } from '@/apps/provider-portal/pages/NCDFollowUp';
import { ProfilePage } from '@/apps/provider-portal/pages/Profile';
import { DataExport } from '@/apps/admin-portal/pages/DataExport';

function HOLayout() {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}

export function HORoutes() {
    return (
        <Routes>
            <Route element={<HOLayout />}>
                <Route path="/" element={
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold">Health Outreach Dashboard</h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Today's Home Visits</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Pending Follow-ups</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Community Screenings</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                        </div>
                    </div>
                } />
                <Route path="/patients/search" element={<PatientSearch />} />
                <Route path="/patients/register" element={<PatientRegistration />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/screening" element={<NCDScreening />} />
                <Route path="/screening/session" element={<div className="p-6">Screening Session - Coming Soon</div>} />
                <Route path="/screening/results" element={<div className="p-6">Screening Results - Coming Soon</div>} />
                <Route path="/home-visits" element={<div className="p-6">Home Visits - Coming Soon</div>} />
                <Route path="/home-visits/schedule" element={<div className="p-6">Schedule Home Visit - Coming Soon</div>} />
                <Route path="/home-visits/conduct/:patientId" element={<div className="p-6">Conduct Home Visit - Coming Soon</div>} />
                <Route path="/referrals/to-hp" element={<div className="p-6">Referrals to HP - Coming Soon</div>} />
                <Route path="/referrals/create/:patientId" element={<div className="p-6">Create Referral - Coming Soon</div>} />
                <Route path="/follow-ups" element={<div className="p-6">Shared Follow-ups - Coming Soon</div>} />
                <Route path="/follow-ups/complete/:id" element={<div className="p-6">Complete Follow-up - Coming Soon</div>} />
                <Route path="/missed-appointments" element={<div className="p-6">Missed Appointment Follow-ups - Coming Soon</div>} />
                <Route path="/missed-appointments/:id/follow-up" element={<div className="p-6">Follow-up Missed Appointment - Coming Soon</div>} />
                <Route path="/ncd" element={<NCDScreening />} />
                <Route path="/ncd/screening" element={<NCDScreening />} />
                <Route path="/ncd/follow-up/:enrollmentId" element={<NCDFollowUp />} />
                <Route path="/education" element={<div className="p-6">Health Education - Coming Soon</div>} />
                <Route path="/education/conduct" element={<div className="p-6">Conduct Education Session - Coming Soon</div>} />
                <Route path="/reports" element={<div className="p-6">HO Reports - Coming Soon</div>} />
                <Route path="/reports/export" element={<DataExport />} />
                <Route path="/import" element={<div className="p-6">Data Import - Coming Soon</div>} />
                <Route path="/settings" element={<div className="p-6">HO Settings - Coming Soon</div>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
