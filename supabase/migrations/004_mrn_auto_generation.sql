-- Add MRN auto-generation function and trigger
-- This will automatically generate MRN like MRN-2026-000001

-- Create sequence for MRN generation
CREATE SEQUENCE IF NOT EXISTS mrn_sequence START 1;

-- Create function to generate MRN
CREATE OR REPLACE FUNCTION generate_mrn()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    sequence_num TEXT;
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    sequence_num := LPAD(nextval('mrn_sequence')::TEXT, 6, '0');
    RETURN 'MRN-' || current_year || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- Update existing patients without MRN (if any)
UPDATE patients 
SET mrn = generate_mrn() 
WHERE mrn IS NULL OR mrn = '';
