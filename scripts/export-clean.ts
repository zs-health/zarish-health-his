import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = 'https://twofvzzietlvfhjsjtnv.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3b2Z2enppZXRsdmZoanNqdG52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUyMTk5MiwiZXhwIjoyMDg1MDk3OTkyfQ.umxXX5qRfyRKe22es6z688ML7A9uz6Sp81QkzxSg13c';

const supabase = createClient(supabaseUrl, serviceKey);

const EXPORT_DIR = '/home/ariful/Downloads';

function cleanValue(val: any): string {
    if (val === null || val === undefined || val === 'null') return '';
    if (typeof val === 'object') return JSON.stringify(val).replace(/"/g, '');
    return String(val);
}

function convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
        headers.map(h => {
            let val = cleanValue(row[h]);
            return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
}

async function exportPatientsCSV() {
    console.log('📄 Exporting Patients...');
    const { data } = await supabase.from('patients').select('*');
    
    // Clean and format for donor reporting
    const cleanData = (data || []).map(p => ({
        MRN: p.mrn,
        'Given Name': p.given_name,
        'Family Name': p.family_name,
        'Date of Birth': p.date_of_birth,
        Age: p.age_years,
        Sex: p.sex,
        Origin: p.origin,
        'Marital Status': p.marital_status || '',
        Phone: p.phone_primary || '',
        'Father Name': p.father_name || '',
        'Mother Name': p.mother_name || '',
        'Spouse Name': p.spouse_name || '',
        'National ID': p.national_id || '',
        FCN: p.fcn || '',
        'Progress ID': p.progress_id || '',
        'GHC Number': p.ghc_number || '',
        'Legacy NCD #': p.legacy_ncd_number || '',
        Vulnerable: p.is_vulnerable ? 'Yes' : 'No',
        Pregnant: p.is_pregnant ? 'Yes' : 'No',
        Status: p.patient_status,
        'Registration Date': p.registration_date,
    }));
    
    fs.writeFileSync(`${EXPORT_DIR}/01_patients.csv`, convertToCSV(cleanData));
    console.log(`   ✅ ${cleanData.length} patients`);
}

async function exportVitalsCSV() {
    console.log('📄 Exporting Vital Signs...');
    const { data } = await supabase.from('vital_signs').select('*');
    
    const cleanData = (data || []).map(v => ({
        'Measurement Date': v.measurement_date,
        'Systolic BP': v.systolic_bp || '',
        'Diastolic BP': v.diastolic_bp || '',
        'Heart Rate': v.heart_rate_bpm || '',
        Temperature: v.temperature_celsius || '',
        'Respiratory Rate': v.respiratory_rate || '',
        'SpO2': v.oxygen_saturation || '',
        Height: v.height_cm || '',
        Weight: v.weight_kg || '',
        BMI: v.bmi || '',
        Glucose: v.blood_glucose_mmol_l || '',
        'Glucose Type': v.glucose_test_type || '',
    }));
    
    fs.writeFileSync(`${EXPORT_DIR}/02_vital_signs.csv`, convertToCSV(cleanData));
    console.log(`   ✅ ${cleanData.length} vital signs`);
}

async function exportNCDEnrollmentsCSV() {
    console.log('📄 Exporting NCD Enrollments...');
    const { data } = await supabase.from('ncd_enrollments').select('*');
    
    const cleanData = (data || []).map(n => ({
        'NCD Type': (n.ncd_type || []).join('; '),
        'Primary NCD': n.primary_ncd,
        'Enrollment Date': n.enrollment_date,
        Source: n.enrollment_source,
        Status: n.program_status,
        'BP Systolic': n.initial_bp_systolic || '',
        'BP Diastolic': n.initial_bp_diastolic || '',
        Glucose: n.initial_blood_glucose || '',
        HbA1c: n.initial_hba1c || '',
        'Tobacco Use': n.tobacco_use ? 'Yes' : 'No',
        'Alcohol Use': n.alcohol_use ? 'Yes' : 'No',
        'Family History CVD': n.family_history_cvd ? 'Yes' : 'No',
        'Family History Diabetes': n.family_history_diabetes ? 'Yes' : 'No',
    }));
    
    fs.writeFileSync(`${EXPORT_DIR}/03_ncd_enrollments.csv`, convertToCSV(cleanData));
    console.log(`   ✅ ${cleanData.length} enrollments`);
}

async function exportEncountersCSV() {
    console.log('📄 Exporting Encounters...');
    const { data } = await supabase.from('encounters').select('*');
    
    const cleanData = (data || []).map(e => ({
        'Visit Date': e.visit_date,
        'Encounter Type': e.encounter_type,
        'Chief Complaint': e.chief_complaint || '',
        'Clinical Impression': e.clinical_impression || '',
        'Treatment Plan': e.treatment_plan || '',
        'Follow-up Required': e.follow_up_required ? 'Yes' : 'No',
        'Follow-up Date': e.follow_up_date || '',
        Referral: e.referral_required ? 'Yes' : 'No',
        Status: e.encounter_status,
        Provider: e.provider_name || '',
    }));
    
    fs.writeFileSync(`${EXPORT_DIR}/04_encounters.csv`, convertToCSV(cleanData));
    console.log(`   ✅ ${cleanData.length} encounters`);
}

async function generateDonorReport() {
    console.log('📊 Generating Donor Report...');
    
    const [{ data: patients }, { data: vitals }, { data: ncd }, { data: encounters }] = await Promise.all([
        supabase.from('patients').select('*'),
        supabase.from('vital_signs').select('*'),
        supabase.from('ncd_enrollments').select('*'),
        supabase.from('encounters').select('*'),
    ]);

    const totalPatients = patients?.length || 0;
    const rohingyaPatients = patients?.filter(p => p.origin === 'Rohongiya').length || 0;
    const bangladeshiPatients = patients?.filter(p => p.origin === 'Bangladeshi').length || 0;
    const malePatients = patients?.filter(p => p.sex === 'Male').length || 0;
    const femalePatients = patients?.filter(p => p.sex === 'Female').length || 0;
    const totalVitals = vitals?.length || 0;
    const totalNCD = ncd?.length || 0;
    const activeNCD = ncd?.filter(n => n.program_status === 'active').length || 0;
    const totalEncounters = encounters?.length || 0;

    // High BP patients (systolic > 140 or diastolic > 90)
    const highBP = vitals?.filter(v => (v.systolic_bp && v.systolic_bp > 140) || (v.diastolic_bp && v.diastolic_bp > 90)).length || 0;
    
    // Diabetic glucose (fasting > 7.0 mmol/L or random > 11.1)
    const highGlucose = vitals?.filter(v => v.blood_glucose_mmol_l && v.blood_glucose_mmol_l > 7.0).length || 0;

    const report = `
================================================================================
                    ZARISH HEALTH INFORMATION SYSTEM
                    DONOR REPORT - ${new Date().toISOString().split('T')[0]}
================================================================================

EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
Total Registered Patients:        ${totalPatients}
Total Clinical Encounters:       ${totalEncounters}
Total Vital Signs Recorded:       ${totalVitals}
Total NCD Enrollments:           ${totalNCD}
  - Active NCD Patients:          ${activeNCD}

PATIENT DEMOGRAPHICS
--------------------------------------------------------------------------------
By Origin:
  - Rohingya (FDMN):             ${rohingyaPatients} (${((rohingyaPatients/totalPatients)*100).toFixed(1)}%)
  - Bangladeshi:                  ${bangladeshiPatients} (${((bangladeshiPatients/totalPatients)*100).toFixed(1)}%)

By Gender:
  - Male:                        ${malePatients} (${((malePatients/totalPatients)*100).toFixed(1)}%)
  - Female:                      ${femalePatients} (${((femalePatients/totalPatients)*100).toFixed(1)}%)

CLINICAL METRICS
--------------------------------------------------------------------------------
Hypertension Indicators:
  - Patients with High BP:       ${highBP} (${((highBP/totalVitals)*100).toFixed(1)}% of readings)

Diabetes Indicators:
  - Patients with High Glucose:  ${highGlucose} (${((highGlucose/totalVitals)*100).toFixed(1)}% of readings)

FACILITIES COVERAGE
--------------------------------------------------------------------------------
  - CPI Health Post - Camp 1W
  - CPI Health Outreach - Camp 1W
  - CPI NCD Corner - Camp 1W
  - CPI Health Outreach - Camp 04

================================================================================
Report Generated: ${new Date().toISOString()}
ZARISH HEALTH HIS - Hospital Information System
================================================================================
`;
    
    fs.writeFileSync(`${EXPORT_DIR}/donor_report.txt`, report);
    console.log('   ✅ Donor report generated');
}

async function generateFormalReport() {
    console.log('📋 Generating Formal Report...');
    
    const [{ data: patients }, { data: vitals }, { data: ncd }] = await Promise.all([
        supabase.from('patients').select('*'),
        supabase.from('vital_signs').select('*'),
        supabase.from('ncd_enrollments').select('*'),
    ]);

    const report = {
        report_date: new Date().toISOString().split('T')[0],
        summary: {
            total_patients: patients?.length || 0,
            total_vital_signs: vitals?.length || 0,
            total_ncd_enrollments: ncd?.length || 0,
        },
        demographics: {
            by_origin: {
                rohingya: patients?.filter(p => p.origin === 'Rohingya').length || 0,
                bangladeshi: patients?.filter(p => p.origin === 'Bangladeshi').length || 0,
            },
            by_gender: {
                male: patients?.filter(p => p.sex === 'Male').length || 0,
                female: patients?.filter(p => p.sex === 'Female').length || 0,
            }
        },
        clinical_summary: {
            hypertension_high_bp: vitals?.filter(v => (v.systolic_bp && v.systolic_bp > 140)).length || 0,
            diabetes_high_glucose: vitals?.filter(v => v.blood_glucose_mmol_l && v.blood_glucose_mmol_l > 7.0).length || 0,
            active_ncd_patients: ncd?.filter(n => n.program_status === 'active').length || 0,
        }
    };
    
    fs.writeFileSync(`${EXPORT_DIR}/formal_report.json`, JSON.stringify(report, null, 2));
    console.log('   ✅ Formal report generated');
}

async function exportFullResearchJSON() {
    console.log('📦 Exporting Full Research Dataset...');
    
    const [patients, vitals, ncd, encounters, facilities] = await Promise.all([
        supabase.from('patients').select('*'),
        supabase.from('vital_signs').select('*'),
        supabase.from('ncd_enrollments').select('*'),
        supabase.from('encounters').select('*'),
        supabase.from('facilities').select('*'),
    ]);

    const researchData = {
        export_metadata: {
            export_date: new Date().toISOString(),
            system: 'ZARISH HEALTH HIS',
            version: '2.0',
        },
        summary: {
            total_patients: patients.data?.length || 0,
            total_vital_signs: vitals.data?.length || 0,
            total_ncd_enrollments: ncd.data?.length || 0,
            total_encounters: encounters.data?.length || 0,
            total_facilities: facilities.data?.length || 0,
        },
        patients: patients.data,
        vital_signs: vitals.data,
        ncd_enrollments: ncd.data,
        encounters: encounters.data,
        facilities: facilities.data,
    };
    
    fs.writeFileSync(`${EXPORT_DIR}/full_research_dataset.json`, JSON.stringify(researchData, null, 2));
    console.log(`   ✅ Full dataset exported (${(JSON.stringify(researchData).length/1024/1024).toFixed(2)} MB)`);
}

async function main() {
    console.log('\n🗂️  EXPORTING DATA FOR RESEARCH & DONOR REPORTING\n');
    console.log('=' .repeat(50));
    
    await exportPatientsCSV();
    await exportVitalsCSV();
    await exportNCDEnrollmentsCSV();
    await exportEncountersCSV();
    await generateDonorReport();
    await generateFormalReport();
    await exportFullResearchJSON();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL EXPORTS COMPLETE!');
    console.log('\n📁 Files in /home/ariful/Downloads/:');
    console.log('   - 01_patients.csv');
    console.log('   - 02_vital_signs.csv');
    console.log('   - 03_ncd_enrollments.csv');
    console.log('   - 04_encounters.csv');
    console.log('   - donor_report.txt');
    console.log('   - formal_report.json');
    console.log('   - full_research_dataset.json');
}

main();
