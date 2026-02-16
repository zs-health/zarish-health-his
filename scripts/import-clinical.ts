import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import * as fs from 'fs';

const supabaseUrl = 'https://twofvzzietlvfhjsjtnv.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3b2Z2enppZXRsdmZoanNqdG52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUyMTk5MiwiZXhwIjoyMDg1MDk3OTkyfQ.umxXX5qRfyRKe22es6z688ML7A9uz6Sp81QkzxSg13c';

const supabase = createClient(supabaseUrl, serviceKey);

const DATA_DIR = '/home/ariful/Downloads/files (3)';

// Get facility ID for CPI HP Camp 1W
let facilityId = '479e9d37-e1fa-4596-abee-3d0b4390adf5';

async function getPatientMap() {
    const { data } = await supabase.from('patients').select('id, mrn');
    return new Map(data?.map(p => [p.mrn, p.id]) || []);
}

async function importHBSVisits() {
    console.log('📂 Importing HBS Visits...');
    const file = fs.readFileSync(`${DATA_DIR}/HBS_03_Visits.csv`, 'utf-8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
    const patientMap = await getPatientMap();

    const encounters = data.slice(0, 5000).map((row: any) => ({
        patient_id: patientMap.get(row.Patient_ID),
        facility_id: facilityId,
        encounter_type: row.Visit_Type || 'OPD',
        visit_date: row.Visit_Date || new Date().toISOString().split('T')[0],
        chief_complaint: row.Chief_Complaint || null,
        clinical_impression: row.Clinical_Findings || null,
        treatment_plan: row.Treatment || null,
        encounter_status: 'completed',
        provider_name: row.Provider || null,
    })).filter(e => e.patient_id);

    // Insert in batches
    const batchSize = 100;
    let imported = 0;
    for (let i = 0; i < encounters.length; i += batchSize) {
        const batch = encounters.slice(i, i + batchSize);
        const { error } = await supabase.from('encounters').insert(batch);
        if (error) console.log('Error:', error.message.slice(0, 50));
        else {
            imported += batch.length;
            if (imported % 500 === 0) console.log(`Imported ${imported}/${encounters.length}`);
        }
    }
    console.log(`✅ HBS Visits imported: ${imported}`);
}

async function importHBSVitals() {
    console.log('📂 Importing HBS Vital Signs...');
    const file = fs.readFileSync(`${DATA_DIR}/HBS_04_Vital_Signs.csv`, 'utf-8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
    const patientMap = await getPatientMap();

    const vitals = data.slice(0, 10000).map((row: any) => ({
        patient_id: patientMap.get(row.Patient_ID),
        measurement_date: row.Measurement_Date || new Date().toISOString().split('T')[0],
        systolic_bp: row.Systolic_BP ? parseInt(row.Systolic_BP) : null,
        diastolic_bp: row.Diastolic_BP ? parseInt(row.Diastolic_BP) : null,
        heart_rate_bpm: row.Pulse ? parseInt(row.Pulse) : null,
        temperature_celsius: row.Temperature ? parseFloat(row.Temperature) : null,
        weight_kg: row.Weight ? parseFloat(row.Weight) : null,
        height_cm: row.Height ? parseFloat(row.Height) : null,
    })).filter(v => v.patient_id && (v.systolic_bp || v.heart_rate_bpm || v.temperature_celsius));

    const batchSize = 100;
    let imported = 0;
    for (let i = 0; i < vitals.length; i += batchSize) {
        const batch = vitals.slice(i, i + batchSize);
        const { error } = await supabase.from('vital_signs').insert(batch);
        if (error) console.log('Error:', error.message.slice(0, 50));
        else {
            imported += batch.length;
            if (imported % 1000 === 0) console.log(`Imported ${imported}/${vitals.length}`);
        }
    }
    console.log(`✅ HBS Vital Signs imported: ${imported}`);
}

async function importNCDVisits() {
    console.log('📂 Importing NCD Visits...');
    const file = fs.readFileSync(`${DATA_DIR}/NCD_03_Visits.csv`, 'utf-8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
    const patientMap = await getPatientMap();

    const encounters = data.map((row: any) => ({
        patient_id: patientMap.get(row.Patient_ID),
        facility_id: facilityId,
        encounter_type: 'NCD Review',
        visit_date: row.Visit_Date || new Date().toISOString().split('T')[0],
        chief_complaint: row.Chief_Complaint || null,
        clinical_impression: row.Assessment || null,
        encounter_status: 'completed',
    })).filter((e: any) => e.patient_id);

    const { error } = await supabase.from('encounters').insert(encounters);
    if (error) console.log('Error:', error.message);
    else console.log(`✅ NCD Visits imported: ${encounters.length}`);
}

async function importNCDEnrollments() {
    console.log('📂 Importing NCD Enrollments...');
    const file = fs.readFileSync(`${DATA_DIR}/NCD_03_Visits.csv`, 'utf-8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
    const patientMap = await getPatientMap();

    // Get unique patients with NCD
    const ncdPatients = [...new Set(data.map((r: any) => r.Patient_ID))];
    
    const enrollments = ncdPatients.map((mrn: string) => ({
        patient_id: patientMap.get(mrn),
        facility_id: facilityId,
        ncd_type: ['Hypertension', 'Diabetes'],
        primary_ncd: 'Hypertension',
        enrollment_date: new Date().toISOString().split('T')[0],
        enrollment_source: 'Import',
        program_status: 'active',
    })).filter(e => e.patient_id);

    const { error } = await supabase.from('ncd_enrollments').upsert(enrollments, { onConflict: 'patient_id' });
    if (error) console.log('Error:', error.message);
    else console.log(`✅ NCD Enrollments imported: ${enrollments.length}`);
}

async function main() {
    console.log('🚀 Starting Clinical Data Import...\n');
    await importHBSVisits();
    await importHBSVitals();
    await importNCDVisits();
    await importNCDEnrollments();
    console.log('\n✅ Clinical data import complete!');
}

main();
