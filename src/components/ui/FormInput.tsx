import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	id: string;
	className?: string;
	labelClassName?: string;
}

export function FormInput({
	label,
	id,
	className = '',
	labelClassName = '',
	...props
}: FormInputProps) {
	return (
		<div>
			<label
				htmlFor={id}
				className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
			>
				{label}
			</label>
			<input
				id={id}
				className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
				{...props}
			/>
		</div>
	);
}
