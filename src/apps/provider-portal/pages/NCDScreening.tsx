import { useState } from 'react';
import {
    Heart, ClipboardCheck, AlertCircle, CheckCircle2,
    ArrowRight, ChevronRight, Info, Activity, Save
} from 'lucide-react';
import { CVDCalculator } from '../components/CVDCalculator';

export function NCDScreening() {
    const [step, setStep] = useState(1);
    const [screeningData, setScreeningData] = useState({
        // Symptoms
        chest_pain: false,
        shortness_of_breath: false,
        headache_severe: false,
        vision_blurry: false,
        numbness: false,
        // Measurements
        systolic_bp: 0,
        diastolic_bp: 0,
        rbs_mmol: 0,
        weight_kg: 0,
        height_cm: 0,
        // History
        family_history_cvd: false,
        tobacco_use: false,
        alcohol_use: false,
    });

    const calculateBMI = () => {
        if (!screeningData.weight_kg || !screeningData.height_cm) return 0;
        const heightM = screeningData.height_cm / 100;
        return (screeningData.weight_kg / (heightM * heightM)).toFixed(1);
    };

    const isHighRisk = () => {
        return screeningData.systolic_bp >= 160 || screeningData.diastolic_bp >= 100 || screeningData.rbs_mmol >= 11.1;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="page-header">
                <h1 className="page-title flex items-center gap-2">
                    <ClipboardCheck className="h-8 w-8 text-primary" />
                    WHO PEN Screening
                </h1>
                <p className="page-subtitle">Integrated NCD Risk Assessment & Intake</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Steps Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { id: 1, title: 'Physical Measurements', sub: 'HP, weight, blood glucose', icon: Activity },
                        { id: 2, title: 'Clinical History', sub: 'Symptoms & risk factors', icon: Info },
                        { id: 3, title: 'CVD Risk Scoring', sub: 'SA regional prediction', icon: Heart },
                        { id: 4, title: 'Enrollment Plan', sub: 'Treatment & follow-up', icon: CheckCircle2 },
                    ].map((s) => (
                        <div
                            key={s.id}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${step === s.id ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card hover:bg-muted/50 text-muted-foreground'}`}
                            onClick={() => setStep(s.id)}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${step === s.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className={`text-xs font-bold uppercase tracking-wider ${step === s.id ? 'text-white/80' : 'text-muted-foreground'}`}>Step {s.id}</p>
                                <p className="font-bold text-sm leading-tight">{s.title}</p>
                            </div>
                            {step === s.id && <ChevronRight className="h-4 w-4" />}
                        </div>
                    ))}

                    {isHighRisk() && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl mt-4 animate-bounce">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-black text-red-700 uppercase tracking-wider">Urgent Alert</p>
                                    <p className="text-[11px] text-red-600 font-medium mt-1">High Diagnostic Threshold Reached. Immediate Medical Review Required.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden h-full">
                        {step === 1 && (
                            <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Measurements</h3>
                                    <p className="text-sm text-muted-foreground">Capture baseline vitals for risk stratification.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-muted/30 rounded-2xl space-y-3">
                                            <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-primary" /> Blood Pressure
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <input
                                                        type="number" placeholder="Sys"
                                                        className="w-full bg-background border rounded-xl p-3 text-lg font-black text-center"
                                                        onChange={(e) => setScreeningData({ ...screeningData, systolic_bp: parseInt(e.target.value) })}
                                                    />
                                                    <p className="text-[10px] text-center mt-1 font-bold text-muted-foreground uppercase">Systolic</p>
                                                </div>
                                                <span className="text-2xl font-light text-muted-foreground">/</span>
                                                <div className="flex-1">
                                                    <input
                                                        type="number" placeholder="Dia"
                                                        className="w-full bg-background border rounded-xl p-3 text-lg font-black text-center"
                                                        onChange={(e) => setScreeningData({ ...screeningData, diastolic_bp: parseInt(e.target.value) })}
                                                    />
                                                    <p className="text-[10px] text-center mt-1 font-bold text-muted-foreground uppercase">Diastolic</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted/30 rounded-2xl space-y-3">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Blood Glucose (RBS)</label>
                                            <div className="relative">
                                                <input
                                                    type="number" step="0.1" placeholder="0.0"
                                                    className="w-full bg-background border rounded-xl p-3 text-lg font-black pr-16"
                                                    onChange={(e) => setScreeningData({ ...screeningData, rbs_mmol: parseFloat(e.target.value) })}
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">mmol/l</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-muted/30 rounded-2xl space-y-3">
                                                <label className="text-xs font-bold uppercase text-muted-foreground font-mono">Weight (kg)</label>
                                                <input
                                                    type="number" placeholder="70"
                                                    className="w-full bg-background border rounded-xl p-3 text-lg font-black"
                                                    onChange={(e) => setScreeningData({ ...screeningData, weight_kg: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="p-4 bg-muted/30 rounded-2xl space-y-3">
                                                <label className="text-xs font-bold uppercase text-muted-foreground font-mono">Height (cm)</label>
                                                <input
                                                    type="number" placeholder="170"
                                                    className="w-full bg-background border rounded-xl p-3 text-lg font-black"
                                                    onChange={(e) => setScreeningData({ ...screeningData, height_cm: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl text-center">
                                            <p className="text-[10px] font-bold uppercase text-primary tracking-widest mb-1">Calculated BMI</p>
                                            <p className="text-4xl font-black text-primary">{calculateBMI()}</p>
                                            <p className="text-[10px] text-muted-foreground mt-2 font-medium">kg/m² · Normal Range: 18.5 - 24.9</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8 border-t">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:translate-x-1 transition-all"
                                    >
                                        Clinical History <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300 h-full">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Symptoms & History</h3>
                                    <p className="text-sm text-muted-foreground">Self-reported symptoms and household risk assessment.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-2">Urgent Symptoms</p>
                                        {[
                                            { key: 'chest_pain', label: 'Severe Chest Pain', desc: 'Crushing or tight sensation' },
                                            { key: 'headache_severe', label: 'Severe Headache', desc: 'Sudden onset, unusual intensity' },
                                            { key: 'vision_blurry', label: 'Blurred Vision', desc: 'Recent sudden changes' },
                                        ].map(symp => (
                                            <label key={symp.key} className="flex gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-all cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded-lg border-border text-primary focus:ring-primary/20 mt-1"
                                                    checked={(screeningData as any)[symp.key]}
                                                    onChange={(e) => setScreeningData({ ...screeningData, [symp.key]: e.target.checked })}
                                                />
                                                <div>
                                                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{symp.label}</p>
                                                    <p className="text-[11px] text-muted-foreground leading-snug">{symp.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-2">Lifestyle & Family</p>
                                        {[
                                            { key: 'tobacco_use', label: 'Current Tobacco Use', desc: 'Including smoking or smokeless tobacco' },
                                            { key: 'family_history_cvd', label: 'Family History of CVD', desc: 'Heart attack or stroke in 1st degree relatives' },
                                        ].map(hist => (
                                            <label key={hist.key} className="flex gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-all cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded-lg border-border text-primary focus:ring-primary/20 mt-1"
                                                    checked={(screeningData as any)[hist.key]}
                                                    onChange={(e) => setScreeningData({ ...screeningData, [hist.key]: e.target.checked })}
                                                />
                                                <div>
                                                    <p className="font-bold text-sm">{hist.label}</p>
                                                    <p className="text-[11px] text-muted-foreground leading-snug">{hist.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between pt-8 border-t mt-auto">
                                    <button onClick={() => setStep(1)} className="px-6 py-3 border rounded-xl font-bold hover:bg-muted/50 transition-colors">Back</button>
                                    <button onClick={() => setStep(3)} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center gap-2 hover:translate-x-1 transition-all">
                                        CVD Risk Scorer <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="p-8 space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight mb-2">Multi-Factor Risk Analysis</h3>
                                    <CVDCalculator />
                                </div>
                                <div className="flex justify-between pt-8 border-t">
                                    <button onClick={() => setStep(2)} className="px-6 py-3 border rounded-xl font-bold hover:bg-muted/50 transition-colors">Back</button>
                                    <button onClick={() => setStep(4)} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center gap-2 hover:translate-x-1 transition-all">
                                        Plan Enrollment <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="p-8 space-y-8 animate-in zoom-in-95 duration-300">
                                <div className="text-center py-6">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight">Classification Complete</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                                        Based on WHO PEN protocols, the patient should be enrolled in the following clinical registries.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 border-2 border-primary/20 bg-primary/5 rounded-2xl relative overflow-hidden group">
                                        <Heart className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/10 group-hover:scale-110 transition-transform" />
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest">Recommended</span>
                                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-primary text-primary" />
                                        </div>
                                        <h4 className="font-black text-lg">Hypertension Control</h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">BP Management Program (Step-wise intensification)</p>
                                    </div>
                                    <div className="p-5 border-2 border-border/50 bg-muted/5 rounded-2xl relative overflow-hidden group grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-muted/50 text-muted-foreground text-[10px] font-black rounded-lg uppercase tracking-widest">Optional</span>
                                            <input type="checkbox" className="w-5 h-5 rounded-lg border-border" />
                                        </div>
                                        <h4 className="font-black text-lg">Diabetes Pathways</h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Glycemic monitoring and complications screening</p>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-8 border-t mt-10">
                                    <button onClick={() => setStep(3)} className="px-6 py-3 border rounded-xl font-bold hover:bg-muted/50 transition-colors">Review Scoring</button>
                                    <button className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-200 dark:shadow-emerald-900/10 flex items-center gap-2 hover:translate-y-[-2px] transition-all">
                                        <Save className="h-5 w-5" /> Finalize Enrollment
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
