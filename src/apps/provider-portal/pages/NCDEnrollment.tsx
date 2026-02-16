import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNCD } from '@/shared/hooks/useNCD';
import type { NCDType, EnrollmentSource } from '@/shared/types';
import { HeartPulse, ArrowLeft, Save, AlertCircle } from 'lucide-react';

const NCD_TYPES: NCDType[] = ['Hypertension', 'Type 2 Diabetes', 'CVD', 'COPD', 'Asthma', 'CKD'];

export function NCDEnrollment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get('patient') || '';
    const { createEnrollment, loading, error } = useNCD();

    const [form, setForm] = useState({
        ncd_type: [] as string[],
        primary_ncd: '' as string,
        enrollment_source: 'OPD Diagnosis' as EnrollmentSource,
        enrollment_date: new Date().toISOString().split('T')[0],
        initial_bp_systolic: undefined as number | undefined,
        initial_bp_diastolic: undefined as number | undefined,
        initial_blood_glucose: undefined as number | undefined,
        initial_hba1c: undefined as number | undefined,
        tobacco_use: false,
        tobacco_type: '',
        tobacco_quantity_per_day: undefined as number | undefined,
        alcohol_use: false,
        alcohol_units_per_week: undefined as number | undefined,
        physical_activity_minutes_per_week: undefined as number | undefined,
        family_history_cvd: false,
        family_history_diabetes: false,
        family_history_details: '',
        has_ckd: false,
        has_copd: false,
        has_asthma: false,
        has_retinopathy: false,
        has_neuropathy: false,
        has_nephropathy: false,
        has_foot_complications: false,
    });

    const updateField = (field: string, value: unknown) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const toggleNCD = (ncdType: string) => {
        setForm(prev => {
            const types = prev.ncd_type.includes(ncdType)
                ? prev.ncd_type.filter(t => t !== ncdType)
                : [...prev.ncd_type, ncdType];
            return { ...prev, ncd_type: types, primary_ncd: types[0] || '' };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const enrollment = await createEnrollment({
            patient_id: patientId,
            ...form,
            program_status: 'active',
        } as Record<string, unknown>);
        if (enrollment) {
            navigate(`/patients/${patientId}`);
        }
    };

    const inputClass = "w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <h1 className="page-title flex items-center gap-2">
                    <HeartPulse className="h-8 w-8" />
                    NCD Enrollment
                </h1>
                <p className="page-subtitle">Enroll patient in the Non-Communicable Disease program</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* NCD Type Selection */}
                <div className="form-section">
                    <h3 className="form-section-title"><HeartPulse className="h-5 w-5 text-purple-500" /> NCD Type</h3>
                    <p className="text-sm text-muted-foreground mb-3">Select all applicable NCD conditions</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {NCD_TYPES.map(ncd => (
                            <button
                                key={ncd}
                                type="button"
                                onClick={() => toggleNCD(ncd)}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${form.ncd_type.includes(ncd)
                                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                        : 'hover:border-primary/30'
                                    }`}
                            >
                                {ncd}
                            </button>
                        ))}
                    </div>
                    {form.ncd_type.length > 1 && (
                        <div className="input-group mt-4">
                            <label className="text-sm font-medium">Primary NCD</label>
                            <select value={form.primary_ncd} onChange={(e) => updateField('primary_ncd', e.target.value)} className={inputClass}>
                                {form.ncd_type.map(ncd => (
                                    <option key={ncd} value={ncd}>{ncd}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Enrollment Details */}
                <div className="form-section">
                    <h3 className="form-section-title">Enrollment Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="input-group">
                            <label className="text-sm font-medium">Enrollment Date</label>
                            <input type="date" value={form.enrollment_date} onChange={(e) => updateField('enrollment_date', e.target.value)} className={inputClass} />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Source</label>
                            <select value={form.enrollment_source} onChange={(e) => updateField('enrollment_source', e.target.value)} className={inputClass}>
                                <option value="OPD Diagnosis">OPD Diagnosis</option>
                                <option value="Community Screening">Community Screening</option>
                                <option value="Referral">Referral</option>
                                <option value="Self-Referral">Self-Referral</option>
                                <option value="Legacy Import">Legacy Import</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Initial Measurements */}
                <div className="form-section">
                    <h3 className="form-section-title">Initial Measurements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="input-group">
                            <label className="text-sm font-medium">Systolic BP (mmHg)</label>
                            <input type="number" value={form.initial_bp_systolic || ''} onChange={(e) => updateField('initial_bp_systolic', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="140" />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Diastolic BP (mmHg)</label>
                            <input type="number" value={form.initial_bp_diastolic || ''} onChange={(e) => updateField('initial_bp_diastolic', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="90" />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Blood Glucose (mmol/L)</label>
                            <input type="number" step="0.1" value={form.initial_blood_glucose || ''} onChange={(e) => updateField('initial_blood_glucose', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="7.0" />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">HbA1c (%)</label>
                            <input type="number" step="0.1" value={form.initial_hba1c || ''} onChange={(e) => updateField('initial_hba1c', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="7.0" />
                        </div>
                    </div>
                </div>

                {/* Risk Factors */}
                <div className="form-section">
                    <h3 className="form-section-title">Risk Factors</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.tobacco_use} onChange={(e) => updateField('tobacco_use', e.target.checked)} className="w-4 h-4 rounded" />
                                Tobacco Use
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.alcohol_use} onChange={(e) => updateField('alcohol_use', e.target.checked)} className="w-4 h-4 rounded" />
                                Alcohol Use
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.family_history_cvd} onChange={(e) => updateField('family_history_cvd', e.target.checked)} className="w-4 h-4 rounded" />
                                Family History CVD
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.family_history_diabetes} onChange={(e) => updateField('family_history_diabetes', e.target.checked)} className="w-4 h-4 rounded" />
                                Family History DM
                            </label>
                        </div>
                        {form.tobacco_use && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="input-group">
                                    <label className="text-sm font-medium">Tobacco Type</label>
                                    <select value={form.tobacco_type} onChange={(e) => updateField('tobacco_type', e.target.value)} className={inputClass}>
                                        <option value="">Select...</option>
                                        <option value="Cigarette">Cigarette</option>
                                        <option value="Bidi">Bidi</option>
                                        <option value="Smokeless">Smokeless (Jorda/Gul)</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="text-sm font-medium">Per Day</label>
                                    <input type="number" value={form.tobacco_quantity_per_day || ''} onChange={(e) => updateField('tobacco_quantity_per_day', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} />
                                </div>
                            </div>
                        )}
                        <div className="input-group">
                            <label className="text-sm font-medium">Physical Activity (min/week)</label>
                            <input type="number" value={form.physical_activity_minutes_per_week || ''} onChange={(e) => updateField('physical_activity_minutes_per_week', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="150" />
                        </div>
                    </div>
                </div>

                {/* Comorbidities */}
                <div className="form-section">
                    <h3 className="form-section-title">Comorbidities & Complications</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { field: 'has_ckd', label: 'CKD' },
                            { field: 'has_copd', label: 'COPD' },
                            { field: 'has_asthma', label: 'Asthma' },
                            { field: 'has_retinopathy', label: 'Retinopathy' },
                            { field: 'has_neuropathy', label: 'Neuropathy' },
                            { field: 'has_nephropathy', label: 'Nephropathy' },
                            { field: 'has_foot_complications', label: 'Foot Complications' },
                        ].map(({ field, label }) => (
                            <label key={field} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form[field as keyof typeof form] as boolean}
                                    onChange={(e) => updateField(field, e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 border rounded-lg text-sm hover:bg-muted/50">Cancel</button>
                    <button type="submit" disabled={loading || form.ncd_type.length === 0} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20 flex items-center gap-2">
                        <Save className="h-4 w-4" /> {loading ? 'Enrolling...' : 'Enroll Patient'}
                    </button>
                </div>
            </form>
        </div>
    );
}
