import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { ProfilePage } from '@/apps/provider-portal/pages/Profile';
import { DataExport } from '@/apps/admin-portal/pages/DataExport';

function ResearcherLayout() {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}

export function ResearcherRoutes() {
    return (
        <Routes>
            <Route element={<ResearcherLayout />}>
                <Route path="/" element={
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold">Researcher Dashboard</h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">De-identified Datasets</h3>
                                <p className="text-3xl font-bold text-primary">Available</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Program Comparisons</h3>
                                <p className="text-3xl font-bold text-primary">Available</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border">
                                <h3 className="font-semibold">Export Requests</h3>
                                <p className="text-3xl font-bold text-primary">0</p>
                            </div>
                        </div>
                    </div>
                } />
                <Route path="/statistics/demographics" element={<div className="p-6">Demographics Statistics - Coming Soon</div>} />
                <Route path="/statistics/ncd" element={<div className="p-6">NCD Statistics - Coming Soon</div>} />
                <Route path="/statistics/outcomes" element={<div className="p-6">Outcomes Statistics - Coming Soon</div>} />
                <Route path="/statistics/quality" element={<div className="p-6">Quality Metrics - Coming Soon</div>} />
                <Route path="/comparison/hp-ho" element={<div className="p-6">HP vs HO Research - Coming Soon</div>} />
                <Route path="/comparison/effectiveness" element={<div className="p-6">Program Effectiveness - Coming Soon</div>} />
                <Route path="/export" element={<DataExport />} />
                <Route path="/export/custom" element={<div className="p-6">Custom Dataset Builder - Coming Soon</div>} />
                <Route path="/visualizations" element={<div className="p-6">Data Visualization Hub - Coming Soon</div>} />
                <Route path="/visualizations/trends" element={<div className="p-6">Trends Analysis - Coming Soon</div>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
