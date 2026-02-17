import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { ProfilePage } from '@/apps/provider-portal/pages/Profile';
import { DataExport } from '@/apps/admin-portal/pages/DataExport';

function MELayout() {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}

export function MERoutes() {
    return (
        <Routes>
            <Route element={<MELayout />}>
                <Route path="/" element={
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold">M&E Dashboard</h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Program Indicators</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">M&E Reports</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Data Quality</h3>
                                <p className="text-3xl font-bold text-primary">0%</p>
                            </div>
                        </div>
                    </div>
                } />
                <Route path="/indicators" element={<div className="p-6">Program Indicators - Coming Soon</div>} />
                <Route path="/reports" element={<div className="p-6">M&E Reports - Coming Soon</div>} />
                <Route path="/reports/generate" element={<div className="p-6">Generate Report - Coming Soon</div>} />
                <Route path="/export" element={<DataExport />} />
                <Route path="/comparison" element={<div className="p-6">Program Comparison - Coming Soon</div>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
