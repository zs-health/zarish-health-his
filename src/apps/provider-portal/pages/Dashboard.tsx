import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '@/shared/hooks/usePatient';
import { supabase } from '@/shared/lib/supabase';
import {
    Users, Stethoscope, HeartPulse, Building2, TrendingUp,
    Calendar, AlertTriangle, ArrowRight, Activity
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#be185d'];

// Demo data for when Supabase isn't connected
const demoStats = {
    totalPatients: 1247,
    totalEncounters: 4832,
    ncdEnrollments: 389,
    activeFacilities: 4,
};

const demoEncountersByType = [
    { name: 'OPD', count: 1850 },
    { name: 'NCD Review', count: 980 },
    { name: 'NCD Screening', count: 645 },
    { name: 'Follow-up', count: 520 },
    { name: 'Emergency', count: 210 },
    { name: 'Phone', count: 157 },
];

const demoNCDDistribution = [
    { name: 'Hypertension', value: 45 },
    { name: 'Type 2 Diabetes', value: 30 },
    { name: 'CVD', value: 12 },
    { name: 'COPD', value: 8 },
    { name: 'Asthma', value: 5 },
];

const demoRecentPatients = [
    { id: '1', mrn: 'MRN-2026-000127', given_name: 'Mohammad', family_name: 'Rahman', age: 52, sex: 'Male', origin: 'Bangladeshi', ncd: 'Hypertension' },
    { id: '2', mrn: 'MRN-2026-000128', given_name: 'Fatima', family_name: 'Begum', age: 45, sex: 'Female', origin: 'Rohingya', ncd: 'Diabetes' },
    { id: '3', mrn: 'MRN-2026-000129', given_name: 'Abdul', family_name: 'Karim', age: 61, sex: 'Male', origin: 'Bangladeshi', ncd: 'CVD' },
    { id: '4', mrn: 'MRN-2026-000130', given_name: 'Nur', family_name: 'Jahan', age: 38, sex: 'Female', origin: 'Rohingya', ncd: 'Hypertension' },
];

const demoUpcomingFollowUps = [
    { patient: 'Mohammad Rahman', date: '2026-02-18', type: 'NCD Review', facility: 'CPI HP - Camp 1W' },
    { patient: 'Fatima Begum', date: '2026-02-19', type: 'Follow-up', facility: 'CPI NCD - Camp 1W' },
    { patient: 'Abdul Karim', date: '2026-02-20', type: 'NCD Review', facility: 'CPI HO - Camp 1W' },
];

export function Dashboard() {
    const navigate = useNavigate();
    const { getRecentPatients } = usePatient();
    const [stats, setStats] = useState(demoStats);
    const [, setRecentPatients] = useState(demoRecentPatients);

    useEffect(() => {
        // Try to load real data from Supabase
        async function loadData() {
            try {
                const [patientsRes, encountersRes, ncdRes, facilitiesRes] = await Promise.all([
                    supabase.from('patients').select('id', { count: 'exact', head: true }),
                    supabase.from('encounters').select('id', { count: 'exact', head: true }),
                    supabase.from('ncd_enrollments').select('id', { count: 'exact', head: true }),
                    supabase.from('facilities').select('id', { count: 'exact', head: true }).eq('is_active', true),
                ]);

                if (!patientsRes.error) {
                    setStats({
                        totalPatients: patientsRes.count || demoStats.totalPatients,
                        totalEncounters: encountersRes.count || demoStats.totalEncounters,
                        ncdEnrollments: ncdRes.count || demoStats.ncdEnrollments,
                        activeFacilities: facilitiesRes.count || demoStats.activeFacilities,
                    });
                }

                const recentData = await getRecentPatients(5);
                if (recentData.length > 0) {
                    setRecentPatients(recentData.map(p => ({
                        id: p.id, mrn: p.mrn, given_name: p.given_name, family_name: p.family_name,
                        age: p.age_years || 0, sex: p.sex, origin: p.origin, ncd: ''
                    })));
                }
            } catch {
                // Use demo data if Supabase not connected
            }
        }
        loadData();
    }, [getRecentPatients]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Overview of ZARISH HEALTH Hospital Information System</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Patients', value: stats.totalPatients.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                    { label: 'Total Encounters', value: stats.totalEncounters.toLocaleString(), icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                    { label: 'NCD Enrollments', value: stats.ncdEnrollments.toLocaleString(), icon: HeartPulse, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
                    { label: 'Active Facilities', value: stats.activeFacilities.toString(), icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
                ].map((stat) => (
                    <div key={stat.label} className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <p className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-3 text-xs text-emerald-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>Active system</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Encounters by Type */}
                <div className="bg-card rounded-xl border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Encounters by Type
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={demoEncountersByType}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem'
                                }}
                            />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* NCD Distribution */}
                <div className="bg-card rounded-xl border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <HeartPulse className="h-5 w-5 text-purple-500" />
                        NCD Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={demoNCDDistribution}
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {demoNCDDistribution.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                        {demoNCDDistribution.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                <span className="text-muted-foreground">{item.name} ({item.value}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent NCD Patients */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Recent NCD Patients
                        </h3>
                        <button
                            onClick={() => navigate('/patients/search')}
                            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {demoRecentPatients.map((patient) => (
                            <div
                                key={patient.id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/patients/${patient.id}`)}
                            >
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${patient.sex === 'Male'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                                    }`}>
                                    {patient.given_name[0]}{patient.family_name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{patient.given_name} {patient.family_name}</p>
                                    <p className="text-xs text-muted-foreground">{patient.mrn} · {patient.age}y, {patient.sex}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {patient.origin === 'Rohingya' && (
                                        <span className="badge-status bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px]">FDMN</span>
                                    )}
                                    <span className="badge-status bg-primary/10 text-primary text-[10px]">{patient.ncd}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Follow-ups */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-amber-500" />
                            Upcoming Follow-ups
                        </h3>
                        <span className="badge-warning flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {demoUpcomingFollowUps.length} this week
                        </span>
                    </div>
                    <div className="space-y-3">
                        {demoUpcomingFollowUps.map((fu, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex flex-col items-center justify-center">
                                    <span className="text-[10px] text-amber-600 font-medium">{new Date(fu.date).toLocaleDateString('en-GB', { month: 'short' })}</span>
                                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400 -mt-0.5">{new Date(fu.date).getDate()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{fu.patient}</p>
                                    <p className="text-xs text-muted-foreground">{fu.type} · {fu.facility}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
