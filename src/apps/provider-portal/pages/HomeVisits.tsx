import { Home } from 'lucide-react';

export function HomeVisits() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Home Visits (HO)</h1>
                    <p className="text-muted-foreground">Track community outreach and home-based patient follow-ups.</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Home className="h-6 w-6 text-primary" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 bg-card border rounded-xl shadow-sm">
                    <h3 className="font-bold mb-2">Scheduled Visits</h3>
                    <p className="text-3xl font-black text-primary">0</p>
                    <p className="text-xs text-muted-foreground mt-1">For today</p>
                </div>
                <div className="p-6 bg-card border rounded-xl shadow-sm">
                    <h3 className="font-bold mb-2">Completed Visits</h3>
                    <p className="text-3xl font-black text-primary">0</p>
                    <p className="text-xs text-muted-foreground mt-1">This week</p>
                </div>
                <div className="p-6 bg-card border rounded-xl shadow-sm">
                    <h3 className="font-bold mb-2">Urgent Attention</h3>
                    <p className="text-3xl font-black text-destructive">0</p>
                    <p className="text-xs text-muted-foreground mt-1">Flagged by CHWs</p>
                </div>
            </div>

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-bold text-sm uppercase tracking-wider">Home Visit Log</h3>
                </div>
                <div className="p-8 text-center">
                    <p className="text-muted-foreground italic">No home visit records found.</p>
                </div>
            </div>
        </div>
    );
}
