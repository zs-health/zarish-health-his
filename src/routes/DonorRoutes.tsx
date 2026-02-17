import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { ProfilePage } from '@/apps/provider-portal/pages/Profile';

function DonorLayout() {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}

export function DonorRoutes() {
    return (
        <Routes>
            <Route element={<DonorLayout />}>
                <Route path="/" element={
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold">Donor Dashboard</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Program Overview</h3>
                                <p className="text-3xl font-bold text-primary">HP & HO</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Key Metrics</h3>
                                <p className="text-3xl font-bold text-primary">View Only</p>
                            </div>
                        </div>
                        <div className="bg-card p-6 rounded-lg border">
                            <p className="text-muted-foreground">High-level statistics and aggregated outcomes available. No access to patient-level data.</p>
                        </div>
                    </div>
                } />
                <Route path="/dashboard" element={
                    <div className="p-6">High-level Dashboard - Coming Soon</div>
                } />
                <Route path="/outcomes" element={<div className="p-6">Program Outcomes - Coming Soon</div>} />
                <Route path="/reports" element={<div className="p-6">Summary Reports - Coming Soon</div>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
