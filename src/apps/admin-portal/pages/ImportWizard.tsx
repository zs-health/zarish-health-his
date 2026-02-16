import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/shared/lib/supabase';
import { generateMRN } from '@/shared/lib/utils';
import {
    Upload, FileSpreadsheet, CheckCircle, AlertTriangle,
    ArrowRight, X, Download, Eye
} from 'lucide-react';

interface ImportResult {
    total: number;
    success: number;
    errors: { row: number; message: string }[];
}

export function ImportWizard() {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const targetFields = [
        { key: 'given_name', label: 'Given Name', required: true },
        { key: 'family_name', label: 'Family Name', required: true },
        { key: 'date_of_birth', label: 'Date of Birth', required: true },
        { key: 'sex', label: 'Sex', required: true },
        { key: 'origin', label: 'Origin', required: true },
        { key: 'phone_primary', label: 'Phone', required: false },
        { key: 'fcn', label: 'FCN', required: false },
        { key: 'progress_id', label: 'Progress ID', required: false },
        { key: 'legacy_ncd_number', label: 'Legacy NCD #', required: false },
        { key: 'father_name', label: 'Father Name', required: false },
        { key: 'mother_name', label: 'Mother Name', required: false },
        { key: 'camp_name', label: 'Camp Name', required: false },
        { key: 'block', label: 'Block', required: false },
    ];

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);

        Papa.parse(f, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setHeaders(results.meta.fields || []);
                setParsedData(results.data as Record<string, unknown>[]);
                // Auto-map headers
                const autoMap: Record<string, string> = {};
                const fields = results.meta.fields || [];
                targetFields.forEach(({ key }) => {
                    const match = fields.find(h =>
                        h.toLowerCase().replace(/[_\s-]/g, '') === key.replace(/_/g, '')
                    );
                    if (match) autoMap[key] = match;
                });
                setMapping(autoMap);
                setStep(2);
            },
        });
    }, []);

    const handleImport = async () => {
        setImporting(true);
        const errors: { row: number; message: string }[] = [];
        let success = 0;

        for (let i = 0; i < parsedData.length; i++) {
            try {
                const row = parsedData[i];
                const patient: Record<string, unknown> = { mrn: generateMRN() };

                for (const [targetKey, sourceHeader] of Object.entries(mapping)) {
                    if (sourceHeader && row[sourceHeader] !== undefined && row[sourceHeader] !== '') {
                        patient[targetKey] = row[sourceHeader];
                    }
                }

                if (!patient.given_name || !patient.family_name || !patient.date_of_birth || !patient.sex) {
                    errors.push({ row: i + 2, message: 'Missing required fields' });
                    continue;
                }

                const { error } = await supabase.from('patients').insert(patient);
                if (error) {
                    errors.push({ row: i + 2, message: error.message });
                } else {
                    success++;
                }
            } catch (e) {
                errors.push({ row: i + 2, message: e instanceof Error ? e.message : 'Unknown error' });
            }
        }

        setResult({ total: parsedData.length, success, errors });
        setImporting(false);
        setStep(4);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <h1 className="page-title flex items-center gap-2">
                    <Upload className="h-8 w-8" />
                    Data Import Wizard
                </h1>
                <p className="page-subtitle">Import patient data from CSV files</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8">
                {['Upload File', 'Map Fields', 'Preview', 'Complete'].map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 ? 'bg-emerald-500 text-white' :
                                step === i + 1 ? 'bg-primary text-primary-foreground' :
                                    'bg-muted text-muted-foreground'
                            }`}>
                            {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className={`text-sm font-medium ${step >= i + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {label}
                        </span>
                        {i < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />}
                    </div>
                ))}
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
                <div
                    className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                >
                    <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    <FileSpreadsheet className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                    <p className="mt-4 text-lg font-medium">Drop a CSV file or click to upload</p>
                    <p className="text-sm text-muted-foreground mt-1">Supports .csv files up to 10MB</p>
                    <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                        Choose File
                    </button>
                </div>
            )}

            {/* Step 2: Field Mapping */}
            {step === 2 && (
                <div className="form-section">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="form-section-title"><FileSpreadsheet className="h-5 w-5 text-primary" /> Map CSV Columns</h3>
                        <span className="text-sm text-muted-foreground">{file?.name} · {parsedData.length} rows</span>
                    </div>
                    <div className="space-y-3">
                        {targetFields.map(({ key, label, required }) => (
                            <div key={key} className="flex items-center gap-4">
                                <div className="w-48 text-sm font-medium flex items-center gap-1">
                                    {label} {required && <span className="text-red-500">*</span>}
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <select
                                    value={mapping[key] || ''}
                                    onChange={(e) => setMapping(prev => ({ ...prev, [key]: e.target.value }))}
                                    className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                >
                                    <option value="">— Skip —</option>
                                    {headers.map(h => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setStep(1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-muted/50">Back</button>
                        <button onClick={() => setStep(3)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2">
                            <Eye className="h-4 w-4" /> Preview
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
                <div className="form-section">
                    <h3 className="form-section-title">Preview (first 5 rows)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 px-3 text-left font-medium">#</th>
                                    {targetFields.filter(f => mapping[f.key]).map(f => (
                                        <th key={f.key} className="py-2 px-3 text-left font-medium">{f.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.slice(0, 5).map((row, i) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                                        <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                                        {targetFields.filter(f => mapping[f.key]).map(f => (
                                            <td key={f.key} className="py-2 px-3">{String(row[mapping[f.key]] || '—')}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">Total: {parsedData.length} records will be imported</p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setStep(2)} className="px-4 py-2 border rounded-lg text-sm hover:bg-muted/50">Back</button>
                        <button onClick={handleImport} disabled={importing} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                            <Upload className="h-4 w-4" /> {importing ? 'Importing...' : 'Start Import'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Results */}
            {step === 4 && result && (
                <div className="form-section">
                    <div className="text-center py-8">
                        {result.errors.length === 0 ? (
                            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
                        ) : (
                            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
                        )}
                        <h3 className="text-xl font-bold mt-4">Import Complete</h3>
                        <p className="text-muted-foreground mt-1">
                            {result.success} of {result.total} records imported successfully
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="stat-card text-center">
                            <p className="text-2xl font-bold text-foreground">{result.total}</p>
                            <p className="text-xs text-muted-foreground">Total Records</p>
                        </div>
                        <div className="stat-card text-center">
                            <p className="text-2xl font-bold text-emerald-600">{result.success}</p>
                            <p className="text-xs text-muted-foreground">Imported</p>
                        </div>
                        <div className="stat-card text-center">
                            <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                            <p className="text-xs text-muted-foreground">Errors</p>
                        </div>
                    </div>

                    {result.errors.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                <X className="h-4 w-4 text-red-500" /> Error Details
                            </h4>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                                {result.errors.map((err, i) => (
                                    <div key={i} className="text-xs text-red-600 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                                        Row {err.row}: {err.message}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center gap-3 mt-6">
                        <button onClick={() => { setStep(1); setFile(null); setParsedData([]); setResult(null); }} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2">
                            <Download className="h-4 w-4" /> Import Another File
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
