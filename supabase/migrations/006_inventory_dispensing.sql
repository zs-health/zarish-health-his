-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Inventory and Dispensing Tables

-- Medications/Products table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_name TEXT NOT NULL,
    generic_name TEXT,
    formulation TEXT NOT NULL CHECK (formulation IN ('Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Patch', 'Other')),
    strength TEXT NOT NULL,
    unit TEXT DEFAULT 'Tablets',
    category TEXT NOT NULL,
    manufacturer TEXT,
    batch_number TEXT,
    expiry_date DATE,
    unit_cost NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES medications(id),
    facility_id UUID REFERENCES facilities(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER DEFAULT 100,
    last_restock_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(medication_id, facility_id)
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    encounter_id UUID REFERENCES encounters(id),
    facility_id UUID REFERENCES facilities(id),
    prescriber_id UUID REFERENCES auth.users(id),
    prescription_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'dispensed', 'cancelled')),
    notes TEXT,
    dispensed_by UUID REFERENCES auth.users(id),
    dispensed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prescription items table
CREATE TABLE IF NOT EXISTS prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id),
    medication_id UUID NOT NULL REFERENCES medications(id),
    quantity INTEGER NOT NULL,
    dosage_instructions TEXT,
    frequency TEXT,
    duration_days INTEGER,
    is_dispensed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read medications" ON medications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read inventory" ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read prescriptions" ON prescriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read prescription items" ON prescription_items FOR SELECT TO authenticated USING (true);

-- Seed some sample medications
INSERT INTO medications (drug_name, generic_name, formulation, strength, unit, category) VALUES
    ('Amlodipine', 'Amlodipine Besylate', 'Tablet', '5mg', 'Tablets', 'Antihypertensive'),
    ('Amlodipine', 'Amlodipine Besylate', 'Tablet', '10mg', 'Tablets', 'Antihypertensive'),
    ('Metformin', 'Metformin HCl', 'Tablet', '500mg', 'Tablets', 'Antidiabetic'),
    ('Metformin', 'Metformin HCl', 'Tablet', '850mg', 'Tablets', 'Antidiabetic'),
    ('Losartan', 'Losartan Potassium', 'Tablet', '25mg', 'Tablets', 'Antihypertensive'),
    ('Losartan', 'Losartan Potassium', 'Tablet', '50mg', 'Tablets', 'Antihypertensive'),
    ('Atorvastatin', 'Atorvastatin Calcium', 'Tablet', '10mg', 'Tablets', 'Lipid Lowering'),
    ('Atorvastatin', 'Atorvastatin Calcium', 'Tablet', '20mg', 'Tablets', 'Lipid Lowering'),
    ('Gliclazide', 'Gliclazide', 'Tablet', '80mg', 'Tablets', 'Antidiabetic'),
    ('Amlodipine', 'Amlodipine Besylate', 'Tablet', '5mg', 'Tablets', 'Antihypertensive')
ON CONFLICT DO NOTHING;
