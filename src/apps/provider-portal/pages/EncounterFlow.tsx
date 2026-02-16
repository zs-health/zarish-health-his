import { useState } from 'react';
import {
    User, Activity, FileText, Pill, Clock,
    ChevronRight, Save, History, Plus, Trash2,
    Stethoscope, Thermometer, TrendingUp, AlertCircle,
    CheckCircle2
} from 'lucide-react';

export function EncounterFlow() {
    const [step, setStep] = useState(1);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [notes, setNotes] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
    });

    const addPrescription = () => {
        setPrescriptions([...prescriptions, { id: Date.now(), drug: '', dose: '', freq: '' }]);
    };

    const removePrescription = (id: number) => {
        setPrescriptions(prescriptions.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-end bg-card p-6 rounded-2xl border border-border/50 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary border border-primary/10">
                            AZ
                        </div>
                        <div>
                            <h1 className="text-xl font-black">Abul Zarish</h1>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">MRN: ZH-2026-0001 · 54y · Male</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <span className="badge-active bg-emerald-100 text-emerald-700">Hypertension</span>
                        <span className="badge-active bg-amber-100 text-amber-700">Type 2 Diabetes</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 border rounded-xl hover:bg-muted/50 transition-all text-muted-foreground">
                        <History className="h-5 w-5" />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Save className="h-4 w-4" /> Save Encounter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { id: 1, label: 'Vitals & BMI', icon: Activity },
                    { id: 2, label: 'SOAP Notes', icon: FileText },
                    { id: 3, label: 'Prescription', icon: Pill },
                    { id: 4, label: 'Follow-up', icon: Clock },
                ].map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setStep(s.id)}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${step === s.id ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card hover:bg-muted/50 text-muted-foreground'}`}
                    >
                        <s.icon className={`h-6 w-6 ${step === s.id ? 'text-white' : 'text-primary'}`} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{s.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden p-8 min-h-[500px]">
                {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <Thermometer className="h-6 w-6 text-primary" /> Vitals & Baseline
                            </h3>
                            <p className="text-sm text-muted-foreground">Recent measurements for today's visit.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="p-6 bg-muted/30 rounded-2xl border-none space-y-4">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Blood Pressure</label>
                                <div className="text-4xl font-black tabular-nums">145<span className="text-xl font-light text-muted-foreground mx-1">/</span>92</div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
                                    <TrendingUp className="h-3 w-3" /> Stage 1 HTN
                                </div>
                            </div>
                            <div className="p-6 bg-muted/30 rounded-2xl border-none space-y-4">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Weight & BMI</label>
                                <div className="text-4xl font-black tabular-nums">78.5<span className="text-xs font-bold text-muted-foreground ml-1 font-mono uppercase">kg</span></div>
                                <div className="text-sm font-bold text-foreground">BMI: 27.1 <span className="text-amber-600">(Overweight)</span></div>
                            </div>
                            <div className="p-6 bg-muted/30 rounded-2xl border-none space-y-4">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Blood Glucose</label>
                                <div className="text-4xl font-black tabular-nums">8.2<span className="text-xs font-bold text-muted-foreground ml-1 font-mono uppercase">mmol/l</span></div>
                                <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                                    Target Met (RBS)
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 flex justify-end">
                            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold">Consultation Notes <ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <Stethoscope className="h-6 w-6 text-primary" /> Consultation (SOAP)
                            </h3>
                            <p className="text-sm text-muted-foreground">Standard clinical documentation format.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase text-muted-foreground">Subjective</label>
                                <textarea
                                    className="w-full h-32 bg-muted/20 border border-border/50 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Chief complaints, history of present illness..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase text-muted-foreground">Objective</label>
                                <textarea
                                    className="w-full h-32 bg-muted/20 border border-border/50 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Physical exam findings, focused systems..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase text-muted-foreground">Assessment</label>
                                <textarea
                                    className="w-full h-24 bg-muted/20 border border-border/50 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Diagnosis, rationale..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase text-muted-foreground">Plan</label>
                                <textarea
                                    className="w-full h-24 bg-muted/20 border border-border/50 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Management, counseling, and review plan..."
                                />
                            </div>
                        </div>
                        <div className="pt-8 flex justify-between">
                            <button onClick={() => setStep(1)} className="px-6 py-3 border rounded-xl font-bold">Back</button>
                            <button onClick={() => setStep(3)} className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold">Medications <ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                    <Pill className="h-6 w-6 text-primary" /> Prescription
                                </h3>
                                <p className="text-sm text-muted-foreground">Select drugs from facility inventory.</p>
                            </div>
                            <button
                                onClick={addPrescription}
                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all"
                            >
                                <Plus className="h-4 w-4" /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {prescriptions.length === 0 ? (
                                <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
                                    <Pill className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                                    <p className="text-sm text-muted-foreground font-medium">No medications prescribed yet.</p>
                                </div>
                            ) : (
                                prescriptions.map((p, idx) => (
                                    <div key={p.id} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end p-4 bg-muted/20 rounded-2xl animate-in slide-in-from-top-2">
                                        <div className="sm:col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Medication</label>
                                            <select className="w-full bg-background border border-border/50 rounded-xl p-2.5 text-sm font-semibold">
                                                <option>Amlodipine 5mg Tab</option>
                                                <option>Metformin 500mg Tab</option>
                                                <option>Losartan 50mg Tab</option>
                                                <option>Atorvastatin 10mg Tab</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Frequency</label>
                                            <input type="text" placeholder="1+0+1" className="w-full bg-background border border-border/50 rounded-xl p-2.5 text-sm text-center font-bold" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Duration (Days)</label>
                                            <input type="number" placeholder="30" className="w-full bg-background border border-border/50 rounded-xl p-2.5 text-sm text-center font-bold" />
                                        </div>
                                        <div className="sm:col-span-1 space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Stock</label>
                                            <div className="p-2.5 text-[11px] font-black text-emerald-600">4,281 Avail</div>
                                        </div>
                                        <div className="flex justify-end p-2.5">
                                            <button onClick={() => removePrescription(p.id)} className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 className="h-5 w-5" /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-8 flex justify-between">
                            <button onClick={() => setStep(2)} className="px-6 py-3 border rounded-xl font-bold">Back</button>
                            <button onClick={() => setStep(4)} className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold">Review & Finish <ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="p-10 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black">Plan Confirmed</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">All clinical findings and prescriptions are ready to be finalized. A dispensing slip will be generated for the pharmacy.</p>
                            <div className="pt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
                                <div className="p-4 bg-background border rounded-2xl">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Next Visit</p>
                                    <p className="font-black mt-1">Mar 16, 2026</p>
                                </div>
                                <div className="p-4 bg-background border rounded-2xl">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Adherence</p>
                                    <p className="font-black mt-1 text-emerald-600">Excellent</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="text-[11px] font-black text-amber-700 uppercase tracking-wider">Patient Counseling Needed</p>
                                <p className="text-[11px] text-amber-600">Counsel on salt reduction and adherence to Losartan due to persistent BP &gt; 140/90.</p>
                            </div>
                        </div>
                        <div className="pt-8 flex justify-between">
                            <button onClick={() => setStep(3)} className="px-6 py-3 border rounded-xl font-bold">Back</button>
                            <button className="flex items-center gap-2 px-10 py-3 bg-primary text-primary-foreground rounded-xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                <Save className="h-5 w-5" /> Finalize Consultation
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
