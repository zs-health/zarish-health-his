import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { patients } = await req.json()

        if (!Array.isArray(patients)) {
            throw new Error('Patients must be an array')
        }

        // Process in batches of 100 to avoid timeouts
        const results = {
            total: patients.length,
            success: 0,
            errors: [] as any[]
        }

        const batchSize = 100
        for (let i = 0; i < patients.length; i += batchSize) {
            const batch = patients.slice(i, i + batchSize)
            const { data, error } = await supabaseClient
                .from('patients')
                .insert(batch)
                .select()

            if (error) {
                results.errors.push({ batch: i / batchSize, message: error.message })
            } else {
                results.success += (data?.length ?? 0)
            }
        }

        return new Response(
            JSON.stringify(results),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
