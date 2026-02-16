import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export function getBPCategory(systolic?: number, diastolic?: number): {
    label: string;
    color: string;
    severity: 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';
} {
    if (!systolic || !diastolic) return { label: 'Unknown', color: 'gray', severity: 'normal' };
    if (systolic >= 180 || diastolic >= 120) return { label: 'Hypertensive Crisis', color: 'red', severity: 'crisis' };
    if (systolic >= 160 || diastolic >= 100) return { label: 'Stage 2', color: 'red', severity: 'stage2' };
    if (systolic >= 140 || diastolic >= 90) return { label: 'Stage 1', color: 'orange', severity: 'stage1' };
    if (systolic >= 130 || diastolic >= 80) return { label: 'Elevated', color: 'yellow', severity: 'elevated' };
    return { label: 'Normal', color: 'green', severity: 'normal' };
}

export function getBMICategory(bmi?: number): string {
    if (!bmi) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

export function getDiabetesRisk(glucose?: number, testType?: string): string {
    if (!glucose || !testType) return 'Unknown';
    if (testType === 'FPG') {
        if (glucose >= 7.0) return 'Diabetes';
        if (glucose >= 6.1) return 'Pre-diabetes';
        return 'Normal';
    }
    if (testType === 'RPG') {
        if (glucose >= 11.1) return 'Diabetes';
        return 'Indeterminate';
    }
    return 'Unknown';
}

export function generateMRN(): string {
    const year = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `MRN-${year}-${seq}`;
}
