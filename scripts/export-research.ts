import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = 'https://twofvzzietlvfhjsjtnv.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3b2Z2enppZXRsdmZoanNqdG52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUyMTk5MiwiZXhwIjoyMDg1MDk3OTkyfQ.umxXX5qRfyRKe22es6z688ML7A9uz6Sp81QkzxSg13c';

const supabase = createClient(supabaseUrl, serviceKey);

const EXPORT_DIR = '/home/ariful/Downloads';

async function exportAllData() {
    console.log('📥 Exporting all data for researcher...\n');

    // Export Patients
    console.log('📄 Exporting Patients...');
    const { data: patients } = await supabase.from('patients').select('*');
    fs.writeFileSync(`${EXPORT_DIR}/research_patients.csv`, convertToCSV(patients || []));
    console.log(`   ✅ Exported ${patients?.length || 0} patients`);

    // Export Addresses
    console.log('📄 Exporting Addresses...');
    const { data: addresses } = await supabase.from('addresses').select('*');
    fs.writeFileSync(`${EXPORT_DIR}/research_addresses.csv`, convertToCSV(addresses || []));
    console.log(`   ✅ Exported ${addresses?.length || 0} addresses`);

    // Export Vital Signs
    console.log('📄 Exporting Vital Signs...');
    const { data: vitals } = await supabase.from('vital_signs').select('*');
    fs.writeFileSync(`${EXPORT_DIR}/research_vital_signs.csv`, convertToCSV(vitals || []));
    console.log(`   ✅ Exported ${vitals?.length || 0} vital signs`);

    // Export NCD Enrollments
    console.log('📄 Exporting NCD Enrollments...');
    const { data: ncd } = await supabase.from('ncd_enrollments').select('*');
    fs.writeFileSync(`${EXPORT_DIR}/research_ncd_enrollments.csv`, convertToCSV(ncd || []));
    console.log(`   ✅ Exported ${ncd?.length || 0} NCD enrollments`);

    // Export Follow-up Visits
    console.log('📄 Exporting Follow-up Visits...');
    const { data: followups } = await supabase.from('follow_up_visits').select('*');
    fs.writeFileSync(`${EXPORT_DIR}/research_follow_ups.csv`, convertToCSV(followups || []));
    console.log(`   ✅ Exported ${followups?.length || 0} follow-ups`);

    // Export Full JSON for Research
    console.log('📄 Exporting Full Research Dataset (JSON)...');
    const researchData = {
        export_date: new Date().toISOString(),
        total_patients: patients?.length || 0,
        total_addresses: addresses?.length || 0,
        total_vital_signs: vitals?.length || 0,
        total_ncd_enrollments: ncd?.length || 0,
        patients: patients,
        addresses: addresses,
        vital_signs: vitals,
        ncd_enrollments: ncd,
    };
    fs.writeFileSync(`${EXPORT_DIR}/research_full_dataset.json`, JSON.stringify(researchData, null, 2));
    console.log(`   ✅ Exported full dataset`);

    console.log('\n✅ All data exported to Downloads folder!');
    console.log('\n📁 Export Files:');
    console.log(`   - research_patients.csv`);
    console.log(`   - research_addresses.csv`);
    console.log(`   - research_vital_signs.csv`);
    console.log(`   - research_ncd_enrollments.csv`);
    console.log(`   - research_follow_ups.csv`);
    console.log(`   - research_full_dataset.json`);
}

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

exportAllData();
