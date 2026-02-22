import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';
import { useAppStore } from '@/shared/stores/appStore';

interface CreateReferralProps {
    patientId: string;
    patientName?: string;
    onSuccess?: () => void;
}

const REFERRAL_TYPES = [
    'Home Visit Needed',
    'Follow-up Required',
    'Clinic Consultation',
    'Lab Investigation',
    'Medication Refill',
    'Missed Appointment',
    'Step-down Care',
    'Step-up Care',
];

export function CreateReferral({ patientId, patientName, onSuccess }: CreateReferralProps) {
    const navigate = useNavigate();
    const { user, userRole, userProgram, currentFacility } = useAppStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        to_program: userProgram === 'HP' ? 'HO' : 'HP',
        referral_type: 'Home Visit Needed',
        referral_reason: '',
        urgency: 'routine' as 'routine' | 'urgent' | 'emergency',
        current_diagnosis: '',
        special_instructions: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.referral_reason.trim()) {
            setError('Please provide a referral reason');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('coordination.cross_program_referrals')
                .insert({
                    patient_id: patientId,
                    from_program: userProgram as 'HP' | 'HO' | 'HSS',
                    to_program: formData.to_program as 'HP' | 'HO' | 'HSS',
                    from_facility_id: currentFacility?.id,
                    referral_reason: formData.referral_reason,
                    referral_type: formData.referral_type,
                    urgency: formData.urgency,
                    current_diagnosis: formData.current_diagnosis || null,
                    special_instructions: formData.special_instructions || null,
                    referred_by: user?.id,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            alert('Referral created successfully!');
            
            if (onSuccess) {
                onSuccess();
            } else {
                navigate(-1);
            }
        } catch (err) {
            console.error('Error creating referral:', err);
            setError('Failed to create referral');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Create Referral</h2>
            {patientName && <p className="text-gray-600 mb-4">Referral for {patientName}</p>}
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Refer To</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            value={formData.to_program}
                            onChange={(e) => setFormData({ ...formData, to_program: e.target.value })}
                        >
                            {userProgram === 'HP' && <option value="HO">Health Outreach (HO)</option>}
                            {userProgram === 'HO' && <option value="HP">Health Post (HP)</option>}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Urgency</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            value={formData.urgency}
                            onChange={(e) => setFormData({ ...formData, urgency: e.target.value as 'routine' | 'urgent' | 'emergency' })}
                        >
                            <option value="routine">Routine</option>
                            <option value="urgent">Urgent</option>
                            <option value="emergency">Emergency</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Referral Type</label>
                    <select
                        className="w-full p-2 border rounded-md"
                        value={formData.referral_type}
                        onChange={(e) => setFormData({ ...formData, referral_type: e.target.value })}
                    >
                        {REFERRAL_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Reason for Referral *</label>
                    <textarea
                        className="w-full p-2 border rounded-md"
                        placeholder="Provide detailed reason for referral..."
                        value={formData.referral_reason}
                        onChange={(e) => setFormData({ ...formData, referral_reason: e.target.value })}
                        required
                        rows={3}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Current Diagnosis</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter current diagnosis if applicable"
                        value={formData.current_diagnosis}
                        onChange={(e) => setFormData({ ...formData, current_diagnosis: e.target.value })}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Special Instructions</label>
                    <textarea
                        className="w-full p-2 border rounded-md"
                        placeholder="Any special instructions for the receiving program..."
                        value={formData.special_instructions}
                        onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                        rows={2}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Referral'}
                    </button>
                </div>
            </form>
        </div>
    );
}
