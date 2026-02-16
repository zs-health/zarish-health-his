import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '@/shared/hooks/usePatient';
import { cn } from '@/shared/lib/utils';
import { UserPlus, User, Phone, MapPin, FileText, Shield, Save, ArrowLeft } from 'lucide-react';

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
        // Address
        address_type: 'current', camp_name: '', block: '', new_sub_block: '',
        household_number: '', shelter_number: '',
        division: '', district: '', upazila: '', village: '',
    });

    const updateField = (field: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                                <p className="text-sm text-muted-foreground mb-2">Camp Address (Rohingya FDMN)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Camp Name</label>
                                        <select value={formData.camp_name} onChange={(e) => updateField('camp_name', e.target.value)} className={inputClass}>
                                            <option value="">Select camp...</option>
                                            <option value="Camp-1W">Camp 1W</option>
                                            <option value="Camp-04">Camp 04</option>
                                            <option value="Camp-1E">Camp 1E</option>
                                            <option value="Camp-2W">Camp 2W</option>
                                            <option value="Camp-2E">Camp 2E</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Block</label>
                                        <input type="text" value={formData.block} onChange={(e) => updateField('block', e.target.value)} className={inputClass} placeholder="e.g., A, B, C" />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Sub-Block</label>
                                        <input type="text" value={formData.new_sub_block} onChange={(e) => updateField('new_sub_block', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Household #</label>
                                        <input type="text" value={formData.household_number} onChange={(e) => updateField('household_number', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Shelter #</label>
                                        <input type="text" value={formData.shelter_number} onChange={(e) => updateField('shelter_number', e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground mb-2">Bangladeshi Address</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Division</label>
                                        <select value={formData.division} onChange={(e) => updateField('division', e.target.value)} className={inputClass}>
                                            <option value="">Select...</option>
                                            {['Chattogram', 'Dhaka', 'Khulna', 'Barishal', 'Rajshahi', 'Rangpur', 'Mymensingh', 'Sylhet'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">District</label>
                                        <input type="text" value={formData.district} onChange={(e) => updateField('district', e.target.value)} className={inputClass} placeholder="e.g., Cox's Bazar" />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Upazila</label>
                                        <input type="text" value={formData.upazila} onChange={(e) => updateField('upazila', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-sm font-medium">Village</label>
                                        <input type="text" value={formData.village} onChange={(e) => updateField('village', e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Identifiers */}
                {activeTab === 'ids' && (
                    <div className="form-section animate-fade-in">
                        <h3 className="form-section-title"><FileText className="h-5 w-5 text-primary" /> National & Legacy IDs</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="input-group">
                                <label className="text-sm font-medium">National ID (NID)</label>
                                <input type="text" value={formData.national_id} onChange={(e) => updateField('national_id', e.target.value)} className={inputClass} />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">FCN (Rohingya)</label>
                                <input type="text" value={formData.fcn} onChange={(e) => updateField('fcn', e.target.value)} className={inputClass} placeholder="Family Counting Number" />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Progress ID</label>
                                <input type="text" value={formData.progress_id} onChange={(e) => updateField('progress_id', e.target.value)} className={inputClass} />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">GHC Number</label>
                                <input type="text" value={formData.ghc_number} onChange={(e) => updateField('ghc_number', e.target.value)} className={inputClass} />
                            </div>
                            <div className="input-group">
                                <label className="text-sm font-medium">Legacy NCD Number</label>
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
                <div className="flex justify-end gap-3 pt-4">
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
