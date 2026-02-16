import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { updateEmail, updatePassword } from '@/shared/lib/auth';
import { User, Mail, Lock, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ProfilePage() {
    const { user, userRole } = useAuth();
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await updateEmail(newEmail);
            setMessage({ type: 'success', text: 'Email update initiated. Please check both your old and new emails for verification.' });
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update email' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            await updatePassword(newPassword);
            setMessage({ type: 'success', text: 'Password updated successfully' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl">
            <div className="page-header">
                <h1 className="page-title flex items-center gap-2">
                    <User className="h-8 w-8 text-primary" />
                    Account Security
                </h1>
                <p className="page-subtitle">Manage your professional credentials and authorization level</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border animate-slide-up ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-destructive/5 text-destructive border-destructive/10'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Info */}
                <div className="space-y-4">
                    <div className="bg-card p-6 rounded-2xl border shadow-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-3xl text-primary border-4 border-white shadow-inner mb-4">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="font-bold text-lg leading-tight">{user?.email}</h3>
                            <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Shield className="h-3 w-3" />
                                {userRole?.replace('_', ' ')}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">User ID</span>
                                <span className="font-mono text-muted-foreground/60">{user?.id.substring(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Joined</span>
                                <span className="font-medium">{new Date(user?.created_at || '').toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 flex gap-4">
                        <Shield className="h-6 w-6 text-amber-600 shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-900">2FA Security</h4>
                            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                Multi-factor authentication adds an extra layer of protection to your clinical workstation.
                            </p>
                            <button disabled className="mt-3 text-[10px] font-bold text-amber-800 uppercase tracking-widest opacity-50 cursor-not-allowed">
                                Coming Soon
                            </button>
                        </div>
                    </div>
                </div>

                {/* Forms */}
                <div className="md:col-span-2 space-y-6">
                    {/* Update Email */}
                    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-muted/30">
                            <h3 className="font-bold flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                Change Email Address
                            </h3>
                        </div>
                        <form onSubmit={handleUpdateEmail} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Email Address</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    required
                                    className="w-full bg-muted/30 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="new.email@cpintl.org"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !newEmail}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Request Email Change'}
                            </button>
                        </form>
                    </div>

                    {/* Update Password */}
                    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-muted/30">
                            <h3 className="font-bold flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary" />
                                Update Professional Password
                            </h3>
                        </div>
                        <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="w-full bg-muted/30 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="w-full bg-muted/30 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !newPassword}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Update Security Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
