import { useState } from 'react';
import { useExport } from '@/shared/hooks/useExport';
import { supabase } from '@/shared/lib/supabase';
import {
    Download, FileSpreadsheet, Users, Stethoscope, HeartPulse,
    Activity, Calendar, Filter, Loader2, CheckCircle, AlertCircle,
    Database, Search
} from 'lucide-react';

export function DataExport() {
    const {
        loading,
        error,
        canExport,
        exportPatients,
        exportEncounters,
        exportNCDEnrollments,
        exportVitalSigns,
        exportFollowUps,
        exportResearchData
    } = useExport();

    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        facility_id: '',
        origin: '',
        status: '',
        ncd_type: '',
        encounter_type: ''
    });

    const [facilities, setFacilities] = useState<{ id: string; facility_name: string }[]>([]);
    const [exporting, setExporting] = useState<string | null>(null);
    const [exportResult, setExportResult] = useState<{ type: string; count: number } | null>(null);

    useState(() => {
        supabase.from('facilities').select('id, facility_name').then(({ data }) => {
            if (data) setFacilities(data);
        });
    });

    const handleExport = async (type: string, exportFn: Function) => {
        setExporting(type);
        setExportResult(null);

        const result = await exportFn(filters);

        if (result !== null) {
            setExportResult({ type, count: result });
        }

        setExporting(null);
    };

    const exportOptions = [
        {
            id: 'patients',
            label: 'Patients',
            description: 'Export all patient demographics and identifiers',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            fn: () => exportPatients(filters)
        },
        {
            id: 'encounters',
            label: 'Encounters',
            description: 'Export all clinical encounters and visits',
            icon: Stethoscope,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            fn: () => exportEncounters(filters)
        },
        {
            id: 'ncd',
            label: 'NCD Enrollments',
            description: 'Export NCD program enrollments and details',
            icon: HeartPulse,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            fn: () => exportNCDEnrollments(filters)
        },
        {
            id: 'vitals',
            label: 'Vital Signs',
            description: 'Export all vital signs measurements',
            icon: Activity,
            color: 'text-red-600',
            bg: 'bg-red-50',
            fn: () => exportVitalSigns(filters)
        },
        {
            id: 'followups',
            label: 'Follow-up Visits',
            description: 'Export NCD follow-up visit records',
            icon: Calendar,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            fn: () => exportFollowUps(filters)
        },
        {
            id: 'research',
            label: 'Full Research Export',
            description: 'Export complete dataset in JSON format for research analysis',
            icon: Database,
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            fn: () => exportResearchData()
        }
    ];

    if (!canExport) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 bg-card p-10 rounded-2xl border shadow-xl">
                    <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-black">Access Denied</h2>
                    <p className="text-muted-foreground">
                        You do not have permission to export data. Please contact your administrator.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="page-header">
                <h1 className="page-title flex items-center gap-2">
                    <Download className="h-8 w-8 text-primary" />
                    Data Export Center
                </h1>
                <p className="page-subtitle">
                    Export clinical data for M&E, reporting, and research purposes
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {exportResult && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20">
                    <CheckCircle className="h-5 w-5" />
                    Successfully exported {exportResult.count} records
                </div>
            )}

            {/* Filters */}
            <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Export Filters</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="input-group">
                        <label className="text-sm font-medium">Date From</label>
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                        />
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium">Date To</label>
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                        />
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium">Facility</label>
                        <select
                            value={filters.facility_id}
                            onChange={(e) => setFilters({ ...filters, facility_id: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                        >
                            <option value="">All Facilities</option>
                            {facilities.map(f => (
                                <option key={f.id} value={f.id}>{f.facility_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium">Origin</label>
                        <select
                            value={filters.origin}
                            onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                        >
                            <option value="">All Origins</option>
                            <option value="Rohingya">Rohingya (FDMN)</option>
                            <option value="Bangladeshi">Bangladeshi</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exportOptions.map(option => (
                    <div
                        key={option.id}
                        className="bg-card rounded-xl border p-6 hover:shadow-lg transition-all group"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl ${option.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                <option.icon className={`h-6 w-6 ${option.color}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{option.label}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                            </div>
                        </div>
                        <button
                            onClick={option.fn}
                            disabled={exporting === option.id}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
                        >
                            {exporting === option.id ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Export {option.label}
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Patients', icon: Users, key: 'patients' },
                    { label: 'Encounters', icon: Stethoscope, key: 'encounters' },
                    { label: 'NCD', icon: HeartPulse, key: 'ncd' },
                    { label: 'Vitals', icon: Activity, key: 'vitals' },
                    { label: 'Follow-ups', icon: Calendar, key: 'followups' },
                ].map(stat => (
                    <div key={stat.key} className="bg-card rounded-lg border p-4 text-center">
                        <stat.icon className="h-5 w-5 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
