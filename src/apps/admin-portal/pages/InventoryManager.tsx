import { useState } from 'react';
import {
    Package, Plus, Search, Filter, AlertTriangle,
    ArrowDownToLine, ArrowUpFromLine, RefreshCw, BarChart3,
    Edit3, Trash2, History, CheckCircle2
} from 'lucide-react';

export function InventoryManager() {
    const [searchTerm, setSearchTerm] = useState('');

    const stock = [
        { id: '1', name: 'Amlodipine 5mg', category: 'Antihypertensive', shelf: 'A-101', stock: 4500, min: 1000, unit: 'Tablets', status: 'In Stock' },
        { id: '2', name: 'Metformin 500mg', category: 'Antidiabetic', shelf: 'B-202', stock: 8200, min: 2000, unit: 'Tablets', status: 'In Stock' },
        { id: '3', name: 'Losartan 50mg', category: 'Antihypertensive', shelf: 'A-103', stock: 850, min: 1000, unit: 'Tablets', status: 'Low Stock' },
        { id: '4', name: 'Atorvastatin 10mg', category: 'Lipid Lowering', shelf: 'C-301', stock: 1200, min: 500, unit: 'Tablets', status: 'In Stock' },
        { id: '5', name: 'Gliclazide 80mg', category: 'Antidiabetic', shelf: 'B-205', stock: 0, min: 500, unit: 'Tablets', status: 'Out of Stock' },
    ];

    const filteredStock = stock.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="page-header flex justify-between items-end">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Package className="h-8 w-8 text-primary" />
                        Pharmacy Inventory
                    </h1>
                    <p className="page-subtitle">Track essential NCD medication stock and facility distributions</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        <Plus className="h-4 w-4" /> Add Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Items', value: '42', icon: Package, color: 'text-primary' },
                    { label: 'Low Stock Alerts', value: '3', icon: AlertTriangle, color: 'text-amber-500' },
                    { label: 'Out of Stock', value: '1', icon: Trash2, color: 'text-red-500' },
                    { label: 'Total Value', value: '৳124,500', icon: BarChart3, color: 'text-emerald-500' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <p className="text-xl font-black">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 items-center bg-card p-4 rounded-xl border border-border/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search medications, categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-muted/30 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted/50 transition-all">
                    <Filter className="h-4 w-4" /> Filter
                </button>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/50 text-left border-b border-border/50">
                            <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Medication Name</th>
                            <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Category</th>
                            <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Shelf Loc</th>
                            <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Stock Level</th>
                            <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                            <th className="py-4 px-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredStock.map(item => (
                            <tr key={item.id} className="hover:bg-muted/5 transition-colors group">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground leading-none">{item.name}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">{item.unit}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="px-2 py-1 rounded bg-muted text-[10px] font-bold text-muted-foreground uppercase">{item.category}</span>
                                </td>
                                <td className="py-4 px-6 font-mono font-bold text-muted-foreground text-[11px]">{item.shelf}</td>
                                <td className="py-4 px-6 font-black tabular-nums">{item.stock.toLocaleString()}</td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.status === 'In Stock' ? 'bg-emerald-500' :
                                                item.status === 'Low Stock' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                                            }`} />
                                        <span className={`text-[11px] font-black uppercase tracking-wider ${item.status === 'In Stock' ? 'text-emerald-600' :
                                                item.status === 'Low Stock' ? 'text-amber-600' : 'text-red-600'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><ArrowDownToLine className="h-4 w-4" /></button>
                                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit3 className="h-4 w-4" /></button>
                                        <button className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl border border-border/50 p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" /> Recent Movements
                    </h3>
                    <div className="space-y-4">
                        {[
                            { type: 'IN', item: 'Amlodipine 5mg', qty: '+5000', facility: 'Central Store', date: '2h ago' },
                            { type: 'OUT', item: 'Metformin 500mg', qty: '-300', facility: 'Camp 1W HP', date: '4h ago' },
                            { type: 'OUT', item: 'Losartan 50mg', qty: '-120', facility: 'Camp 04 HO', date: 'Yesterday' },
                        ].map((move, i) => (
                            <div key={i} className="flex justify-between items-center bg-muted/20 p-3 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${move.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {move.type === 'IN' ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold leading-none">{move.item}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{move.facility}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs font-black ${move.type === 'IN' ? 'text-emerald-600' : 'text-foreground'}`}>{move.qty}</p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">{move.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border/50 p-6 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h4 className="text-lg font-black tracking-tight">Sync Status</h4>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">All facility stock levels are currently synchronized with the central server.</p>
                    <button className="mt-6 flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted/50 transition-all">
                        <RefreshCw className="h-3.5 w-3.5" /> Force Sync
                    </button>
                </div>
            </div>
        </div>
    );
}
