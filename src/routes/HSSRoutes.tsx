import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { ProfilePage } from '@/apps/provider-portal/pages/Profile';
import { DataExport } from '@/apps/admin-portal/pages/DataExport';

function HSSLayout() {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}

export function HSSRoutes() {
    return (
        <Routes>
            <Route element={<HSSLayout />}>
                <Route path="/" element={
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold">Health Support Services Dashboard</h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Training Sessions</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Quality Indicators</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Supply Requests</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                        </div>
                    </div>
                } />
                <Route path="/training" element={<div className="p-6">Training & Capacity Building - Coming Soon</div>} />
                <Route path="/training/conduct" element={<div className="p-6">Conduct Training - Coming Soon</div>} />
                <Route path="/quality" element={<div className="p-6">Quality Assurance - Coming Soon</div>} />
                <Route path="/supply" element={<div className="p-6">Supply Chain - Coming Soon</div>} />
                <Route path="/data" element={<div className="p-6">Data Management - Coming Soon</div>} />
                <Route path="/reports" element={<div className="p-6">HSS Reports - Coming Soon</div>} />
                <Route path="/reports/export" element={<DataExport />} />
                <Route path="/import" element={<div className="p-6">Data Import - Coming Soon</div>} />
                <Route path="/settings" element={<div className="p-6">HSS Settings - Coming Soon</div>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
