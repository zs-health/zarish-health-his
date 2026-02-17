import { create } from 'zustand';
import type { UserRole, Facility, Program } from '@/shared/types';
import type { User } from '@supabase/supabase-js';

interface AppState {
    // Auth
    user: User | null;
    userRole: UserRole | null;
    userProgram: Program;
    userPermissions: Record<string, Record<string, boolean>> | null;
    currentFacility: Facility | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // UI
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setUserRole: (role: UserRole | null) => void;
    setUserProgram: (program: Program) => void;
    setUserPermissions: (permissions: Record<string, Record<string, boolean>> | null) => void;
    setCurrentFacility: (facility: Facility | null) => void;
    setIsAuthenticated: (value: boolean) => void;
    setIsLoading: (value: boolean) => void;
    toggleSidebar: () => void;
    setSidebarCollapsed: (value: boolean) => void;
    logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Auth
    user: null,
    userRole: null,
    userProgram: null,
    userPermissions: null,
    currentFacility: null,
    isAuthenticated: false,
    isLoading: true,

    // UI
    sidebarOpen: true,
    sidebarCollapsed: false,

    // Actions
    setUser: (user) => set({ user }),
    setUserRole: (userRole) => set({ userRole }),
    setUserProgram: (userProgram) => set({ userProgram }),
    setUserPermissions: (userPermissions) => set({ userPermissions }),
    setCurrentFacility: (currentFacility) => set({ currentFacility }),
    setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    setIsLoading: (isLoading) => set({ isLoading }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    logout: () =>
        set({
            user: null,
            userRole: null,
            userProgram: null,
            userPermissions: null,
            currentFacility: null,
            isAuthenticated: false,
        }),
}));
