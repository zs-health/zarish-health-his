import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
    user: {
        id: string;
        role: string;
    };
    filters?: {
        program?: string;
        data_type?: string;
        date_from?: string;
        date_to?: string;
    };
    format?: 'csv' | 'json';
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { user, filters, format = 'csv' }: ExportRequest = await req.json();

        const { data: userProfile, error: profileError } = await supabase
            .from('user_roles')
            .select('role, program, permissions')
            .eq('user_id', user.id)
            .single();

        if (profileError || !userProfile) {
            return new Response(JSON.stringify({ error: 'User profile not found' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const canExport = userProfile.permissions?.analytics?.export === true ||
            ['super_admin', 'admin', 'management', 'me_officer', 'researcher', 'hp_coordinator', 'ho_coordinator'].includes(userProfile.role);

        if (!canExport) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        let data: any[] = [];
        const dataType = filters?.data_type || 'patients';

        if (userProfile.role === 'researcher') {
            if (dataType === 'patients') {
                let query = supabase.from('analytics.patients_deidentified').select('*');
                if (filters?.program && filters.program !== 'all') {
                    query = query.eq('registered_program', filters.program);
                }
                if (filters?.date_from) {
                    query = query.gte('registration_date', filters.date_from);
                }
                if (filters?.date_to) {
                    query = query.lte('registration_date', filters.date_to);
                }
                const result = await query;
                data = result.data || [];
            } else if (dataType === 'ncd_outcomes') {
                const result = await supabase.from('analytics.ncd_outcomes_by_program').select('*');
                data = result.data || [];
            } else if (dataType === 'program_summary') {
                const result = await supabase.from('analytics.program_summary').select('*');
                data = result.data || [];
            }
        } else {
            if (dataType === 'patients') {
                let query = supabase.from('patients').select('*').is('deleted_at', null);
                
                if (userProfile.program && userProfile.program !== 'all_programs') {
                    query = query.eq('registered_program', userProfile.program);
                }
                if (filters?.program && filters.program !== 'all') {
                    query = query.eq('registered_program', filters.program);
                }
                if (filters?.date_from) {
                    query = query.gte('registration_date', filters.date_from);
                }
                if (filters?.date_to) {
                    query = query.lte('registration_date', filters.date_to);
                }
                const result = await query;
                data = result.data || [];
            } else if (dataType === 'encounters') {
                let query = supabase.from('encounters').select('*');
                if (filters?.date_from) {
                    query = query.gte('visit_date', filters.date_from);
                }
                if (filters?.date_to) {
                    query = query.lte('visit_date', filters.date_to);
                }
                const result = await query;
                data = result.data || [];
            } else if (dataType === 'ncd_enrollments') {
                let query = supabase.from('ncd_enrollments').select('*');
                if (filters?.date_from) {
                    query = query.gte('enrollment_date', filters.date_from);
                }
                if (filters?.date_to) {
                    query = query.lte('enrollment_date', filters.date_to);
                }
                const result = await query;
                data = result.data || [];
            }
        }

        if (format === 'csv') {
            const csv = convertToCSV(data);
            return new Response(csv, {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="zarish-export-${dataType}-${Date.now()}.csv"`,
                },
            });
        }

        return new Response(JSON.stringify(data), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

function convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
        headers.map(h => {
            let val = row[h];
            if (typeof val === 'object') val = JSON.stringify(val);
            if (val === null || val === undefined) val = '';
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
}
