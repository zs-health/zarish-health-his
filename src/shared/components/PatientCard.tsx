import { cn, formatDate, calculateAge } from '@/shared/lib/utils';
import type { PatientSearchResult } from '@/shared/types';
import { User, Phone, Calendar, MapPin, Hash } from 'lucide-react';

interface PatientCardProps {
    patient: PatientSearchResult;
    onClick?: (patient: PatientSearchResult) => void;
    selected?: boolean;
    compact?: boolean;
}

export function PatientCard({ patient, onClick, selected, compact }: PatientCardProps) {
    const age = patient.age_years ?? calculateAge(patient.date_of_birth);

    return (
        <div
            onClick={() => onClick?.(patient)}
            className={cn(
                'group rounded-xl border p-4 transition-all duration-200 cursor-pointer',
                selected
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5',
                compact && 'p-3'
            )}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={cn(
                    'rounded-full flex items-center justify-center flex-shrink-0',
                    patient.sex === 'Male'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
                    compact ? 'w-9 h-9' : 'w-11 h-11'
                )}>
                    <User className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={cn('font-semibold text-foreground', compact ? 'text-sm' : 'text-base')}>
                            {patient.given_name} {patient.family_name}
                        </h3>
                        <span className={cn(
                            'badge-status',
                            patient.patient_status === 'active' ? 'badge-active' : 'badge-inactive'
                        )}>
                            {patient.patient_status}
                        </span>
                        {patient.origin === 'Rohingya' && (
                            <span className="badge-status bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                FDMN
                            </span>
                        )}
                    </div>

                    <div className={cn('flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground', compact ? 'text-xs mt-1' : 'text-sm mt-2')}>
                        <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {patient.mrn}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {age}y, {patient.sex}
                        </span>
                        {patient.phone_primary && (
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {patient.phone_primary}
                            </span>
                        )}
                        {patient.fcn && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                FCN: {patient.fcn}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
