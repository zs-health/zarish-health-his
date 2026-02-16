import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export function NCDFollowUp() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        visit_date: new Date().toISOString().split('T')[0],
        visit_type: 'Scheduled Follow-up',
        medication_adherence: '',
        missed_doses_last_week: 0,
        side_effects_reported: false,
        side_effects_description: '',
        diet_adherence: '',
        exercise_adherence: '',
        tobacco_cessation_progress: '',
        current_bp_systolic: undefined as number | undefined,
        current_bp_diastolic: undefined as number | undefined,
        current_weight_kg: undefined as number | undefined,
        current_blood_glucose: undefined as number | undefined,
        current_hba1c: undefined as number | undefined,
        bp_target_met: false,
        glucose_target_met: false,
        weight_target_met: false,
        complications_assessed: false,
        new_complications_detected: false,
        complications_notes: '',
        treatment_modified: false,
        treatment_modification_reason: '',
        next_visit_scheduled: '',
        clinical_notes: '',
    });

    const updateField = (field: string, value: unknown) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Submit would go to Supabase
        setTimeout(() => {
            setLoading(false);
            navigate(-1);
        }, 1000);
    };

    const inputClass = "w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <h1 className="page-title flex items-center gap-2">
                    <ClipboardList className="h-8 w-8" />
                    NCD Follow-Up Visit
                </h1>
                <p className="page-subtitle">Record NCD follow-up visit with adherence and target assessment</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Visit Info */}
                <div className="form-section">
                    <h3 className="form-section-title">Visit Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="input-group">
                            <label className="text-sm font-medium">Visit Date</label>
                            <input type="date" value={form.visit_date} onChange={(e) => updateField('visit_date', e.target.value)} className={inputClass} />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Visit Type</label>
                            <select value={form.visit_type} onChange={(e) => updateField('visit_type', e.target.value)} className={inputClass}>
                                <option value="Scheduled Follow-up">Scheduled Follow-up</option>
                                <option value="Unscheduled">Unscheduled</option>
                                <option value="Phone Consultation">Phone Consultation</option>
                                <option value="Home Visit">Home Visit</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Adherence */}
                <div className="form-section">
                    <h3 className="form-section-title">Treatment Adherence</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="input-group">
                            <label className="text-sm font-medium">Medication Adherence</label>
                            <select value={form.medication_adherence} onChange={(e) => updateField('medication_adherence', e.target.value)} className={inputClass}>
                                <option value="">Select...</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Missed Doses (Last Week)</label>
                            <input type="number" value={form.missed_doses_last_week} onChange={(e) => updateField('missed_doses_last_week', Number(e.target.value))} className={inputClass} min={0} />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Diet Adherence</label>
                            <select value={form.diet_adherence} onChange={(e) => updateField('diet_adherence', e.target.value)} className={inputClass}>
                                <option value="">Select...</option>
                                <option value="Good">Good</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-3">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.side_effects_reported} onChange={(e) => updateField('side_effects_reported', e.target.checked)} className="w-4 h-4 rounded" />
                            Side Effects Reported
                        </label>
                        {form.side_effects_reported && (
                            <textarea value={form.side_effects_description} onChange={(e) => updateField('side_effects_description', e.target.value)} rows={2} className={`${inputClass} mt-2`} placeholder="Describe side effects..." />
                        )}
                    </div>
                </div>

                {/* Current Measurements */}
                <div className="form-section">
                    <h3 className="form-section-title">Current Measurements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="input-group">
                            <label className="text-sm font-medium">Systolic BP</label>
                            <input type="number" value={form.current_bp_systolic || ''} onChange={(e) => updateField('current_bp_systolic', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Diastolic BP</label>
                            <input type="number" value={form.current_bp_diastolic || ''} onChange={(e) => updateField('current_bp_diastolic', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Weight (kg)</label>
                            <input type="number" step="0.1" value={form.current_weight_kg || ''} onChange={(e) => updateField('current_weight_kg', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">Glucose (mmol/L)</label>
                            <input type="number" step="0.1" value={form.current_blood_glucose || ''} onChange={(e) => updateField('current_blood_glucose', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} />
                        </div>
                        <div className="input-group">
                            <label className="text-sm font-medium">HbA1c (%)</label>
                            <input type="number" step="0.1" value={form.current_hba1c || ''} onChange={(e) => updateField('current_hba1c', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Target Assessment */}
                <div className="form-section">
                    <h3 className="form-section-title flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500" /> Target Assessment
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.bp_target_met} onChange={(e) => updateField('bp_target_met', e.target.checked)} className="w-4 h-4 rounded" />
                            BP Target Met
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.glucose_target_met} onChange={(e) => updateField('glucose_target_met', e.target.checked)} className="w-4 h-4 rounded" />
                            Glucose Target Met
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.weight_target_met} onChange={(e) => updateField('weight_target_met', e.target.checked)} className="w-4 h-4 rounded" />
                            Weight Target Met
                        </label>
                    </div>
                </div>

                {/* Next Visit */}
                <div className="form-section">
                    <h3 className="form-section-title">Next Visit & Notes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="text-sm font-medium">Next Visit Scheduled</label>
                            <input type="date" value={form.next_visit_scheduled} onChange={(e) => updateField('next_visit_scheduled', e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <div className="input-group mt-4">
                        <label className="text-sm font-medium">Clinical Notes</label>
                        <textarea value={form.clinical_notes} onChange={(e) => updateField('clinical_notes', e.target.value)} rows={3} className={inputClass} placeholder="Visit notes..." />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 border rounded-lg text-sm hover:bg-muted/50">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20 flex items-center gap-2">
                        <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Follow-Up'}
                    </button>
                </div>
            </form>
        </div>
    );
}
