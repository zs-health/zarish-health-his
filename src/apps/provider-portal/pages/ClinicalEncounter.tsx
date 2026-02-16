import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { VitalSignsForm } from '@/shared/components/VitalSignsForm';
import { HypertensionProtocol } from '@/shared/components/HypertensionProtocol';
import { supabase } from '@/shared/lib/supabase';
import type { VitalSigns } from '@/shared/types';
import { Stethoscope, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export function ClinicalEncounter() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get('patient') || '';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vitals, setVitals] = useState<Partial<VitalSigns>>({});
    const [form, setForm] = useState({
        encounter_type: 'OPD' as string,
        chief_complaint: '',
        history_present_illness: '',
        clinical_impression: '',
        treatment_plan: '',
        follow_up_required: false,
        follow_up_date: '',
        follow_up_instructions: '',
        referral_required: false,
        referral_reason: '',
        referral_urgency: 'routine' as string,
        clinical_notes: '',
        visit_date: new Date().toISOString().split('T')[0],
    });

    const updateField = (field: string, value: unknown) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleVitalsSave = (v: Partial<VitalSigns>) => {
        setVitals(v);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create encounter
            const { data: encounter, error: encErr } = await supabase
                .from('encounters')
                .insert({
                    patient_id: patientId,
                    ...form,
                    encounter_status: 'completed',
                })
                .select()
                .single();

            if (encErr) throw encErr;

            // Save vitals if recorded
            if (encounter && vitals.systolic_bp) {
                await supabase.from('vital_signs').insert({
                    encounter_id: encounter.id,
                    patient_id: patientId,
                    ...vitals,
                });
            }

            navigate(`/patients/${patientId}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save encounter');
        } finally {
            setLoading(false);
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
                    <Stethoscope className="h-8 w-8" />
                    Clinical Encounter
                </h1>
                <p className="page-subtitle">Record a clinical encounter for the patient</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Encounter Info */}
                <div className="form-section">
                    <h3 className="form-section-title"><Stethoscope className="h-5 w-5 text-primary" /> Encounter Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="input-group">
                            <label className="text-sm font-medium">Encounter Type *</label>
                            <select value={form.encounter_type} onChange={(e) => updateField('encounter_type', e.target.value)} required className={inputClass}>
                                <option value="OPD">OPD (Outpatient)</option>
                                <option value="NCD Screening">NCD Screening</option>
                                <option value="NCD Review">NCD Review</option>
                                <option value="Follow-up">Follow-up</option>
                                <option value="Emergency">Emergency</option>
                                <option value="Triage">Triage</option>
                                <option value="Phone">Phone Consultation</option>
                                <option value="Home Visit">Home Visit</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Visit Date *</label>
                            <input type="date" value={form.visit_date} onChange={(e) => updateField('visit_date', e.target.value)} required className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Chief Complaint */}
                <div className="form-section">
                    <h3 className="form-section-title">Clinical History</h3>
                    <div className="space-y-4">
                        <div className="input-group">
                            <label className="text-sm font-medium">Chief Complaint *</label>
                            <textarea value={form.chief_complaint} onChange={(e) => updateField('chief_complaint', e.target.value)} required rows={2} className={inputClass} placeholder="Main reason for visit..." />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">History of Present Illness</label>
                            <textarea value={form.history_present_illness} onChange={(e) => updateField('history_present_illness', e.target.value)} rows={3} className={inputClass} placeholder="Detailed history..." />
                        </div>
                    </div>
                </div>

                {/* Vital Signs */}
                <VitalSignsForm onSubmit={handleVitalsSave} />

                {/* Hypertension Protocol */}
                <HypertensionProtocol systolic={vitals.systolic_bp} diastolic={vitals.diastolic_bp} />

                {/* Assessment & Plan */}
                <div className="form-section">
                    <h3 className="form-section-title">Assessment & Plan</h3>
                    <div className="space-y-4">
                        <div className="input-group">
                            <label className="text-sm font-medium">Clinical Impression</label>
                            <textarea value={form.clinical_impression} onChange={(e) => updateField('clinical_impression', e.target.value)} rows={2} className={inputClass} placeholder="Working diagnosis / clinical impression..." />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Treatment Plan</label>
                            <textarea value={form.treatment_plan} onChange={(e) => updateField('treatment_plan', e.target.value)} rows={2} className={inputClass} placeholder="Treatment plan details..." />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Clinical Notes</label>
                            <textarea value={form.clinical_notes} onChange={(e) => updateField('clinical_notes', e.target.value)} rows={2} className={inputClass} placeholder="Additional notes..." />
                        </div>
                    </div>
                </div>

                {/* Follow-up & Referral */}
                <div className="form-section">
                    <h3 className="form-section-title">Follow-up & Referral</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.follow_up_required} onChange={(e) => updateField('follow_up_required', e.target.checked)} className="w-4 h-4 rounded" />
                            Follow-up Required
                        </label>
                        {form.follow_up_required && (
                            <div className="input-group">
                                <label className="text-sm font-medium">Follow-up Date</label>
                                <input type="date" value={form.follow_up_date} onChange={(e) => updateField('follow_up_date', e.target.value)} className={inputClass} />
                            </div>
                        )}
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.referral_required} onChange={(e) => updateField('referral_required', e.target.checked)} className="w-4 h-4 rounded" />
                            Referral Required
                        </label>
                        {form.referral_required && (
                            <>
                                <div className="input-group">
                                    <label className="text-sm font-medium">Referral Reason</label>
                                    <input type="text" value={form.referral_reason} onChange={(e) => updateField('referral_reason', e.target.value)} className={inputClass} />
                                </div>
                                <div className="input-group">
                                    <label className="text-sm font-medium">Urgency</label>
                                    <select value={form.referral_urgency} onChange={(e) => updateField('referral_urgency', e.target.value)} className={inputClass}>
                                        <option value="routine">Routine</option>
                                        <option value="urgent">Urgent</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 border rounded-lg text-sm hover:bg-muted/50">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20 flex items-center gap-2">
                        <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Encounter'}
                    </button>
                </div>
            </form>
        </div>
    );
}
