import { AuthLayout } from '@/components/layouts/AuthLayout';
import { ResetPasswordForm } from '@/components/pages/auth-pages/reset-password/ResetPasswordForm';

export function ResetPasswordLayout() {
	return (
		<AuthLayout
			title='Reset Password'
			subtitle='Create a new password for your account.'
			videoSrc='/video/video2.mp4'
		>
			<ResetPasswordForm />
		</AuthLayout>
	);
}
