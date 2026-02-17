import { useMemo } from 'react';
import { useAppStore } from '@/shared/stores/appStore';
import type { UserRole, Program } from '@/shared/types';

export interface UserProfileData {
    role: UserRole | null;
    program: Program;
    permissions: Record<string, Record<string, boolean>> | null;
    facilityId: string | null;
    isHP: boolean;
    isHO: boolean;
    isHSS: boolean;
    isManagement: boolean;
    isResearcher: boolean;
    isMEO: boolean;
    isDonor: boolean;
    isAdmin: boolean;
    canViewPatients: boolean;
    canCreatePatients: boolean;
    canViewAnalytics: boolean;
    canExportData: boolean;
    canManageUsers: boolean;
}

export function useUserProfile(): UserProfileData {
    const { userRole, userProgram, userPermissions, currentFacility } = useAppStore();

    return useMemo(() => {
        const isHP = userRole?.startsWith('hp_') ?? false;
        const isHO = userRole?.startsWith('ho_') ?? false;
        const isHSS = userRole?.startsWith('hss_') ?? false;
        const isManagement = userRole === 'management';
        const isResearcher = userRole === 'researcher';
        const isMEO = userRole === 'me_officer';
        const isDonor = userRole === 'donor';
        const isAdmin = userRole === 'super_admin' || userRole === 'admin';

        const patientPerms = userPermissions?.patient;
        const analyticsPerms = userPermissions?.analytics;
        const reportsPerms = userPermissions?.reports;
        const usersPerms = userPermissions?.users;

        return {
            role: userRole,
            program: userProgram,
            permissions: userPermissions,
            facilityId: currentFacility?.id ?? null,
            isHP,
            isHO,
            isHSS,
            isManagement,
            isResearcher,
            isMEO,
            isDonor,
            isAdmin,
            canViewPatients: patientPerms?.view ?? false,
            canCreatePatients: patientPerms?.create ?? false,
            canViewAnalytics: analyticsPerms?.view ?? false,
            canExportData: analyticsPerms?.export ?? false,
            canManageUsers: usersPerms?.view ?? false,
        };
    }, [userRole, userProgram, userPermissions, currentFacility]);
}

export function getRouteForRole(role: UserRole | null): string {
    if (!role) return '/login';

    switch (role) {
        case 'hp_coordinator':
        case 'hp_doctor':
        case 'hp_nurse':
        case 'hp_pharmacist':
        case 'hp_lab_tech':
        case 'hp_registrar':
            return '/hp';
        case 'ho_coordinator':
        case 'ho_chw':
        case 'ho_nurse':
        case 'ho_educator':
            return '/ho';
        case 'hss_coordinator':
        case 'hss_trainer':
        case 'hss_quality_officer':
        case 'hss_data_officer':
            return '/hss';
        case 'management':
            return '/management';
        case 'researcher':
            return '/researcher';
        case 'me_officer':
            return '/me';
        case 'donor':
            return '/donor';
        case 'super_admin':
        case 'admin':
            return '/admin';
        default:
            return '/';
    }
}
