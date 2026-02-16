import { useState } from 'react';
import {
    Clock, CheckCircle2, User, Pill, ArrowRight,
    Search, AlertCircle, Printer, Check
} from 'lucide-react';

export function DispensingView() {
    const [searchTerm, setSearchTerm] = useState('');

    const pendingOrders = [
        { id: '1', patient: 'Abul Zarish', mrn: 'ZH-2026-0001', medications: ['Amlodipine 5mg', 'Metformin 500mg'], time: '10m ago', urgent: true },
        { id: '2', patient: 'Zarish Khatun', mrn: 'ZH-2026-0042', medications: ['Losartan 50mg'], time: '25m ago', urgent: false },
        { id: '3', patient: 'John Doe', mrn: 'ZH-2026-0105', medications: ['Atorvastatin 10mg', 'Amlodipine 5mg'], time: '1h ago', urgent: false },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="page-header">
                <h1 className="page-title flex items-center gap-2">
                    <Pill className="h-8 w-8 text-primary" />
                    Dispensing Queue
                </h1>
                <p className="page-subtitle">Process clinical prescriptions and issue medications to patients</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Queue */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-card p-4 rounded-xl border border-border/50 flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input
                            type="text" placeholder="Search queue..."
                            className="bg-transparent border-none text-sm outline-none w-full"
                        />
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-2">Pending Orders ({pendingOrders.length})</p>
                        {pendingOrders.map(order => (
                            <div key={order.id} className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-md ${order.urgent ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' : 'bg-card hover:border-primary/50'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center font-black text-xs text-primary">
                                            {order.patient.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm">{order.patient}</p>
                                            <p className="text-[10px] text-muted-foreground">{order.mrn}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {order.time}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {order.medications.map((m, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-background border rounded text-[9px] font-bold uppercase text-muted-foreground">{m}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Processing View */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                        <div className="p-6 border-b border-border/50 bg-muted/20 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Abul Zarish</h3>
                                    <p className="text-xs text-muted-foreground font-medium">MRN: ZH-2026-0001 · Encounter ID: E-48210</p>
                                </div>
                            </div>
                            <button className="p-2.5 border rounded-xl hover:bg-muted/50 transition-all text-muted-foreground">
                                <Printer className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 p-8 space-y-8">
                            <div className="space-y-4">
                                <p className="text-[11px] font-black uppercase text-muted-foreground tracking-widest border-b pb-2">Prescribed Items</p>

                                <div className="space-y-3">
                                    {[
                                        { drug: 'Amlodipine 5mg Tab', freq: '1+0+0', dur: '30 Days', qty: '30 Tabs', stock: '4,500' },
                                        { drug: 'Metformin 500mg Tab', freq: '1+0+1', dur: '30 Days', qty: '60 Tabs', stock: '8,200' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="p-5 bg-muted/10 border border-border/50 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center text-emerald-500">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-base">{item.drug}</p>
                                                    <div className="flex gap-4 mt-1">
                                                        <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> {item.freq}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-muted-foreground uppercase">|</span>
                                                        <span className="text-[11px] font-bold text-muted-foreground uppercase">{item.dur}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black">{item.qty}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1 font-bold">Avail: {item.stock}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                                <div>
                                    <p className="text-[11px] font-black text-amber-700 uppercase tracking-wider">Clinical Notes for Counseling</p>
                                    <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                                        Patient reported mild dizziness with previous dose. Explain correct timing (morning) and emphasize consistency.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border/50 bg-muted/5 flex justify-end gap-3">
                            <button className="px-6 py-3 border rounded-xl font-bold hover:bg-muted font-mono uppercase text-xs">Correction Needed</button>
                            <button className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                <Check className="h-5 w-5" /> Mark as Dispensed
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
