'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyOtp } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';

export function VerifyOtpForm() {
	const router = useRouter();
	const [email] = useState(() => {
		if (typeof window === 'undefined') return '';
		const stored = sessionStorage.getItem('resetEmail');
		if (!stored) router.push('/forgot-password');
		return stored || '';
	});
	const [otp, setOtp] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!email) {
			toast.error('Email not found. Please try again.');
			router.push('/forgot-password');
			return;
		}
		setIsSubmitting(true);
		try {
			await verifyOtp({ email, otp });
			toast.success('OTP verified');
			sessionStorage.setItem('verifiedOtp', otp);
			router.push('/reset-password');
		} catch (error: any) {
			const message = error?.response?.data?.message || error?.message || 'Invalid OTP';
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-6 w-full'>
			<div>
				<label
					htmlFor='otp'
					className='block text-sm font-medium text-[#E9E9EA] mb-2'
				>
					OTP Code
				</label>
				<input
					id='otp'
					type='text'
					value={otp}
					onChange={(e) =>
						setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
					}
					required
					maxLength={6}
					placeholder='Enter 6-digit code'
					className='w-full px-4 py-4 bg-white/[0.12] border border-white/20 rounded-lg text-white text-center text-2xl tracking-[8px] placeholder-[#777980] font-inter outline-none focus:border-[#0098E8] focus:ring-1 focus:ring-[#0098E8] transition-all'
				/>
			</div>

			<Button
				type='submit'
				isLoading={isSubmitting}
				loadingText='Verifying...'
				disabled={otp.length !== 6}
				className='w-full py-4 px-5 justify-center items-center gap-2 rounded-xl bg-[#0098E8] text-white font-inter text-base font-medium hover:bg-[#0088D8] transition-all disabled:opacity-50'
			>
				Verify OTP
			</Button>

			<p className='text-center'>
				<a
					href='/login'
					className='text-[#E9E9EA] font-inter text-sm hover:text-white transition-colors'
				>
					Back to login
				</a>
			</p>
		</form>
	);
}