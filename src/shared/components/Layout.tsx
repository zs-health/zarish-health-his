import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAppStore } from '@/shared/stores/appStore';
import { cn } from '@/shared/lib/utils';
import {
    LayoutDashboard,
    Search,
    UserPlus,
    Stethoscope,
    HeartPulse,
    ClipboardList,
    Building2,
    Users,
    Upload,
    BarChart3,
    Download,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    Activity,
    User,
    Home,
    ArrowRightLeft,
} from 'lucide-react';

const providerNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patients/search', icon: Search, label: 'Patient Search' },
    { to: '/patients/register', icon: UserPlus, label: 'Register Patient' },
    { to: '/encounters/new', icon: Stethoscope, label: 'New Encounter' },
    { to: '/ncd/enrollment', icon: HeartPulse, label: 'NCD Enrollment' },
    { to: '/ncd/followup', icon: ClipboardList, label: 'NCD Follow-up' },
    { to: '/coordination/referrals', icon: ArrowRightLeft, label: 'Referrals', program: ['HP', 'HO'] },
    { to: '/coordination/home-visits', icon: Home, label: 'Home Visits', program: ['HO'] },
    { to: '/profile', icon: User, label: 'Account Security' },
];

const adminNavItems = [
    { to: '/admin/facilities', icon: Building2, label: 'Facilities' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/import', icon: Upload, label: 'Import Data' },
    { to: '/admin/export', icon: Download, label: 'Data Export' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

export function Layout() {
    const { user, userRole, signOut } = useAuth();
    const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const NavItem = ({ to, icon: Icon, label }: { to: string; icon: typeof LayoutDashboard; label: string }) => (
        <NavLink
            to={to}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                )
            }
        >
            <Icon className="h-4.5 w-4.5 flex-shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
        </NavLink>
    );

    const { userProgram } = useAppStore();

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <h1 className="text-base font-bold tracking-tight">ZARISH HEALTH {userProgram ? `(${userProgram})` : ''}</h1>
                            <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Hospital Information System</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {!sidebarCollapsed && (
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-3 mb-2">
                        Clinical
                    </p>
                )}
                {providerNavItems.filter(item => {
                    if (!item.program) return true;
                    return userProgram && item.program.includes(userProgram);
                }).map((item) => (
                    <NavItem key={item.to} {...item} />
                ))}

                <div className="my-4 border-t border-sidebar-border" />

                {!sidebarCollapsed && (['super_admin', 'admin', 'facility_manager', 'viewer', 'data_entry'].includes(userRole || '')) && (
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-3 mb-2">
                        Administration
                    </p>
                )}
                {adminNavItems.filter(item => {
                    // Show all admin items to super_admin and admin
                    if (userRole === 'super_admin' || userRole === 'admin') return true;
                    // Show Export and Reports to facility_manager, viewer, data_entry
                    if (['Data Export', 'Reports'].includes(item.label)) return true;
                    // Hide facilities and user management for non-admins
                    if (['Facilities', 'User Management', 'Import Data'].includes(item.label)) return false;
                    return true;
                }).map((item) => (
                    <NavItem key={item.to} {...item} />
                ))}
            </nav>

            {/* User */}
            <div className="p-3 border-t border-sidebar-border">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-xs font-bold text-white">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{user?.email || 'User'}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{userRole?.replace('_', ' ') || 'Guest'}</p>
                        </div>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Collapse toggle (desktop only) */}
            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex absolute top-20 -right-3 w-6 h-6 rounded-full bg-card border shadow-sm items-center justify-center hover:bg-accent/10 transition-colors"
            >
                <ChevronLeft className={cn('h-3 w-3 transition-transform', sidebarCollapsed && 'rotate-180')} />
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile menu toggle */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border shadow-md"
            >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:sticky top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300',
                    sidebarCollapsed ? 'w-[68px]' : 'w-64',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                <div className="relative h-full">
                    <SidebarContent />
                </div>
            </aside>

            {/* Main content */}
            <main className={cn('flex-1 min-h-screen transition-all duration-300')}>
                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
