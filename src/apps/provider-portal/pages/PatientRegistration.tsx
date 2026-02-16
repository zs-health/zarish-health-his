import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '@/shared/hooks/usePatient';
import { cn } from '@/shared/lib/utils';
import { UserPlus, User, Phone, MapPin, FileText, Shield, Save, ArrowLeft } from 'lucide-react';
import locationData from '@/shared/data/locations.json';

export function PatientRegistration() {
    const navigate = useNavigate();
    const { createPatient, loading, error } = usePatient();
    const [activeTab, setActiveTab] = useState('demographics');
    const [formData, setFormData] = useState({
        given_name: '', family_name: '', middle_name: '', full_name_bn: '',
        date_of_birth: '', sex: '' as string, origin: '' as string,
        marital_status: '', phone_primary: '', phone_secondary: '', email: '',
        father_name: '', mother_name: '', spouse_name: '',
        emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: '',
        national_id: '', blood_group: '',
        is_vulnerable: false, is_pregnant: false,
        registration_date: new Date().toISOString().split('T')[0],
        // Legacy IDs
        legacy_ncd_number: '', progress_id: '', ghc_number: '', fcn: '',
        fcn_type: 'FCN', // FCN, MRC, Token
        // Address
        address_type: 'current', camp_name: '', block: '', new_sub_block: '',
        household_number: '', shelter_number: '',
        division: '', district: '', upazila: '', village: '',
    });

    const updateField = (field: string, value: unknown) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Reset dependent fields
            if (field === 'origin') {
                newData.division = ''; newData.district = ''; newData.upazila = ''; newData.village = '';
                newData.camp_name = ''; newData.block = ''; newData.new_sub_block = '';
            }
            if (field === 'district') newData.upazila = '';
            if (field === 'camp_name') newData.block = '';
            if (field === 'block') newData.new_sub_block = '';

            return newData;
        });
    };

    // Location memoizations
    const availableDistricts = useMemo(() => {
        return locationData.bangladeshi.districts;
    }, []);

    const selectedDistrictData = useMemo(() => {
        return availableDistricts.find(d => d.name === formData.district);
    }, [formData.district, availableDistricts]);

    const availableCamps = useMemo(() => {
        return locationData.rohingya.camps;
    }, []);

    const selectedCampData = useMemo(() => {
        return availableCamps.find(c => c.name === formData.camp_name);
    }, [formData.camp_name, availableCamps]);

    const selectedBlockData = useMemo(() => {
        return selectedCampData?.blocks.find(b => b.name === formData.block);
    }, [formData.block, selectedCampData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for NID
        if (formData.origin === 'Bangladeshi' && formData.national_id) {
            const len = formData.national_id.length;
            if (![10, 13, 17].includes(len)) {
                alert("NID must be 10, 13, or 17 digits.");
                return;
            }
        }

        const { address_type, camp_name, block, new_sub_block, household_number, shelter_number,
            division, district, upazila, village, ...patientFields } = formData;

        const patient = await createPatient(patientFields as Record<string, unknown>);
        if (patient) {
            navigate(`/patients/${patient.id}`);
        }
    };

    const tabs = [
        { id: 'demographics', label: 'Demographics', icon: User },
        { id: 'contact', label: 'Contact', icon: Phone },
        { id: 'address', label: 'Address', icon: MapPin },
        { id: 'ids', label: 'Identifiers', icon: FileText },
        { id: 'clinical', label: 'Clinical', icon: Shield },
    ];

    const inputClass = "w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <h1 className="page-title flex items-center gap-2">
                    <UserPlus className="h-8 w-8" />
                    Patient Registration
                </h1>
                <p className="page-subtitle">Register a new patient in the ZARISH HEALTH system</p>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                            activeTab === tab.id
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Demographics */}
                {activeTab === 'demographics' && (
                    <div className="form-section animate-fade-in">
                        <h3 className="form-section-title"><User className="h-5 w-5 text-primary" /> Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="input-group">
                                <label className="text-sm font-medium">Given Name *</label>
                                <input type="text" value={formData.given_name} onChange={(e) => updateField('given_name', e.target.value)} required className={inputClass} placeholder="Given name" />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Family Name *</label>
                                <input type="text" value={formData.family_name} onChange={(e) => updateField('family_name', e.target.value)} required className={inputClass} placeholder="Family name" />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Middle Name</label>
                                <input type="text" value={formData.middle_name} onChange={(e) => updateField('middle_name', e.target.value)} className={inputClass} placeholder="Middle name" />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Bengali Name (বাংলা নাম)</label>
                                <input type="text" value={formData.full_name_bn} onChange={(e) => updateField('full_name_bn', e.target.value)} className={inputClass} placeholder="বাংলায় পূর্ণ নাম" />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Date of Birth *</label>
                                <input type="date" value={formData.date_of_birth} onChange={(e) => updateField('date_of_birth', e.target.value)} required className={inputClass} max={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Sex *</label>
                                <select value={formData.sex} onChange={(e) => updateField('sex', e.target.value)} required className={inputClass}>
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Origin *</label>
                                <select value={formData.origin} onChange={(e) => updateField('origin', e.target.value)} required className={inputClass}>
                                    <option value="">Select...</option>
                                    <option value="Rohingya">Rohingya (FDMN)</option>
                                    <option value="Bangladeshi">Bangladeshi</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Marital Status</label>
                                <select value={formData.marital_status} onChange={(e) => updateField('marital_status', e.target.value)} className={inputClass}>
                                    <option value="">Select...</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Separated">Separated</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Registration Date</label>
                                <input type="date" value={formData.registration_date} onChange={(e) => updateField('registration_date', e.target.value)} className={inputClass} />
                            </div>
                        </div>

                        <h3 className="form-section-title mt-6"><User className="h-5 w-5 text-muted-foreground" /> Family Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="input-group">
                                <label className="text-sm font-medium">Father's Name</label>
                                <input type="text" value={formData.father_name} onChange={(e) => updateField('father_name', e.target.value)} className={inputClass} />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Mother's Name</label>
                                <input type="text" value={formData.mother_name} onChange={(e) => updateField('mother_name', e.target.value)} className={inputClass} />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Spouse's Name</label>
                                <input type="text" value={formData.spouse_name} onChange={(e) => updateField('spouse_name', e.target.value)} className={inputClass} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact */}
                {activeTab === 'contact' && (
                    <div className="form-section animate-fade-in">
                        <h3 className="form-section-title"><Phone className="h-5 w-5 text-primary" /> Contact Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="input-group">
                                <label className="text-sm font-medium">Primary Phone</label>
                                <input type="tel" value={formData.phone_primary} onChange={(e) => updateField('phone_primary', e.target.value)} className={inputClass} placeholder="+880 1XXXXXXXXX" />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Secondary Phone</label>
                                <input type="tel" value={formData.phone_secondary} onChange={(e) => updateField('phone_secondary', e.target.value)} className={inputClass} />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Email</label>
                                <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={inputClass} />
                            </div>
                        </div>

                        <h3 className="form-section-title mt-6">Emergency Contact</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="input-group">
                                <label className="text-sm font-medium">Name</label>
                                <input type="text" value={formData.emergency_contact_name} onChange={(e) => updateField('emergency_contact_name', e.target.value)} className={inputClass} />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Phone</label>
                                <input type="tel" value={formData.emergency_contact_phone} onChange={(e) => updateField('emergency_contact_phone', e.target.value)} className={inputClass} />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Relationship</label>
                                <input type="text" value={formData.emergency_contact_relationship} onChange={(e) => updateField('emergency_contact_relationship', e.target.value)} className={inputClass} placeholder="e.g., Husband, Son" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Address */}
                {activeTab === 'address' && (
                    <div className="form-section animate-fade-in">
                        <h3 className="form-section-title"><MapPin className="h-5 w-5 text-primary" /> Address</h3>

                        {formData.origin === 'Rohingya' ? (
                            <>
                                <p className="text-sm text-muted-foreground mb-4">Camp Address (Rohingya FDMN)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Camp Name *</label>
                                        <select value={formData.camp_name} onChange={(e) => updateField('camp_name', e.target.value)} className={inputClass} required>
                                            <option value="">Select camp...</option>
                                            {availableCamps.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Main Block *</label>
                                        <select value={formData.block} onChange={(e) => updateField('block', e.target.value)} className={inputClass} required disabled={!formData.camp_name}>
                                            <option value="">Select block...</option>
                                            {selectedCampData?.blocks.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Sub-Block *</label>
                                        <select value={formData.new_sub_block} onChange={(e) => updateField('new_sub_block', e.target.value)} className={inputClass} required disabled={!formData.block}>
                                            <option value="">Select sub-block...</option>
                                            {selectedBlockData?.subblocks.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Household Number</label>
                                        <input type="text" value={formData.household_number} onChange={(e) => updateField('household_number', e.target.value)} className={inputClass} placeholder="e.g., 123" />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Shelter Number</label>
                                        <input type="text" value={formData.shelter_number} onChange={(e) => updateField('shelter_number', e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground mb-4">Bangladeshi Address</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="input-group">
                                        <label className="text-sm font-medium">District *</label>
                                        <select value={formData.district} onChange={(e) => updateField('district', e.target.value)} className={inputClass} required>
                                            <option value="">Select district...</option>
                                            {availableDistricts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Upazila *</label>
                                        <select value={formData.upazila} onChange={(e) => updateField('upazila', e.target.value)} className={inputClass} required disabled={!formData.district}>
                                            <option value="">Select upazila...</option>
                                            {selectedDistrictData?.upazilas.map(u => <option key={u} value={u}>{u}</option>)}
                                            {selectedDistrictData && selectedDistrictData.upazilas.length === 0 && <option value="N/A">Data Pending</option>}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Union / Village *</label>
                                        <input type="text" value={formData.village} onChange={(e) => updateField('village', e.target.value)} className={inputClass} required placeholder="Village or Ward" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Identifiers */}
                {activeTab === 'ids' && (
                    <div className="form-section animate-fade-in">
                        <h3 className="form-section-title"><FileText className="h-5 w-5 text-primary" /> National & Program Identifiers</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="input-group">
                                <label className="text-sm font-medium">National ID / Birth Certificate</label>
                                <input
                                    type="text"
                                    value={formData.national_id}
                                    onChange={(e) => updateField('national_id', e.target.value)}
                                    className={cn(inputClass, formData.origin === 'Bangladeshi' && formData.national_id && ![10, 13, 17].includes(formData.national_id.length) && "border-destructive focus:ring-destructive/30")}
                                    placeholder="10, 13, or 17 digits"
                                />
                                {formData.origin === 'Bangladeshi' && formData.national_id && ![10, 13, 17].includes(formData.national_id.length) && (
                                    <span className="text-[10px] text-destructive mt-1">NID must be 10, 13, or 17 digits</span>
                                )}
                            </div>

                            <div className="input-group">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-medium">Legacy ID Type</label>
                                </div>
                                <div className="flex gap-2">
                                    <select value={formData.fcn_type} onChange={(e) => updateField('fcn_type', e.target.value)} className={cn(inputClass, "w-1/3")}>
                                        <option value="FCN">FCN</option>
                                        <option value="MRC">MRC</option>
                                        <option value="Token">Token</option>
                                    </select>
                                    <input type="text" value={formData.fcn} onChange={(e) => updateField('fcn', e.target.value)} className={cn(inputClass, "w-2/3")} placeholder="ID Number" />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="text-sm font-medium">Progress ID (UNHCR)</label>
                                <input type="text" value={formData.progress_id} onChange={(e) => updateField('progress_id', e.target.value)} className={inputClass} placeholder="880-XXXXXXXX" />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">GHC Number</label>
                                <input type="text" value={formData.ghc_number} onChange={(e) => updateField('ghc_number', e.target.value)} className={inputClass} placeholder="General Health Card #" />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Legacy NCD Register #</label>
                                <input type="text" value={formData.legacy_ncd_number} onChange={(e) => updateField('legacy_ncd_number', e.target.value)} className={inputClass} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Clinical */}
                {activeTab === 'clinical' && (
                    <div className="form-section animate-fade-in">
                        <h3 className="form-section-title"><Shield className="h-5 w-5 text-primary" /> Clinical Flags</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="input-group">
                                <label className="text-sm font-medium">Blood Group</label>
                                <select value={formData.blood_group} onChange={(e) => updateField('blood_group', e.target.value)} className={inputClass}>
                                    <option value="">Unknown</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-4 pt-6">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={formData.is_vulnerable} onChange={(e) => updateField('is_vulnerable', e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                                    Vulnerable
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={formData.is_pregnant} onChange={(e) => updateField('is_pregnant', e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                                    Pregnant
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t mt-8">
                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 border rounded-lg text-sm hover:bg-muted/50 transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md shadow-primary/20 flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'Registering...' : 'Register Patient'}
                    </button>
                </div>
            </form>
        </div>
    );
}
