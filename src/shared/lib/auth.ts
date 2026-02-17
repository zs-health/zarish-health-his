import { supabase } from './supabase';
import type { UserRole } from '@/shared/types';

export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signUpWithEmail(email: string, password: string, metadata?: Record<string, unknown>) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
    });
    if (error) throw error;
    return data;
}

export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

export async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
}

export async function getUserRole(userId: string): Promise<{ role: UserRole; facility_id?: string; program?: string; permissions?: Record<string, Record<string, boolean>> } | null> {
    console.log('[Auth] getUserRole called for:', userId);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
        const { data, error } = await supabase
            .from('user_roles')
            .select('role, facility_id, program, permissions')
            .eq('user_id', userId)
            .single();

        clearTimeout(timeoutId);

        if (error) {
            console.log('[Auth] getUserRole error:', error.message);
            return null;
        }
        console.log('[Auth] getUserRole result:', data);
        return data as { role: UserRole; facility_id?: string; program?: string; permissions?: Record<string, Record<string, boolean>> };
    } catch (e: any) {
        clearTimeout(timeoutId);
        console.log('[Auth] getUserRole exception:', e.message);
        return null;
    }
}

export async function resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
}

export async function updateEmail(newEmail: string) {
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
    return data;
}

export async function updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
}

export async function enrollMFA() {
    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
    });
    if (error) throw error;
    return data;
}
