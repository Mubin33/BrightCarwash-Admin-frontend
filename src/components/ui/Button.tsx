"use client";

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'outline'
	| 'danger'
	| 'icon'
	| 'sidebar'
	| 'link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	isLoading?: boolean;
	loadingText?: string;
	children: ReactNode;
	className?: string;
	permission?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
	primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
	secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
	outline:
		'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
	danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
	icon: '',
	sidebar: '',
	link: 'text-blue-600 hover:underline p-0',
};

export function Button({
	variant = 'primary',
	isLoading = false,
	loadingText,
	children,
	className = '',
	disabled,
	type = 'button',
	permission,
	...props
}: ButtonProps) {
	const hasPerm = usePermission(permission || '');

	if (permission && !hasPerm) return null;

	if (variant === 'icon' || variant === 'sidebar' || variant === 'link') {
		return (
			<button
				type={type}
				disabled={disabled || isLoading}
				className={className}
				{...props}
			>
				{children}
			</button>
		);
	}

	return (
		<button
			type={type}
			disabled={disabled || isLoading}
			className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap ${variantClasses[variant]} ${className}`}
			{...props}
		>
			{isLoading ? loadingText || 'Loading...' : children}
		</button>
	);
}