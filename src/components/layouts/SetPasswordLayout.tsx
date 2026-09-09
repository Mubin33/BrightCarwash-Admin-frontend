import { AuthLayout } from '@/components/layouts/AuthLayout';
import { SetPasswordForm } from '@/components/pages/auth-pages/set-password/SetPasswordForm';

export default function SetPasswordLayout() {
    return (
        <AuthLayout
            title="Set Password"
            subtitle="Set your password to access your account."
            videoSrc="/video/video2.mp4"
        >
            <SetPasswordForm />
        </AuthLayout>
    );
}