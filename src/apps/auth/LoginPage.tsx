import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail } from '@/shared/lib/auth';
import { useAppStore } from '@/shared/stores/appStore';
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAppStore();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('[Login] Already authenticated, redirecting...');
            navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log('[Login] Attempting login for:', email);
            await signInWithEmail(email, password);
            console.log('[Login] Login successful, redirecting...');
            navigate('/');
        } catch (err) {
            console.error('[Login] Login error:', err);
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    // const handleGoogleSignIn = async () => {
    //     try {
    //         await signInWithGoogle();
    //     } catch (err) {
    //         setError(err instanceof Error ? err.message : 'Google sign-in failed');
    //     }
    // };

    return (
        <div className="min-h-screen flex">
            {/* Left panel - branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50"></div>
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Activity className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">ZARISH HEALTH</h1>
                            <p className="text-white/80 text-sm font-medium tracking-wider uppercase">Professional Authorization Portal</p>
                        </div>
                    </div>
                    <p className="text-xl text-white/90 leading-relaxed max-w-md">
                        Bangladesh's secure HIS hub for specialized NCD management and patient care coordination.
                    </p>
                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-3 text-white/80">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">✓</div>
                            <span>Controlled Role-Based Access</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">✓</div>
                            <span>Unified patient records across CPI facilities</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">✓</div>
                            <span>Protected Health Information (PHI) encrypted</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel - form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">ZARISH HEALTH</h1>
                            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Professional Portal</p>
                        </div>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Staff Login
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Sign in with your clinical credentials to continue
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="input-group">
                            <label className="text-sm font-medium">Professional Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                    placeholder="name@zarish.health"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="text-sm font-medium">Secure Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-12 py-2.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {loading ? 'Verifying...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-background px-3 text-xs text-muted-foreground">Staff Login</span>
                        </div>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        Restricted Access Portal. Contact the IT Administrator for account provisioning.
                    </p>
                </div>
            </div>
        </div>
    );
}
