import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';

export function DebugPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [session, setSession] = useState<any>(null);
    const [userRole, setUserRole] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toISOString()} - ${msg}`]);
    };

    useEffect(() => {
        const runDiagnostics = async () => {
            addLog('Starting diagnostics...');
            
            // 1. Check Supabase connection
            addLog('1. Checking Supabase connection...');
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    addLog(`   ERROR: ${error.message}`);
                } else {
                    addLog(`   Session exists: ${!!data.session}`);
                    setSession(data.session);
                    if (data.session?.user) {
                        addLog(`   User: ${data.session.user.email}`);
                    }
                }
            } catch (e: any) {
                addLog(`   ERROR: ${e.message}`);
            }

            // 2. Check user_roles table
            addLog('2. Checking user_roles table...');
            try {
                const { data: roles, error } = await supabase
                    .from('user_roles')
                    .select('*')
                    .limit(10);
                
                if (error) {
                    addLog(`   ERROR: ${error.message}`);
                } else {
                    addLog(`   Found ${roles?.length || 0} roles`);
                    setUserRole(roles);
                }
            } catch (e: any) {
                addLog(`   ERROR: ${e.message}`);
            }

            // 3. Check auth.users
            addLog('3. Checking auth.users...');
            try {
                // Note: We can't directly query auth.users from client, but we can try
                const { data: rolesData } = await supabase
                    .from('user_roles')
                    .select('user_id')
                    .limit(10);
                addLog(`   Found ${rolesData?.length || 0} user role records`);
                setUsers(rolesData || []);
            } catch (e: any) {
                addLog(`   ERROR: ${e.message}`);
            }

            // 4. Check RLS on user_roles
            addLog('4. Checking RLS policies on user_roles...');
            try {
                // Try a simple query that should work with RLS
                const { data: testData, error: testError } = await supabase
                    .from('user_roles')
                    .select('role')
                    .limit(1);
                
                if (testError) {
                    addLog(`   RLS ERROR: ${testError.message}`);
                } else {
                    addLog(`   RLS OK - can read user_roles`);
                }
            } catch (e: any) {
                addLog(`   RLS ERROR: ${e.message}`);
            }

            addLog('Diagnostics complete!');
        };

        runDiagnostics();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-2xl font-bold mb-4">ZARISH HEALTH - Auth Diagnostics</h1>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Logs</h2>
                    <div className="bg-black p-4 rounded-lg font-mono text-sm h-96 overflow-auto">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1">{log}</div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-2">Session</h2>
                    <pre className="bg-black p-4 rounded-lg font-mono text-sm overflow-auto mb-4">
                        {JSON.stringify(session, null, 2)}
                    </pre>

                    <h2 className="text-lg font-semibold mb-2">User Roles in DB</h2>
                    <pre className="bg-black p-4 rounded-lg font-mono text-sm overflow-auto">
                        {JSON.stringify(userRole, null, 2)}
                    </pre>
                </div>
            </div>

            <div className="mt-4">
                <a href="/login" className="text-blue-400 hover:underline">Go to Login</a>
            </div>
        </div>
    );
}
