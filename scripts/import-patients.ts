import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import * as fs from 'fs';

const supabaseUrl = 'https://twofvzzietlvfhjsjtnv.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3b2Z2enppZXRsdmZoanNqdG52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUyMTk5MiwiZXhwIjoyMDg1MDk3OTkyfQ.umxXX5qRfyRKe22es6z688ML7A9uz6Sp81QkzxSg13c';

const supabase = createClient(supabaseUrl, serviceKey);

const DATA_DIR = '/home/ariful/Downloads/files (3)';

async function importHBSPatients() {
    console.log('📂 Importing HBS Patients...');
    const file = fs.readFileSync(`${DATA_DIR}/HBS_01_Patients.csv`, 'utf-8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
    
    const patients = data.map((row: any) => ({
        mrn: row.Patient_ID || `HBS-${row.Legacy_Ref_ID}`,
        given_name: row.Given_Name,
        family_name: row.Family_Name,
        middle_name: row.Middle_Name || null,
        date_of_birth: row.Date_of_Birth,
        age_years: parseInt(row.Age_at_Registration) || null,
        sex: row.Sex === 'Male' ? 'Male' : row.Sex === 'Female' ? 'Female' : 'Other',
        origin: row.Nationality === 'FDMN' ? 'Rohingya' : 'Bangladeshi',
        marital_status: row.Marital_Status || null,
        phone_primary: row.Phone_Primary || null,
        father_name: row.Father_Name || null,
        mother_name: row.Mother_Name || null,
        spouse_name: row.Spouse_Name || null,
        national_id: row.National_ID || null,
        emergency_contact_name: row.Emergency_Contact_Name || null,
        emergency_contact_phone: row.Emergency_Contact_Phone || null,
        patient_status: row.Status === 'Active' ? 'active' : 'inactive',
        is_vulnerable: false,
        is_pregnant: false,
        registration_date: new Date().toISOString().split('T')[0],
    }));

   
    const batchSize = 100;
    let imported = 0;
    for (let i = 0; i < patients.length; i += batchSize) {
        const batch = patients.slice(i, i + batchSize);
        const { error } = await supabase.from('patients').upsert(batch, { onConflict: 'mrn' });
        if (error) console.error('Error:', error.message);
        else {
            imported += batch.length;
            console.log(`Imported ${imported}/${patients.length}`);
        }
    }
    console.log(`✅ HBS Patients imported: ${imported}`);
    return imported;
}

async function importNCDPatients() {
    console.log('📂 Importing NCD Patients...');
    const file = fs.readFileSync(`${DATA_DIR}/NCD_01_Patients.csv`, 'utf-8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
    
    const patients = data.map((row: any) => ({
        mrn: row.Patient_ID || `NCD-${row.Legacy_NCD_Number}`,
        legacy_ncd_number: row.Legacy_NCD_Number || null,
        given_name: row.Given_Name,
        family_name: row.Family_Name,
        middle_name: row.Middle_Name || null,
        date_of_birth: row.Date_of_Birth,
        age_years: parseInt(row.Age_at_Registration) || null,
        sex: row.Sex === 'Male' ? 'Male' : row.Sex === 'Female' ? 'Female' : 'Other',
        origin: row.Nationality === 'FDMN' ? 'Rohingya' : 'Bangladeshi',
        marital_status: row.Marital_Status || null,
        phone_primary: row.Phone_Primary || null,
        father_name: row.Father_Name || null,
        mother_name: row.Mother_Name || null,
        spouse_name: row.Spouse_Name || null,
        national_id: row.National_ID || null,
        fcn: row.FCN || null,
        progress_id: row.Progress_ID || null,
        ghc_number: row.GHC_Number || null,
        emergency_contact_name: row.Emergency_Contact_Name || null,
        emergency_contact_phone: row.Emergency_Contact_Phone || null,
        patient_status: row.Status === 'Active' ? 'active' : 'inactive',
        is_vulnerable: false,
        is_pregnant: false,
        registration_date: new Date().toISOString().split('T')[0],
    }));

    const batchSize = 100;
    let imported = 0;
    for (let i = 0; i < patients.length; i += batchSize) {
        const batch = patients.slice(i, i + batchSize);
        const { error } = await supabase.from('patients').upsert(batch, { onConflict: 'mrn' });
        if (error) console.error('Error:', error.message);
        else {
            imported += batch.length;
            console.log(`Imported ${imported}/${patients.length}`);
        }
    }
    console.log(`✅ NCD Patients imported: ${imported}`);
    return imported;
}

async function importHBSAddresses() {
    console.log('📂 Importing HBS Addresses...');
    const file = fs.readFileSync(`${DATA_DIR}/HBS_02_Addresses.csv`, 'utf-8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });

    // First get patient IDs
    const { data: patients } = await supabase.from('patients').select('id, mrn');
    const patientMap = new Map(patients?.map(p => [p.mrn, p.id]) || []);

    const addresses = data.map((row: any) => ({
        patient_id: patientMap.get(row.Patient_ID),
        address_type: 'current',
        camp_name: row.Camp_Name || null,
        block: row.Block || null,
        village: row.Village || null,
        division: row.Division || null,
        district: row.District || null,
        upazila: row.Upazila || null,
    })).filter(a => a.patient_id);

    const { error } = await supabase.from('addresses').upsert(addresses, { onConflict: 'patient_id' });
    if (error) console.error('Address Error:', error.message);
    else console.log(`✅ HBS Addresses imported: ${addresses.length}`);
}

async function importNCDAddresses() {
    console.log('📂 Importing NCD Addresses...');
    const file = fs.readFileSync(`${DATA_DIR}/NCD_02_Addresses.csv`, 'utf-8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });

    const { data: patients } = await supabase.from('patients').select('id, mrn');
    const patientMap = new Map(patients?.map(p => [p.mrn, p.id]) || []);

    const addresses = data.map((row: any) => ({
        patient_id: patientMap.get(row.Patient_ID),
        address_type: 'current',
        camp_name: row.Camp_Name || null,
        block: row.Block || null,
        village: row.Village || null,
    })).filter(a => a.patient_id);

    const { error } = await supabase.from('addresses').upsert(addresses, { onConflict: 'patient_id' });
    if (error) console.error('Address Error:', error.message);
    else console.log(`✅ NCD Addresses imported: ${addresses.length}`);
}

async function main() {
    console.log('🚀 Starting Import...\n');
    
    const hbsCount = await importHBSPatients();
    const ncdCount = await importNCDPatients();
    await importHBSAddresses();
    await importNCDAddresses();
    
    console.log(`\n✅ TOTAL PATIENTS IMPORTED: ${hbsCount + ncdCount}`);
}

main();
