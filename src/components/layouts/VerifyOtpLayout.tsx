import { AuthLayout } from '@/components/layouts/AuthLayout';
import { VerifyOtpForm } from '@/components/pages/auth-pages/verify-otp/VerifyOtpForm';

export function VerifyOtpLayout() {
	return (
		<AuthLayout
			title='Verify OTP'
			subtitle='Enter the 6-digit code sent to your email address.'
			videoSrc='/video/video1.mp4'
		>
			<VerifyOtpForm />
		</AuthLayout>
	);
}
