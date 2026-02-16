import React, { useState, useMemo } from 'react';
import {
    Activity, Calculator, Info, AlertCircle, CheckCircle2,
    Thermometer, TrendingUp, Beaker, HelpCircle
} from 'lucide-react';

interface CVDInputs {
    age: number;
    sex: 'Male' | 'Female';
    smoking: boolean;
    systolicBP: number;
    isDiabetic: boolean;
    cholesterol?: number; // mmol/l
    bmi?: number;
    useLabBased: boolean;
}

export function CVDCalculator() {
    const [inputs, setInputs] = useState<CVDInputs>({
        age: 40,
        sex: 'Male',
        smoking: false,
        systolicBP: 120,
        isDiabetic: false,
        useLabBased: false,
        bmi: 22,
        cholesterol: 4.5
    });

    const riskResult = useMemo(() => {
        // This is a simplified logic representing the WHO/ISH SEAR B (South Asia) charts
        // In a production clinical system, this would use a precise lookup table or validated formula

        let score = 0;

        // Age weight
        if (inputs.age >= 70) score += 4;
        else if (inputs.age >= 60) score += 3;
        else if (inputs.age >= 50) score += 2;
        else if (inputs.age >= 40) score += 1;

        // Smoking
        if (inputs.smoking) score += 2;

        // BP weight
        if (inputs.systolicBP >= 180) score += 5;
        else if (inputs.systolicBP >= 160) score += 3;
        else if (inputs.systolicBP >= 140) score += 2;
        else if (inputs.systolicBP >= 120) score += 1;

        // Diabetes
        if (inputs.isDiabetic) score += 3;

        // Secondary Factor
        if (inputs.useLabBased && inputs.cholesterol) {
            if (inputs.cholesterol >= 7) score += 3;
            else if (inputs.cholesterol >= 6) score += 2;
            else if (inputs.cholesterol >= 5) score += 1;
        } else if (inputs.bmi) {
            if (inputs.bmi >= 30) score += 2;
            else if (inputs.bmi >= 25) score += 1;
        }

        // Map score to WHO Risk Categories
        if (score >= 12) return { category: 'Very High', color: 'text-red-700 bg-red-100', percent: '≥30%', risk: 'very-high' };
        if (score >= 9) return { category: 'High', color: 'text-orange-700 bg-orange-100', percent: '20-<30%', risk: 'high' };
        if (score >= 6) return { category: 'Moderate', color: 'text-amber-700 bg-amber-100', percent: '10-<20%', risk: 'moderate' };
        if (score >= 3) return { category: 'Low', color: 'text-emerald-700 bg-emerald-100', percent: '5-<10%', risk: 'low' };
        return { category: 'Very Low', color: 'text-emerald-700 bg-emerald-50', percent: '<5%', risk: 'minimal' };
    }, [inputs]);

    const updateInput = (key: keyof CVDInputs, value: any) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">CVD Risk Assessment</h3>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">WHO/ISH Chart - South Asia Region</p>
                        </div>
                    </div>
                    <div className="flex bg-muted p-1 rounded-lg">
                        <button
                            onClick={() => updateInput('useLabBased', false)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${!inputs.useLabBased ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                        >
                            Non-Lab (BMI)
                        </button>
                        <button
                            onClick={() => updateInput('useLabBased', true)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${inputs.useLabBased ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                        >
                            Lab-Based (CHOL)
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Age (40-80)</label>
                            <input
                                type="number"
                                value={inputs.age}
                                onChange={(e) => updateInput('age', parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-muted/30 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Biological Sex</label>
                            <div className="flex p-1 bg-muted/30 rounded-xl">
                                <button
                                    onClick={() => updateInput('sex', 'Male')}
                                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${inputs.sex === 'Male' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                                >
                                    Male
                                </button>
                                <button
                                    onClick={() => updateInput('sex', 'Female')}
                                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${inputs.sex === 'Female' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                                >
                                    Female
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground flex justify-between">
                            Systolic BP (mmHg)
                            <span className="text-primary">{inputs.systolicBP} mmHg</span>
                        </label>
                        <input
                            type="range" min="90" max="220"
                            value={inputs.systolicBP}
                            onChange={(e) => updateInput('systolicBP', parseInt(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Smoking Status</label>
                            <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={inputs.smoking}
                                    onChange={(e) => updateInput('smoking', e.target.checked)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                />
                                <span className="text-sm font-semibold">Current Smoker</span>
                            </label>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Diabetes Status</label>
                            <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={inputs.isDiabetic}
                                    onChange={(e) => updateInput('isDiabetic', e.target.checked)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                />
                                <span className="text-sm font-semibold">Diabetic</span>
                            </label>
                        </div>
                    </div>

                    {inputs.useLabBased ? (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground flex justify-between">
                                Total Cholesterol (mmol/l)
                                <span className="text-primary">{inputs.cholesterol} mmol/l</span>
                            </label>
                            <input
                                type="range" min="3" max="10" step="0.1"
                                value={inputs.cholesterol}
                                onChange={(e) => updateInput('cholesterol', parseFloat(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    ) : (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground flex justify-between">
                                Body Mass Index (BMI)
                                <span className="text-primary">{inputs.bmi} kg/m²</span>
                            </label>
                            <input
                                type="range" min="15" max="45" step="0.5"
                                value={inputs.bmi}
                                onChange={(e) => updateInput('bmi', parseFloat(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    )}
                </div>

                {/* Result */}
                <div className="bg-muted/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative border border-dashed border-border/60">
                    <div className="absolute top-4 right-4 group">
                        <HelpCircle className="h-4 w-4 text-muted-foreground/40 cursor-help" />
                        <div className="absolute right-0 top-6 w-48 p-2 bg-popover text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border">
                            This calculation represents the 10-year risk of a fatal or non-fatal major cardiovascular event.
                        </div>
                    </div>

                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Predicted 10-Year Risk</p>

                    <div className={`mt-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest ${riskResult.color} mb-4`}>
                        {riskResult.category} RISK
                    </div>

                    <div className="text-6xl font-black tracking-tighter text-foreground mb-2">
                        {riskResult.percent}
                    </div>

                    <div className="max-w-[200px] mt-4 space-y-4">
                        <div className="p-4 bg-background rounded-xl border shadow-sm flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Clinical Advice
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {riskResult.risk === 'very-high' || riskResult.risk === 'high'
                                    ? 'High intensity lifestyle advice and immediate pharmacological intervention recommended.'
                                    : 'Lifestyle modification advised. Re-assess in 6-12 months.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-muted/10 border-t border-border/50 flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <p className="text-[10px] text-muted-foreground font-medium italic">
                    Clinical Decision Support Tool - Should be validated against official WHO 2019 PDF charts for final diagnosis.
                </p>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
