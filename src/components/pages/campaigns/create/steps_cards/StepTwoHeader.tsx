'use client';

import { useState } from 'react';
import { ChevronLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StepTwoHeaderProps {
	campaignName: string;
	setCampaignName: (v: string) => void;
	onBack: () => void;
}

const statusStyles: Record<string, string> = {
	Draft: 'text-[#777980] border-[#DFE1E7] bg-white',
};

export function StepTwoHeader({
	campaignName,
	setCampaignName,
	onBack,
}: StepTwoHeaderProps) {
	const [editingName, setEditingName] = useState(false);
	const [editNameValue, setEditNameValue] = useState('');

	const startEditName = () => {
		setEditNameValue(campaignName);
		setEditingName(true);
	};
	const saveEditName = () => {
		if (editNameValue.trim()) setCampaignName(editNameValue.trim());
		setEditingName(false);
	};
	const handleEditNameKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') saveEditName();
		if (e.key === 'Escape') setEditingName(false);
	};

	return (
		<div className='flex items-center gap-3'>
			<Button
				variant='icon'
				onClick={onBack}
				className='flex items-center text-[#777980] hover:text-[#1B1B1B] transition-colors p-0'
			>
				<ChevronLeft size={20} />
			</Button>
			{editingName ? (
				<input
					type='text'
					value={editNameValue}
					onChange={(e) => setEditNameValue(e.target.value)}
					onKeyDown={handleEditNameKeyDown}
					onBlur={saveEditName}
					autoFocus
					className='px-3 py-1 border border-[#DFE1E7] rounded-lg text-[#1B1B1B] font-inter text-lg font-semibold outline-none focus:border-[#0098E8]'
				/>
			) : (
				<>
					<span className='text-[#1B1B1B] font-inter text-lg font-semibold'>
						{campaignName}
					</span>
					<Button
						variant='icon'
						onClick={startEditName}
						className='text-[#0098E8] hover:text-[#0088D8] transition-colors p-0'
					>
						<Pencil size={16} />
					</Button>
				</>
			)}
			<span
				className={`inline-flex py-1.5 px-3 justify-center items-center gap-1 rounded border text-sm font-medium ${statusStyles['Draft']}`}
			>
				Draft
			</span>
		</div>
	);
}
