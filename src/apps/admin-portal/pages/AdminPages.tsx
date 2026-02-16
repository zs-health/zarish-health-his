import { Building2, BarChart3, Users, Settings } from 'lucide-react';

export function AdminFacilities() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <h1 className="page-title flex items-center gap-2"><Building2 className="h-8 w-8" /> Facilities</h1>
                <p className="page-subtitle">Manage CPI health facilities</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { name: 'CPI Health Post - Camp 1W', type: 'CPI HP', status: 'active', patients: 312 },
                    { name: 'CPI Health Outreach - Camp 1W', type: 'CPI HO', status: 'active', patients: 548 },
                    { name: 'CPI NCD Corner - Camp 1W', type: 'CPI NCD', status: 'active', patients: 245 },
                    { name: 'CPI Health Outreach - Camp 04', type: 'CPI HO', status: 'active', patients: 198 },
                ].map(facility => (
                    <div key={facility.name} className="bg-card rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <span className="badge-active text-[10px]">{facility.status}</span>
                        </div>
                        <h3 className="font-semibold mt-3 group-hover:text-primary transition-colors">{facility.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{facility.type}</p>
                        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {facility.patients} registered patients
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AdminUsers() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <h1 className="page-title flex items-center gap-2"><Users className="h-8 w-8" /> User Management</h1>
                <p className="page-subtitle">Manage system users and roles</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
                <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-muted-foreground/30 mx-auto animate-spin" style={{ animationDuration: '4s' }} />
                    <p className="mt-4 text-muted-foreground">User management will be configured after Supabase setup</p>
                </div>
            </div>
        </div>
    );
}

export function AdminReports() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <h1 className="page-title flex items-center gap-2"><BarChart3 className="h-8 w-8" /> Reports</h1>
                <p className="page-subtitle">Generate facility and NCD program reports</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { title: 'Patient Demographics', desc: 'Age, sex, origin distribution', icon: Users },
                    { title: 'NCD Program Summary', desc: 'Enrollment and follow-up rates', icon: BarChart3 },
                    { title: 'Facility Performance', desc: 'Encounters and capacity by facility', icon: Building2 },
                    { title: 'Hypertension Control', desc: 'BP target achievement rates', icon: Settings },
                ].map(report => (
                    <div key={report.title} className="bg-card rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer group">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <report.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold mt-3 group-hover:text-primary transition-colors">{report.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{report.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
