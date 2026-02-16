-- Auto-generate MRN on patient insert
CREATE OR REPLACE FUNCTION set_patient_mrn()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mrn IS NULL OR NEW.mrn = '' THEN
        NEW.mrn := 'MRN-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('mrn_sequence')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_patient_mrn ON patients;
CREATE TRIGGER trigger_set_patient_mrn
    BEFORE INSERT ON patients
    FOR EACH ROW
    EXECUTE FUNCTION set_patient_mrn();
