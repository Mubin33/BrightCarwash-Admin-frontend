'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';

export function ResetPasswordForm() {
	const router = useRouter();
	const [email] = useState(() => {
		if (typeof window === 'undefined') return '';
		const stored = sessionStorage.getItem('resetEmail');
		if (!stored) router.push('/forgot-password');
		return stored || '';
	});
	const [otp] = useState(() => {
		if (typeof window === 'undefined') return '';
		const stored = sessionStorage.getItem('verifiedOtp');
		if (!stored) router.push('/forgot-password');
		return stored || '';
	});
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}
		if (!email || !otp) {
			toast.error('Session expired. Please try again.');
			router.push('/forgot-password');
			return;
		}
		setIsSubmitting(true);
		try {
			await resetPassword({ email, otp, new_password: newPassword });
			toast.success('Password reset successfully');
			sessionStorage.removeItem('resetEmail');
			sessionStorage.removeItem('verifiedOtp');
			router.push('/login');
		} catch (error: any) {
			const message = error?.response?.data?.message || error?.message || 'Reset failed';
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-6 w-full'>
			<div>
				<label
					htmlFor='newPassword'
					className='block text-sm font-medium text-[#E9E9EA] mb-2'
				>
					New Password
				</label>
				<div className="relative">
					<input
						id='newPassword'
						type={showNew ? "text" : "password"}
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						required
						minLength={8}
						placeholder='Min 8 characters'
						className='w-full px-4 py-4 pr-11 bg-white/[0.12] border border-white/20 rounded-lg text-white placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-1 focus:ring-[#0098E8] transition-all'
					/>
					<button
						type="button"
						onClick={() => setShowNew(!showNew)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777980] hover:text-white transition-colors"
						tabIndex={-1}
					>
						{showNew ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
				</div>
			</div>

			<div>
				<label
					htmlFor='confirmPassword'
					className='block text-sm font-medium text-[#E9E9EA] mb-2'
				>
					Confirm Password
				</label>
				<div className="relative">
					<input
						id='confirmPassword'
						type={showConfirm ? "text" : "password"}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						placeholder='Re-enter password'
						className='w-full px-4 py-4 pr-11 bg-white/[0.12] border border-white/20 rounded-lg text-white placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-1 focus:ring-[#0098E8] transition-all'
					/>
					<button
						type="button"
						onClick={() => setShowConfirm(!showConfirm)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777980] hover:text-white transition-colors"
						tabIndex={-1}
					>
						{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
				</div>
			</div>

			<Button
				type='submit'
				isLoading={isSubmitting}
				loadingText='Resetting...'
				className='w-full py-4 px-5 justify-center items-center gap-2 rounded-xl bg-[#0098E8] text-white font-inter text-base font-medium hover:bg-[#0088D8] transition-all'
			>
				Reset Password
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