import { cn } from '@/shared/lib/utils';
import { AlertTriangle, CheckCircle, Pill, ArrowRight, AlertCircle } from 'lucide-react';

interface HypertensionProtocolProps {
    systolic?: number;
    diastolic?: number;
    isPregnant?: boolean;
    onPrescribe?: (protocol: string, medications: MedItem[]) => void;
}

interface MedItem {
    drug: string;
    dose: string;
    frequency: string;
}

export function HypertensionProtocol({ systolic, diastolic, isPregnant, onPrescribe }: HypertensionProtocolProps) {
    if (!systolic || !diastolic) {
        return (
            <div className="protocol-card border-muted">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">Record blood pressure to see protocol recommendations</p>
                </div>
            </div>
        );
    }

    if (isPregnant && (systolic >= 140 || diastolic >= 90)) {
        return (
            <div className="protocol-card-danger">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400">URGENT REFERRAL REQUIRED</h3>
                </div>
                <p className="text-sm text-red-700/80 dark:text-red-400/80 ml-8">
                    Pregnant patient with hypertension — immediate referral to obstetric care is required.
                </p>
            </div>
        );
    }

    if (systolic >= 180 || diastolic >= 120) {
        return (
            <div className="protocol-card-danger">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Hypertensive Crisis</h3>
                </div>
                <p className="text-sm text-red-700/80 dark:text-red-400/80">
                    SBP ≥180 mmHg or DBP ≥120 mmHg — <strong>IMMEDIATE REFERRAL</strong>
                </p>
                <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mt-2">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        Current BP: {systolic}/{diastolic} mmHg
                    </p>
                </div>
            </div>
        );
    }

    if (systolic >= 160 || diastolic >= 100) {
        const medications: MedItem[] = [
            { drug: 'Amlodipine', dose: '2.5-5 mg', frequency: 'Once daily' },
            { drug: 'Losartan', dose: '50 mg', frequency: 'Once daily' },
        ];

        return (
            <div className="protocol-card-danger">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Hypertension Protocol II</h3>
                    </div>
                    <span className="badge-danger">Severe</span>
                </div>
                <p className="text-sm text-muted-foreground ml-8">
                    SBP ≥160 mmHg or DBP ≥100 mmHg — Current: {systolic}/{diastolic} mmHg
                </p>

                <div className="ml-8 space-y-3 mt-3">
                    <div>
                        <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                            <Pill className="h-4 w-4 text-primary" /> Initial Treatment (2 drugs):
                        </h4>
                        {medications.map(med => (
                            <div key={med.drug} className="flex items-center gap-2 text-sm py-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="font-medium">{med.drug}</span>
                                <span className="text-muted-foreground">{med.dose} — {med.frequency}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-3">
                        <h4 className="text-sm font-semibold mb-2">Escalation Path:</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="bg-muted px-2 py-1 rounded">1 month</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>If target not met: ↑ Losartan 100 mg</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>Add HCTZ 12.5-25 mg</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="font-semibold text-red-600">REFER</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onPrescribe?.('Hypertension Protocol II', medications)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
                    >
                        Start Protocol II
                    </button>
                </div>
            </div>
        );
    }

    if (systolic >= 140 || diastolic >= 90) {
        const medications: MedItem[] = [
            { drug: 'Amlodipine', dose: '2.5-5 mg', frequency: 'Once daily' },
        ];

        return (
            <div className="protocol-card-warning">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-amber-600" />
                        <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400">Hypertension Protocol I</h3>
                    </div>
                    <span className="badge-warning">Stage 1</span>
                </div>
                <p className="text-sm text-muted-foreground ml-8">
                    SBP 140-159 mmHg or DBP 90-99 mmHg — Current: {systolic}/{diastolic} mmHg
                </p>

                <div className="ml-8 space-y-3 mt-3">
                    <div>
                        <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                            <Pill className="h-4 w-4 text-primary" /> Initial Treatment (1 drug):
                        </h4>
                        {medications.map(med => (
                            <div key={med.drug} className="flex items-center gap-2 text-sm py-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="font-medium">{med.drug}</span>
                                <span className="text-muted-foreground">{med.dose} — {med.frequency}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-3">
                        <h4 className="text-sm font-semibold mb-2">Escalation Path:</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="bg-muted px-2 py-1 rounded">1 month</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>If target not met: ↑ Amlodipine 10 mg</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="font-semibold text-amber-600">REFER</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onPrescribe?.('Hypertension Protocol I', medications)}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20"
                    >
                        Start Protocol I
                    </button>
                </div>
            </div>
        );
    }

    if (systolic >= 130 || diastolic >= 80) {
        return (
            <div className="protocol-card border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold text-amber-700 dark:text-amber-400">Elevated Blood Pressure</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                    BP {systolic}/{diastolic} mmHg — Lifestyle modifications recommended. Recheck in 3-6 months.
                </p>
            </div>
        );
    }

    return (
        <div className="protocol-card-success">
            <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Normal Blood Pressure</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-7">
                BP {systolic}/{diastolic} mmHg — Within normal range. Annual screening recommended.
            </p>
        </div>
    );
}
