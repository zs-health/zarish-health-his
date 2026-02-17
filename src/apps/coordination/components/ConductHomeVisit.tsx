import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';
import { useAppStore } from '@/shared/stores/appStore';

interface ConductHomeVisitProps {
    patientId: string;
    patientName?: string;
    referralId?: string;
    onSuccess?: () => void;
}

const VISIT_PURPOSES = [
    'Follow-up',
    'Medication Delivery',
    'Vital Signs Check',
    'Education',
    'Referral Follow-up',
    'Missed Appointment',
];

const ADHERENCE_LEVELS = ['Excellent', 'Good', 'Fair', 'Poor', 'Not Assessed'];
const PATIENT_CONDITIONS = ['Stable', 'Improved', 'Worsened', 'Emergency'];

export function ConductHomeVisit({ patientId, patientName, referralId, onSuccess }: ConductHomeVisitProps) {
    const navigate = useNavigate();
    const { user, currentFacility } = useAppStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: new Date().toTimeString().slice(0, 5),
        visit_purpose: ['Follow-up'] as string[],
        patient_found: true,
        patient_condition: 'Stable' as 'Stable' | 'Improved' | 'Worsened' | 'Emergency',
        vitals_taken: false,
        systolic_bp: '',
        diastolic_bp: '',
        blood_glucose: '',
        medication_adherence: 'Good' as 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Not Assessed',
        complications_noted: false,
        complications_description: '',
        requires_hp_visit: false,
        requires_urgent_attention: false,
        visit_notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let vitalSignsId = null;

            if (formData.vitals_taken && (formData.systolic_bp || formData.blood_glucose)) {
                const { data: vitals, error: vitalsError } = await supabase
                    .from('vital_signs')
                    .insert({
                        patient_id: patientId,
                        measurement_date: formData.visit_date,
                        systolic_bp: formData.systolic_bp ? parseInt(formData.systolic_bp) : null,
                        diastolic_bp: formData.diastolic_bp ? parseInt(formData.diastolic_bp) : null,
                        blood_glucose_mmol_l: formData.blood_glucose ? parseFloat(formData.blood_glucose) : null,
                        glucose_test_type: formData.blood_glucose ? 'RBS' : null,
                        measured_by: user?.email || 'CHW',
                    })
                    .select()
                    .single();

                if (vitalsError) throw vitalsError;
                vitalSignsId = vitals?.id;
            }

            const { data: homeVisit, error: visitError } = await supabase
                .from('coordination.home_visits')
                .insert({
                    patient_id: patientId,
                    visit_date: formData.visit_date,
                    visit_time: formData.visit_time,
                    chw_user_id: user?.id,
                    ho_facility_id: currentFacility?.id,
                    visit_purpose: formData.visit_purpose,
                    patient_found: formData.patient_found,
                    patient_condition: formData.patient_condition,
                    vitals_taken: formData.vitals_taken,
                    vital_signs_id: vitalSignsId,
                    medication_adherence: formData.medication_adherence,
                    complications_noted: formData.complications_noted,
                    complications_description: formData.complications_description || null,
                    requires_hp_visit: formData.requires_hp_visit,
                    requires_urgent_attention: formData.requires_urgent_attention,
                    visit_notes: formData.visit_notes || null,
                    shared_with_hp: true,
                    referral_id: referralId || null,
                })
                .select()
                .single();

            if (visitError) throw visitError;

            if (formData.requires_hp_visit || formData.patient_condition === 'Emergency') {
                await supabase
                    .from('coordination.cross_program_referrals')
                    .insert({
                        patient_id: patientId,
                        from_program: 'HO',
                        to_program: 'HP',
                        referral_reason: formData.patient_condition === 'Emergency' 
                            ? 'Emergency: Home visit revealed urgent medical need'
                            : 'Patient requires clinic follow-up',
                        referral_type: 'Clinic Consultation',
                        urgency: formData.patient_condition === 'Emergency' ? 'emergency' : 'urgent',
                        referred_by: user?.id,
                    });
            }

            alert('Home visit recorded successfully!');
            
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/ho/home-visits');
            }
        } catch (err) {
            console.error('Error recording home visit:', err);
            setError('Failed to record home visit');
        } finally {
            setLoading(false);
        }
    };

    const togglePurpose = (purpose: string) => {
        setFormData(prev => ({
            ...prev,
            visit_purpose: prev.visit_purpose.includes(purpose)
                ? prev.visit_purpose.filter(p => p !== purpose)
                : [...prev.visit_purpose, purpose]
        }));
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Conduct Home Visit</h2>
            {patientName && <p className="text-gray-600 mb-4">Patient: {patientName}</p>}
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Visit Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border rounded-md"
                            value={formData.visit_date}
                            onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Visit Time</label>
                        <input
                            type="time"
                            className="w-full p-2 border rounded-md"
                            value={formData.visit_time}
                            onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Visit Purpose</label>
                    <div className="flex flex-wrap gap-2">
                        {VISIT_PURPOSES.map(purpose => (
                            <label key={purpose} className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.visit_purpose.includes(purpose)}
                                    onChange={() => togglePurpose(purpose)}
                                />
                                <span className="text-sm">{purpose}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.patient_found}
                            onChange={(e) => setFormData({ ...formData, patient_found: e.target.checked })}
                        />
                        <span className="text-sm font-medium">Patient Found</span>
                    </label>
                </div>

                {!formData.patient_found && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Resolution</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            onChange={(e) => setFormData({ ...formData, patient_condition: e.target.value as any })}
                        >
                            <option value="patient_not_found">Patient Not Found</option>
                        </select>
                    </div>
                )}

                {formData.patient_found && (
                    <>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Patient Condition</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={formData.patient_condition}
                                onChange={(e) => setFormData({ ...formData, patient_condition: e.target.value as any })}
                            >
                                {PATIENT_CONDITIONS.map(condition => (
                                    <option key={condition} value={condition}>{condition}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.vitals_taken}
                                    onChange={(e) => setFormData({ ...formData, vitals_taken: e.target.checked })}
                                />
                                <span className="text-sm font-medium">Vitals Taken</span>
                            </label>
                        </div>

                        {formData.vitals_taken && (
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Systolic BP</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-md"
                                        placeholder="120"
                                        value={formData.systolic_bp}
                                        onChange={(e) => setFormData({ ...formData, systolic_bp: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Diastolic BP</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-md"
                                        placeholder="80"
                                        value={formData.diastolic_bp}
                                        onChange={(e) => setFormData({ ...formData, diastolic_bp: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Blood Glucose (mmol/L)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full p-2 border rounded-md"
                                        placeholder="5.5"
                                        value={formData.blood_glucose}
                                        onChange={(e) => setFormData({ ...formData, blood_glucose: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Medication Adherence</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={formData.medication_adherence}
                                onChange={(e) => setFormData({ ...formData, medication_adherence: e.target.value as any })}
                            >
                                {ADHERENCE_LEVELS.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.complications_noted}
                                    onChange={(e) => setFormData({ ...formData, complications_noted: e.target.checked })}
                                />
                                <span className="text-sm font-medium">Complications Noted</span>
                            </label>
                            {formData.complications_noted && (
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Describe complications..."
                                    value={formData.complications_description}
                                    onChange={(e) => setFormData({ ...formData, complications_description: e.target.value })}
                                    rows={2}
                                />
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.requires_hp_visit}
                                    onChange={(e) => setFormData({ ...formData, requires_hp_visit: e.target.checked })}
                                />
                                <span className="text-sm font-medium">Requires HP Visit</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.requires_urgent_attention}
                                    onChange={(e) => setFormData({ ...formData, requires_urgent_attention: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-red-600">Requires Urgent Attention</span>
                            </label>
                        </div>
                    </>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium">Visit Notes</label>
                    <textarea
                        className="w-full p-2 border rounded-md"
                        placeholder="Additional notes..."
                        value={formData.visit_notes}
                        onChange={(e) => setFormData({ ...formData, visit_notes: e.target.value })}
                        rows={3}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Home Visit'}
                    </button>
                </div>
            </form>
        </div>
    );
}
