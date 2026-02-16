import { ArrowRightLeft } from 'lucide-react';

export function Referrals() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Cross-Program Referrals</h1>
                    <p className="text-muted-foreground">Manage patient referrals between HP, HO, and HSS programs.</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 bg-card border rounded-xl shadow-sm">
                    <h3 className="font-bold mb-2">Incoming Referrals</h3>
                    <p className="text-3xl font-black text-primary">0</p>
                    <p className="text-xs text-muted-foreground mt-1">Pending acknowledgment</p>
                </div>
                <div className="p-6 bg-card border rounded-xl shadow-sm">
                    <h3 className="font-bold mb-2">Outgoing Referrals</h3>
                    <p className="text-3xl font-black text-primary">0</p>
                    <p className="text-xs text-muted-foreground mt-1">Sent this month</p>
                </div>
                <div className="p-6 bg-card border rounded-xl shadow-sm">
                    <h3 className="font-bold mb-2">Completed</h3>
                    <p className="text-3xl font-black text-primary">0</p>
                    <p className="text-xs text-muted-foreground mt-1">Successfully closed</p>
                </div>
            </div>

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-bold text-sm uppercase tracking-wider">Recent Referral Activity</h3>
                </div>
                <div className="p-8 text-center">
                    <p className="text-muted-foreground italic">No referral records found for your program.</p>
                </div>
            </div>
        </div>
    );
}
