'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LoginFooter } from '@/components/pages/auth-pages/login/LoginFooter';
import { useRouter } from 'next/navigation';

interface AuthLayoutProps {
	title: string;
	subtitle: string;
	children: React.ReactNode;
	videoSrc?: string;
}

export function AuthLayout({
	title,
	subtitle,
	children,
	videoSrc,
}: AuthLayoutProps) {
	const [videoError, setVideoError] = useState(false);
	const router = useRouter()

	return (
		<div className='flex h-screen overflow-hidden bg-[#0B1220]'>
			{/* Left panel */}
			<div className='flex w-full lg:max-w-162.5 flex-col items-start self-stretch overflow-y-auto'>
				<div className='flex px-4 sm:px-6 lg:px-8 py-3 sm:py-4 justify-between items-center self-stretch'>
					<Image
						onClick={() => router.push('/login')}
						src='/images/logo.png'
						alt='Logo'
						width={40}
						height={48}
						className='object-contain sm:w-12.5 sm:h-14.25 lg:w-14.25 lg:h-16 cursor-pointer'
						unoptimized
					/>
					{/* <LanguageSelector /> */}
				</div>

				<div className='flex px-5 sm:px-8 lg:px-10 py-10 sm:py-14 lg:py-20 flex-col justify-center items-center gap-6 sm:gap-8 flex-1 self-stretch'>
					<div className='flex flex-col gap-2 self-stretch'>
						<h1 className='text-white font-inter text-2xl sm:text-[28px] lg:text-[32px] font-semibold leading-[130%]'>
							{title}
						</h1>
						<p className='text-[#E9E9EA] font-inter text-xs sm:text-sm font-normal leading-[160%]'>
							{subtitle}
						</p>
					</div>
					{children}
				</div>

				<LoginFooter />
			</div>

			{/* Right panel — video with gradient overlay */}
			<div className='flex-1 relative hidden lg:block'>
				<div className='absolute top-6 sm:top-8 left-6 sm:left-8 right-0 sm:right-0 bottom-0 sm:bottom-0 rounded-tl-2xl overflow-hidden'>
					{!videoError && videoSrc ? (
						<video
							autoPlay
							loop
							muted
							playsInline
							className='absolute inset-0 w-full h-full object-cover'
							onError={() => setVideoError(true)}
						>
							<source src={videoSrc} type='video/mp4' />
						</video>
					) : (
						<Image
							src='/images/login-bg.png'
							alt='Dashboard preview'
							fill
							className='object-cover'
							priority
							unoptimized
							onError={() => setVideoError(true)}
						/>
					)}
					{/* Gradient overlay */}
					<div className='absolute inset-0 bg-linear-to-t from-[#0B1220]/90 via-[#0B1220]/30 to-transparent' />
					<div className='absolute top-0 left-0 right-0 h-8 bg-linear-to-b from-[#0B1220]/20 to-transparent' />
				</div>
			</div>
		</div>
	);
}
