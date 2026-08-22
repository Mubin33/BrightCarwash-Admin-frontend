import type { ReactNode } from 'react';

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: ReactNode;
	children: ReactNode;
	size?: 'sm' | 'md' | 'lg';
	glass?: boolean; // ← new
	bodyClassName?: string;
}
