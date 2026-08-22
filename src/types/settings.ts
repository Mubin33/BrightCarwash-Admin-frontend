export interface ProfileFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    avatar: string | null;
}

export interface BusinessFormData {
    business_name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
}

export interface ChangePasswordFormData {
    old_password: string;
    new_password: string;
}

export type SettingsTab = 'profile' | 'business' | 'security';