import { useState } from 'react';
import type { VitalSigns } from '@/shared/types';
import { getBPCategory, getBMICategory, getDiabetesRisk, cn } from '@/shared/lib/utils';
import { Activity, Heart, Thermometer, Wind, Droplets, Ruler, Weight, AlertTriangle } from 'lucide-react';

interface VitalSignsFormProps {
    onSubmit: (vitals: Partial<VitalSigns>) => void;
    initialData?: Partial<VitalSigns>;
    loading?: boolean;
}

export function VitalSignsForm({ onSubmit, initialData, loading }: VitalSignsFormProps) {
    const [vitals, setVitals] = useState<Partial<VitalSigns>>({
        systolic_bp: initialData?.systolic_bp,
        diastolic_bp: initialData?.diastolic_bp,
        heart_rate_bpm: initialData?.heart_rate_bpm,
        temperature_celsius: initialData?.temperature_celsius,
        respiratory_rate: initialData?.respiratory_rate,
        oxygen_saturation: initialData?.oxygen_saturation,
        height_cm: initialData?.height_cm,
        weight_kg: initialData?.weight_kg,
        blood_glucose_mmol_l: initialData?.blood_glucose_mmol_l,
        glucose_test_type: initialData?.glucose_test_type,
        fasting_status: initialData?.fasting_status,
        waist_circumference_cm: initialData?.waist_circumference_cm,
        pain_score: initialData?.pain_score,
        bp_position: initialData?.bp_position || 'sitting',
        bp_arm: initialData?.bp_arm || 'left',
        measurement_date: new Date().toISOString().split('T')[0],
    });

    const bmi = vitals.height_cm && vitals.weight_kg
        ? Number((vitals.weight_kg / ((vitals.height_cm / 100) ** 2)).toFixed(1))
        : undefined;

    const bpCategory = getBPCategory(vitals.systolic_bp, vitals.diastolic_bp);
    const bmiCategory = getBMICategory(bmi);
    const diabetesRisk = getDiabetesRisk(vitals.blood_glucose_mmol_l, vitals.glucose_test_type);

    const updateField = (field: string, value: unknown) => {
        setVitals(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...vitals, bmi });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Pressure Section */}
            <div className="form-section">
                <h3 className="form-section-title">
                    <Heart className="h-5 w-5 text-red-500" />
                    Blood Pressure
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="input-group">
                        <label className="text-sm font-medium">Systolic (mmHg) *</label>
                        <input
                            type="number"
                            value={vitals.systolic_bp || ''}
                            onChange={(e) => updateField('systolic_bp', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            placeholder="120"
                            min={60}
                            max={300}
                        />
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium">Diastolic (mmHg) *</label>
                        <input
                            type="number"
                            value={vitals.diastolic_bp || ''}
                            onChange={(e) => updateField('diastolic_bp', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            placeholder="80"
                            min={30}
                            max={200}
                        />
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium">Position</label>
                        <select
                            value={vitals.bp_position || ''}
                            onChange={(e) => updateField('bp_position', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                        >
                            <option value="sitting">Sitting</option>
                            <option value="standing">Standing</option>
                            <option value="lying">Lying</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium">Arm</label>
                        <select
                            value={vitals.bp_arm || ''}
                            onChange={(e) => updateField('bp_arm', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                        >
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                </div>
                {vitals.systolic_bp && vitals.diastolic_bp && (
                    <div className={cn(
                        'mt-3 p-3 rounded-lg flex items-center gap-2 text-sm font-medium',
                        bpCategory.severity === 'normal' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
                        bpCategory.severity === 'elevated' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
                        bpCategory.severity === 'stage1' && 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
                        bpCategory.severity === 'stage2' && 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                        bpCategory.severity === 'crisis' && 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-300',
                    )}>
                        {bpCategory.severity !== 'normal' && <AlertTriangle className="h-4 w-4" />}
                        BP: {vitals.systolic_bp}/{vitals.diastolic_bp} mmHg — {bpCategory.label}
                    </div>
                )}
            </div>

            {/* Basic Vitals */}
            <div className="form-section">
                <h3 className="form-section-title">
                    <Activity className="h-5 w-5 text-primary" />
                    Basic Vitals
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="input-group">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                            <Heart className="h-3.5 w-3.5 text-red-400" /> Heart Rate (bpm)
                        </label>
                        <input
                            type="number"
                            value={vitals.heart_rate_bpm || ''}
                            onChange={(e) => updateField('heart_rate_bpm', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            placeholder="72"
                            min={20}
                            max={300}
                        />
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                            <Thermometer className="h-3.5 w-3.5 text-orange-400" /> Temperature (°C)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={vitals.temperature_celsius || ''}
                            onChange={(e) => updateField('temperature_celsius', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            placeholder="36.6"
                            min={30}
                            max={45}
                        />
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                            <Wind className="h-3.5 w-3.5 text-teal-400" /> Respiratory Rate
                        </label>
                        <input
                            type="number"
                            value={vitals.respiratory_rate || ''}
                            onChange={(e) => updateField('respiratory_rate', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            placeholder="16"
                            min={5}
                            max={60}
                        />
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                            <Droplets className="h-3.5 w-3.5 text-blue-400" /> SpO₂ (%)
                        </label>
                        <input
                            type="number"
                            value={vitals.oxygen_saturation || ''}
                            onChange={(e) => updateField('oxygen_saturation', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            placeholder="98"
                            min={0}
                            max={100}
                        />
                    </div>
                </div>
            </div>

            {/* Anthropometry */}
            <div className="form-section">
                <h3 className="form-section-title">
                    <Ruler className="h-5 w-5 text-indigo-500" />
                    Anthropometry
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="input-group">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                            <Ruler className="h-3.5 w-3.5" /> Height (cm)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={vitals.height_cm || ''}
                            onChange={(e) => updateField('height_cm', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            placeholder="165"
                            min={30}
                            max={250}
                        />
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                            <Weight className="h-3.5 w-3.5" /> Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={vitals.weight_kg || ''}
                            onChange={(e) => updateField('weight_kg', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            placeholder="65"
                            min={1}
                            max={500}
                        />
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium">BMI</label>
                        <div className="px-3 py-2 rounded-lg border bg-muted/50 text-sm">
                            {bmi ? `${bmi} (${bmiCategory})` : '—'}
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium">Waist (cm)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={vitals.waist_circumference_cm || ''}
                            onChange={(e) => updateField('waist_circumference_cm', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            placeholder="85"
                        />
                    </div>
                </div>
            </div>

            {/* Blood Glucose (NCD Critical) */}
            <div className="form-section">
                <h3 className="form-section-title">
                    <Droplets className="h-5 w-5 text-purple-500" />
                    Blood Glucose (NCD)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="input-group">
                        <label className="text-sm font-medium">Glucose (mmol/L)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={vitals.blood_glucose_mmol_l || ''}
                            onChange={(e) => updateField('blood_glucose_mmol_l', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            placeholder="5.5"
                        />
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium">Test Type</label>
                        <select
                            value={vitals.glucose_test_type || ''}
                            onChange={(e) => updateField('glucose_test_type', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                        >
                            <option value="">Select...</option>
                            <option value="FPG">FPG (Fasting)</option>
                            <option value="RPG">RPG (Random)</option>
                            <option value="2h-PG">2h-PG (Post-Glucose)</option>
                            <option value="HbA1c">HbA1c</option>
                            <option value="RBS">RBS (Capillary)</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium">Fasting?</label>
                        <select
                            value={vitals.fasting_status === undefined ? '' : String(vitals.fasting_status)}
                            onChange={(e) => updateField('fasting_status', e.target.value === 'true')}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                        >
                            <option value="">Unknown</option>
                            <option value="true">Yes (≥8 hours)</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="text-sm font-medium">Diabetes Risk</label>
                        <div className={cn(
                            'px-3 py-2 rounded-lg border text-sm font-medium',
                            diabetesRisk === 'Normal' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
                            diabetesRisk === 'Pre-diabetes' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
                            diabetesRisk === 'Diabetes' && 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                            (diabetesRisk === 'Unknown' || diabetesRisk === 'Indeterminate') && 'bg-muted/50 text-muted-foreground'
                        )}>
                            {diabetesRisk}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md shadow-primary/20"
                >
                    {loading ? 'Saving...' : 'Save Vitals'}
                </button>
            </div>
        </form>
    );
}
