import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateMRN() {
    return 'ZH-' + Math.random().toString(36).substring(2, 9).toUpperCase();
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

        const results = {
            total: patients.length,
            success: 0,
            errors: [] as any[]
        }

        for (let i = 0; i < patients.length; i++) {
            const p = patients[i];
            const rowNum = i + 2;

            try {
                // 1. Validation
                if (!p.given_name || !p.family_name || !p.date_of_birth || !p.sex || !p.origin) {
                    throw new Error(`Row ${rowNum}: Missing required fields (Given/Family Name, DOB, Sex, Origin)`);
                }

                if (p.origin === 'Bangladeshi' && p.national_id) {
                    const len = String(p.national_id).length;
                    if (![10, 13, 17].includes(len)) {
                        throw new Error(`Row ${rowNum}: Bangladeshi NID must be 10, 13, or 17 digits`);
                    }
                }

                // 2. Prepare Patient Data
                const patientData = {
                    mrn: p.mrn || generateMRN(),
                    given_name: p.given_name,
                    family_name: p.family_name,
                    middle_name: p.middle_name || null,
                    full_name_bn: p.full_name_bn || null,
                    date_of_birth: p.date_of_birth,
                    sex: p.sex,
                    origin: p.origin,
                    marital_status: p.marital_status || null,
                    phone_primary: p.phone_primary || null,
                    fcn: p.fcn || null,
                    progress_id: p.progress_id || null,
                    ghc_number: p.ghc_number || null,
                    legacy_ncd_number: p.legacy_ncd_number || null,
                    father_name: p.father_name || null,
                    mother_name: p.mother_name || null,
                    is_pregnant: p.is_pregnant === 'true' || p.is_pregnant === true,
                    is_vulnerable: p.is_vulnerable === 'true' || p.is_vulnerable === true,
                };

                // 3. Insert Patient
                const { data: patient, error: pError } = await supabaseClient
                    .from('patients')
                    .insert(patientData)
                    .select()
                    .single();

                if (pError) throw pError;

                // 4. Prepare Address Data
                const addressData = {
                    patient_id: patient.id,
                    address_type: p.origin === 'Rohingya' ? 'camp' : 'current',
                    camp_name: p.camp_name || null,
                    block: p.block || null,
                    new_sub_block: p.new_sub_block || null,
                    household_number: p.household_number || null,
                    shelter_number: p.shelter_number || null,
                    division: p.division || null,
                    district: p.district || null,
                    upazila: p.upazila || null,
                    village: p.village || null,
                };

                // 5. Insert Address
                const { error: aError } = await supabaseClient
                    .from('addresses')
                    .insert(addressData);

                if (aError) throw aError;

                results.success++;
            } catch (err: any) {
                results.errors.push({ row: rowNum, message: err.message });
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
