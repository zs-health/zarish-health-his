import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/shared/lib/supabase';
import {
    Upload, FileSpreadsheet, CheckCircle, AlertTriangle,
    ArrowRight, X, Download, Eye, Loader2
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
        // Personal
        { key: 'given_name', label: 'Given Name', required: true },
        { key: 'family_name', label: 'Family Name', required: true },
        { key: 'middle_name', label: 'Middle Name', required: false },
        { key: 'full_name_bn', label: 'Bengali Name', required: false },
        { key: 'date_of_birth', label: 'DOB (YYYY-MM-DD)', required: true },
        { key: 'sex', label: 'Sex (Male/Female/Other)', required: true },
        { key: 'origin', label: 'Origin (Rohingya/Bangladeshi)', required: true },
        // Identifiers
        { key: 'national_id', label: 'NID / Birth Cert', required: false },
        { key: 'fcn', label: 'FCN/MRC/Token #', required: false },
        { key: 'progress_id', label: 'Progress ID', required: false },
        { key: 'ghc_number', label: 'GHC Number', required: false },
        { key: 'legacy_ncd_number', label: 'Legacy NCD #', required: false },
        // Contact / Family
        { key: 'phone_primary', label: 'Primary Phone', required: false },
        { key: 'father_name', label: 'Father Name', required: false },
        { key: 'mother_name', label: 'Mother Name', required: false },
        // Address (Rohingya)
        { key: 'camp_name', label: 'Camp Name', required: false },
        { key: 'block', label: 'Block', required: false },
        { key: 'new_sub_block', label: 'Sub-Block', required: false },
        // Address (Bangladeshi)
        { key: 'district', label: 'District', required: false },
        { key: 'upazila', label: 'Upazila', required: false },
        { key: 'village', label: 'Union/Village', required: false },
    ];

    const downloadTemplate = () => {
        const headers = targetFields.map(f => f.key);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "zarish_patient_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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

        // Prepare data for edge function
        const patientsToImport = parsedData.map(row => {
            const patient: Record<string, unknown> = {};
            for (const [targetKey, sourceHeader] of Object.entries(mapping)) {
                if (sourceHeader && row[sourceHeader] !== undefined && row[sourceHeader] !== '') {
                    patient[targetKey] = row[sourceHeader];
                }
            }
            return patient;
        });

        try {
            const { data, error } = await supabase.functions.invoke('import-patients', {
                body: { patients: patientsToImport }
            });

            if (error) throw error;
            setResult(data as ImportResult);
            setStep(4);
        } catch (e) {
            console.error('Import failed', e);
            alert('Import failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header flex justify-between items-end">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Upload className="h-8 w-8 text-primary" />
                        Data Import Wizard
                    </h1>
                    <p className="page-subtitle">Standardized migration tool for bulk patient data</p>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted/50 transition-all"
                >
                    <Download className="h-4 w-4" /> Download Template
                </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8 bg-muted/30 p-4 rounded-xl">
                {['Upload File', 'Map Fields', 'Preview', 'Complete'].map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1 ? 'bg-emerald-500 text-white' :
                            step === i + 1 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' :
                                'bg-muted text-muted-foreground'
                            }`}>
                            {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className={`text-sm font-medium ${step >= i + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {label}
                        </span>
                        {i < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground/30 mx-2" />}
                    </div>
                ))}
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
                <div
                    className="border-2 border-dashed rounded-2xl p-20 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    onClick={() => fileRef.current?.click()}
                >
                    <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <FileSpreadsheet className="h-10 w-10 text-primary" />
                    </div>
                    <p className="mt-6 text-xl font-semibold">Drop your patient CSV here</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                        Ensure your file follows the standardized template for successful validation. Max 10MB.
                    </p>
                    <button className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:translate-y-[-2px] active:translate-y-0 transition-all">
                        Browse Files
                    </button>
                </div>
            )}

            {/* Step 2: Field Mapping */}
            {step === 2 && (
                <div className="form-section shadow-xl border-t-4 border-t-primary">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileSpreadsheet className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Map CSV Columns</h3>
                                <p className="text-sm text-muted-foreground">{file?.name} · {parsedData.length} rows detected</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {targetFields.map(({ key, label, required }) => (
                            <div key={key} className="flex flex-col gap-1.5 p-3 rounded-lg border bg-muted/30">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    {label} {required && <span className="text-destructive">*</span>}
                                </label>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={mapping[key] || ''}
                                        onChange={(e) => setMapping(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                                    >
                                        <option value="">— Skip Field —</option>
                                        {headers.map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                    {mapping[key] ? (
                                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                                    ) : required ? (
                                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 mt-8 border-t pt-6">
                        <button onClick={() => setStep(1)} className="px-6 py-2.5 border rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors">
                            Cancel & Restart
                        </button>
                        <button onClick={() => setStep(3)} className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium shadow-lg shadow-primary/20 flex items-center gap-2 hover:translate-x-1 transition-all">
                            <Eye className="h-4 w-4" /> Next: Preview Data
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
                <div className="form-section shadow-xl border-t-4 border-t-primary">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold">Data Preview</h3>
                        <p className="text-sm text-muted-foreground">Review the first 5 rows before processing the full batch of {parsedData.length} records.</p>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-muted-foreground/20">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-muted/50 text-left border-b">
                                    <th className="py-3 px-4 font-bold border-r w-12 text-center">#</th>
                                    {targetFields.filter(f => mapping[f.key]).map(f => (
                                        <th key={f.key} className="py-3 px-4 font-bold">{f.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.slice(0, 5).map((row, i) => (
                                    <tr key={i} className="border-b last:border-0 hover:bg-primary/5 transition-colors">
                                        <td className="py-3 px-4 text-muted-foreground border-r text-center">{i + 1}</td>
                                        {targetFields.filter(f => mapping[f.key]).map(f => (
                                            <td key={f.key} className="py-3 px-4 whitespace-nowrap">{String(row[mapping[f.key]] || '—')}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 flex gap-4">
                        <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-100 italic">Pre-Import Warning</p>
                            <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                                This action will insert {parsedData.length} new records. Data will be validated for NID length and Origin-specific fields. Invalid rows will be skipped and reported.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                        <button onClick={() => setStep(2)} className="px-6 py-2.5 border rounded-xl text-sm font-medium hover:bg-muted/50">Back to Mapping</button>
                        <button
                            onClick={handleImport}
                            disabled={importing}
                            className="px-10 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center gap-2 disabled:opacity-50 hover:bg-emerald-700 transition-all"
                        >
                            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {importing ? 'Processing Batch...' : `Import ${parsedData.length} Records`}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Results */}
            {step === 4 && result && (
                <div className="form-section shadow-2xl border-t-4 border-t-emerald-500 animate-in fade-in zoom-in duration-300">
                    <div className="text-center py-10">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${result.errors.length === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            {result.errors.length === 0 ? (
                                <CheckCircle className="h-16 w-16" />
                            ) : (
                                <AlertTriangle className="h-16 w-16" />
                            )}
                        </div>
                        <h3 className="text-3xl font-extrabold tracking-tight">Import Summary</h3>
                        <p className="text-muted-foreground mt-2 text-lg">
                            {result.success} of {result.total} records were processed successfully.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="stat-card bg-muted/30 border-none shadow-none text-center p-8 rounded-2xl">
                            <p className="text-4xl font-black text-foreground">{result.total}</p>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-1">Total</p>
                        </div>
                        <div className="stat-card bg-emerald-50 dark:bg-emerald-900/10 border-none shadow-none text-center p-8 rounded-2xl">
                            <p className="text-4xl font-black text-emerald-600">{result.success}</p>
                            <p className="text-sm font-bold text-emerald-600/70 uppercase tracking-wider mt-1">Success</p>
                        </div>
                        <div className="stat-card bg-red-50 dark:bg-red-900/10 border-none shadow-none text-center p-8 rounded-2xl">
                            <p className="text-4xl font-black text-red-600">{result.errors.length}</p>
                            <p className="text-sm font-bold text-red-600/70 uppercase tracking-wider mt-1">Errors</p>
                        </div>
                    </div>

                    {result.errors.length > 0 && (
                        <div className="mt-10 border rounded-2xl overflow-hidden bg-muted/20">
                            <div className="bg-destructive/10 px-6 py-4 border-b flex items-center gap-3">
                                <X className="h-5 w-5 text-destructive" />
                                <h4 className="font-bold text-destructive">Error Log ({result.errors.length})</h4>
                            </div>
                            <div className="max-h-72 overflow-y-auto divide-y">
                                {result.errors.map((err, i) => (
                                    <div key={i} className="p-4 flex gap-4 hover:bg-destructive/5 transition-colors">
                                        <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded h-fit">ROW {err.row}</span>
                                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">{err.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center gap-4 mt-12 pt-8 border-t">
                        <button
                            onClick={() => { setStep(1); setFile(null); setParsedData([]); setResult(null); }}
                            className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/30 hover:translate-y-[-4px] active:translate-y-0 transition-all flex items-center gap-3"
                        >
                            <FileSpreadsheet className="h-6 w-6" /> Import Another Data Batch
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
