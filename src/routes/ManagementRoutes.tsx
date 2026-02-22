import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { PatientSearch } from '@/apps/provider-portal/pages/PatientSearch';
import { PatientDetail } from '@/apps/provider-portal/pages/PatientDetail';
import { ProfilePage } from '@/apps/provider-portal/pages/Profile';
import { AdminUsers, AdminFacilities, AdminReports } from '@/apps/admin-portal/pages/AdminPages';
import { DataExport } from '@/apps/admin-portal/pages/DataExport';

function ManagementLayout() {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}

export function ManagementRoutes() {
    return (
        <Routes>
            <Route element={<ManagementLayout />}>
                <Route path="/" element={
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold">Management Dashboard - All Programs</h1>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">HP Patients</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">HO Patients</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Active Referrals</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">NCD Enrollments</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                        </div>
                        <div className="bg-card p-6 rounded-lg border">
                            <h3 className="font-semibold mb-4">Program Comparison</h3>
                            <p className="text-muted-foreground">Cross-program analytics coming soon</p>
                        </div>
                    </div>
                } />
                <Route path="/comparison" element={<div className="p-6">Program Comparison - Coming Soon</div>} />
                <Route path="/comparison/hp-vs-ho" element={<div className="p-6">HP vs HO Analysis - Coming Soon</div>} />
                <Route path="/comparison/ncd-outcomes" element={<div className="p-6">NCD Outcomes - Coming Soon</div>} />
                <Route path="/patients" element={<PatientSearch />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/coordination/referrals" element={<div className="p-6">All Referrals - Coming Soon</div>} />
                <Route path="/coordination/follow-ups" element={<div className="p-6">All Follow-ups - Coming Soon</div>} />
                <Route path="/coordination/home-visits" element={<div className="p-6">All Home Visits - Coming Soon</div>} />
                <Route path="/coordination/missed-appointments" element={<div className="p-6">All Missed Appointments - Coming Soon</div>} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/users/create" element={<div className="p-6">Create User - Coming Soon</div>} />
                <Route path="/users/roles" element={<div className="p-6">Role Management - Coming Soon</div>} />
                <Route path="/facilities" element={<AdminFacilities />} />
                <Route path="/analytics" element={<div className="p-6">Analytics Dashboard - Coming Soon</div>} />
                <Route path="/analytics/hp" element={<div className="p-6">HP Analytics - Coming Soon</div>} />
                <Route path="/analytics/ho" element={<div className="p-6">HO Analytics - Coming Soon</div>} />
                <Route path="/analytics/hss" element={<div className="p-6">HSS Analytics - Coming Soon</div>} />
                <Route path="/reports" element={<AdminReports />} />
                <Route path="/reports/generate" element={<div className="p-6">Generate Report - Coming Soon</div>} />
                <Route path="/reports/export" element={<DataExport />} />
                <Route path="/settings" element={<div className="p-6">System Settings - Coming Soon</div>} />
                <Route path="/settings/permissions" element={<div className="p-6">Permission Management - Coming Soon</div>} />
                <Route path="/settings/data-sharing" element={<div className="p-6">Data Sharing Rules - Coming Soon</div>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
