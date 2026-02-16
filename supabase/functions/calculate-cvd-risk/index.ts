import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Simplified WHO/ISH CVD Risk Calculation for Bangladesh (SEAR D region)
 * This is an implementation of the simplified WHO CVD risk charts.
 */
function calculateCVDRisk(data: {
    age: number,
    sex: 'Male' | 'Female',
    systolicBP: number,
    isSmoker: boolean,
    hasDiabetes: boolean,
    cholesterol?: number
}) {
    const { age, sex, systolicBP, isSmoker, hasDiabetes } = data;

    // Logic simplified from WHO charts for SEAR-D (Bangladesh region)
    let riskScore = 0;

    // Base Risk based on age and BP
    if (age < 50) {
        if (systolicBP < 140) riskScore = 5;
        else if (systolicBP < 160) riskScore = 10;
        else riskScore = 15;
    } else if (age < 60) {
        if (systolicBP < 140) riskScore = 10;
        else if (systolicBP < 160) riskScore = 15;
        else riskScore = 20;
    } else {
        if (systolicBP < 140) riskScore = 15;
        else if (systolicBP < 160) riskScore = 20;
        else riskScore = 25;
    }

    // Multipliers for other risk factors
    if (isSmoker) riskScore += 5;
    if (hasDiabetes) riskScore += 10;
    if (sex === 'Male') riskScore += 2;

    // Determine category
    let category: 'Low' | 'Moderate' | 'High' | 'Very High' = 'Low';
    if (riskScore < 10) category = 'Low';
    else if (riskScore < 20) category = 'Moderate';
    else if (riskScore < 30) category = 'High';
    else category = 'Very High';

    return {
        riskScore,
        riskCategory: category,
        recommendations: getRecommendations(category)
    };
}

function getRecommendations(category: string) {
    switch (category) {
        case 'Very High':
            return ["Immediate clinical intervention required", "High-intensity statin therapy", "Strict BP control (<130/80)", "Monthly follow-up"];
        case 'High':
            return ["Intensive lifestyle modification", "Consider BP and Lipid lowering medication", "Target BP <130/80", "Follow-up every 1-3 months"];
        case 'Moderate':
            return ["Lifestyle modification", "Monitor BP and blood glucose regularly", "Follow-up every 3-6 months"];
        default:
            return ["Annual screening", "Maintain healthy diet and activity", "Tobacco cessation if applicable"];
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { patientData } = await req.json()
        const result = calculateCVDRisk(patientData)

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
