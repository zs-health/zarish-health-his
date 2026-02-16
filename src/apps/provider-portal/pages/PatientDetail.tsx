import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/shared/hooks/usePatient';
import { useNCD } from '@/shared/hooks/useNCD';
import { formatDate, calculateAge, cn } from '@/shared/lib/utils';
import type { Patient, NCDEnrollment } from '@/shared/types';
import {
    ArrowLeft, User, Phone, MapPin, FileText, HeartPulse,
    Stethoscope, Calendar, Shield, Edit, Activity
} from 'lucide-react';

export function PatientDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getPatient, loading: patientLoading } = usePatient();
    const { getEnrollments } = useNCD();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [enrollments, setEnrollments] = useState<NCDEnrollment[]>([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (id) {
            getPatient(id).then(setPatient);
            getEnrollments(id).then(setEnrollments);
        }
    }, [id, getPatient, getEnrollments]);

    if (patientLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-20">
                <User className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">Patient not found</p>
                <button onClick={() => navigate('/patients/search')} className="mt-2 text-primary text-sm hover:underline">
                    Back to search
                </button>
            </div>
        );
    }

    const age = patient.age_years ?? calculateAge(patient.date_of_birth);
    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'encounters', label: 'Encounters', icon: Stethoscope },
        { id: 'ncd', label: 'NCD Program', icon: HeartPulse },
        { id: 'vitals', label: 'Vitals History', icon: Activity },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {/* Patient Header */}
            <div className="bg-card rounded-xl border p-6">
                <div className="flex items-start gap-4">
                    <div className={cn(
                        'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold',
                        patient.sex === 'Male'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                    )}>
                        {patient.given_name[0]}{patient.family_name[0]}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold">{patient.given_name} {patient.family_name}</h1>
                            <span className={patient.patient_status === 'active' ? 'badge-active' : 'badge-inactive'}>
                                {patient.patient_status}
                            </span>
                            {patient.origin === 'Rohingya' && (
                                <span className="badge-status bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">FDMN</span>
                            )}
                            {patient.is_pregnant && <span className="badge-warning">Pregnant</span>}
                            {patient.is_vulnerable && <span className="badge-danger">Vulnerable</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {patient.mrn}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {age}y, {patient.sex} · DOB: {formatDate(patient.date_of_birth)}</span>
                            {patient.phone_primary && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {patient.phone_primary}</span>}
                            {patient.blood_group && <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> {patient.blood_group}</span>}
                        </div>
                        {patient.fcn && <p className="text-xs text-muted-foreground mt-1">FCN: {patient.fcn}</p>}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => navigate(`/encounters/new?patient=${patient.id}`)} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1.5 shadow-md shadow-primary/20">
                            <Stethoscope className="h-4 w-4" /> New Encounter
                        </button>
                        <button className="px-3 py-2 border rounded-lg text-sm hover:bg-muted/50 flex items-center gap-1.5">
                            <Edit className="h-4 w-4" /> Edit
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                            activeTab === tab.id
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                    {/* Demographics */}
                    <div className="form-section">
                        <h3 className="form-section-title"><User className="h-5 w-5 text-primary" /> Demographics</h3>
                        <div className="space-y-2 text-sm">
                            <InfoRow label="Full Name" value={`${patient.given_name} ${patient.middle_name || ''} ${patient.family_name}`} />
                            {patient.full_name_bn && <InfoRow label="Bengali Name" value={patient.full_name_bn} />}
                            <InfoRow label="Date of Birth" value={formatDate(patient.date_of_birth)} />
                            <InfoRow label="Age" value={`${age} years`} />
                            <InfoRow label="Sex" value={patient.sex} />
                            <InfoRow label="Origin" value={patient.origin} />
                            <InfoRow label="Marital Status" value={patient.marital_status || 'Not specified'} />
                            {patient.father_name && <InfoRow label="Father" value={patient.father_name} />}
                            {patient.mother_name && <InfoRow label="Mother" value={patient.mother_name} />}
                            {patient.spouse_name && <InfoRow label="Spouse" value={patient.spouse_name} />}
                        </div>
                    </div>

                    {/* Contact & IDs */}
                    <div className="space-y-6">
                        <div className="form-section">
                            <h3 className="form-section-title"><Phone className="h-5 w-5 text-primary" /> Contact</h3>
                            <div className="space-y-2 text-sm">
                                <InfoRow label="Phone (Primary)" value={patient.phone_primary || 'Not provided'} />
                                {patient.phone_secondary && <InfoRow label="Phone (Secondary)" value={patient.phone_secondary} />}
                                {patient.email && <InfoRow label="Email" value={patient.email} />}
                                {patient.emergency_contact_name && (
                                    <InfoRow label="Emergency Contact" value={`${patient.emergency_contact_name} (${patient.emergency_contact_relationship}) - ${patient.emergency_contact_phone}`} />
                                )}
                            </div>
                        </div>
                        <div className="form-section">
                            <h3 className="form-section-title"><MapPin className="h-5 w-5 text-primary" /> Identifiers</h3>
                            <div className="space-y-2 text-sm">
                                <InfoRow label="MRN" value={patient.mrn} />
                                {patient.fcn && <InfoRow label="FCN" value={patient.fcn} />}
                                {patient.progress_id && <InfoRow label="Progress ID" value={patient.progress_id} />}
                                {patient.national_id && <InfoRow label="National ID" value={patient.national_id} />}
                                {patient.legacy_ncd_number && <InfoRow label="Legacy NCD #" value={patient.legacy_ncd_number} />}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ncd' && (
                <div className="animate-fade-in">
                    {enrollments.length > 0 ? (
                        <div className="space-y-4">
                            {enrollments.map(enrollment => (
                                <div key={enrollment.id} className="form-section">
                                    <div className="flex items-center justify-between">
                                        <h3 className="form-section-title">
                                            <HeartPulse className="h-5 w-5 text-purple-500" />
                                            NCD Enrollment — {enrollment.primary_ncd}
                                        </h3>
                                        <span className={enrollment.program_status === 'active' ? 'badge-active' : 'badge-inactive'}>
                                            {enrollment.program_status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-2">
                                        <InfoRow label="Enrolled" value={formatDate(enrollment.enrollment_date)} />
                                        <InfoRow label="NCD Types" value={enrollment.ncd_type.join(', ')} />
                                        <InfoRow label="Source" value={enrollment.enrollment_source || 'N/A'} />
                                        <InfoRow label="Tobacco Use" value={enrollment.tobacco_use ? 'Yes' : 'No'} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-card rounded-xl border">
                            <HeartPulse className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                            <p className="mt-4 text-muted-foreground">No NCD enrollment found</p>
                            <button
                                onClick={() => navigate(`/ncd/enrollment?patient=${patient.id}`)}
                                className="mt-2 text-primary text-sm font-medium hover:underline"
                            >
                                Enroll in NCD Program
                            </button>
                        </div>
                    )}
                </div>
            )}

            {(activeTab === 'encounters' || activeTab === 'vitals') && (
                <div className="text-center py-12 bg-card rounded-xl border animate-fade-in">
                    <Stethoscope className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <p className="mt-4 text-muted-foreground">
                        {activeTab === 'encounters' ? 'No encounters recorded yet' : 'No vitals history available'}
                    </p>
                    {activeTab === 'encounters' && (
                        <button
                            onClick={() => navigate(`/encounters/new?patient=${patient.id}`)}
                            className="mt-2 text-primary text-sm font-medium hover:underline"
                        >
                            Create First Encounter
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
        </div>
    );
}
