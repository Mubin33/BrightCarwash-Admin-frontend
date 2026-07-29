'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SubjectModal } from '@/components/pages/campaigns/create/modals/SubjectModal';
import { RecipientsModal } from '@/components/pages/campaigns/create/modals/RecipientsModal';
import { useStepTwoModals } from '@/hooks/useStepTwoModals';

interface CardState {
	recipients: boolean;
	subject: boolean;
	design: boolean;
}

interface StepTwoCardsProps {
	filled: CardState;
	onToggle: (key: keyof CardState) => void;
	campaignName: string;
	onDesignClick?: () => void;
	selectedTemplateName?: string;
	selectedGroupId?: string | null;
	selectedGroupName?: string | null;
	onRecipientsSave?: (groupId: string, groupName: string) => void;
	subject?: string;
	previewText?: string;
	onSubjectSave?: (subject: string, preview: string) => void;
}

const cardConfig = [
	{
		key: 'recipients' as const,
		icon: 'leads',
		title: 'Recipients',
		desc: 'Who receives this campaign?',
		btn: 'Add Recipients',
	},
	{
		key: 'subject' as const,
		icon: 'contract',
		title: 'Subject',
		desc: 'Add a subject line.',
		btn: 'Add Subject',
	},
	{
		key: 'design' as const,
		icon: 'new',
		title: 'Design',
		desc: 'Create your email content.',
		btn: 'Start designing',
	},
];

export function StepTwoCards({
	filled,
	onToggle,
	onDesignClick,
	selectedTemplateName,
	selectedGroupId,
	selectedGroupName,
	onRecipientsSave,
	subject = '',
	previewText = '',
	onSubjectSave,
}: StepTwoCardsProps) {
	const modals = useStepTwoModals();

	const handleCardClick = (key: keyof CardState) => {
		if (key === 'subject') {
			modals.openModal('subject');
		} else if (key === 'design') {
			onToggle('design');
			onDesignClick?.();
		} else if (key === 'recipients') {
			modals.openModal('recipients');
		}
	};

	const handleRecipientsSave = (groupId: string, groupName: string) => {
		if (onRecipientsSave) {
			onRecipientsSave(groupId, groupName);
		}

		modals.closeModal();
	};

	const getDescription = (key: keyof CardState) => {
		if (key === 'recipients' && selectedGroupName) {
			return selectedGroupName;
		}
		if (key === 'design' && filled.design) {
			return selectedTemplateName || 'Template selected';
		}
		if (key === 'subject' && filled.subject && subject) {
			return subject.length > 40 ? subject.slice(0, 40) + '...' : subject;
		}
		return cardConfig.find((c) => c.key === key)?.desc || '';
	};

	return (
		<>
			<div className='flex gap-4 self-stretch'>
				{cardConfig.map((card) => {
					const desc = getDescription(card.key);
					const isFilled = filled[card.key];
					return (
						<div
							key={card.key}
							className='flex-1 flex flex-col items-center gap-4 p-6 rounded-xl border border-[#DFE1E7] bg-white'
						>
							<div className='w-12 h-12 rounded-full bg-[#F8FAFB] flex items-center justify-center'>
								<Icon
									name={card.icon}
									width={24}
									height={24}
									color={isFilled ? '#006F1F' : '#A5A5AB'}
								/>
							</div>
							<div className='flex flex-col items-center gap-1 text-center'>
								<span className='text-[#1D1F2C] font-inter text-lg font-medium leading-[100%]'>
									{card.title}
								</span>
								<span className='text-[#777980] font-inter text-sm font-normal leading-[132%]'>
									{desc}
								</span>
							</div>
							<Button
								variant='outline'
								onClick={() => handleCardClick(card.key)}
								className={`flex py-2.5 px-4 justify-center items-center gap-2 rounded border text-sm w-full! ${isFilled
									? 'border-[#006F1F] text-[#006F1F] bg-[#DCF7EA]'
									: 'border-[#DFE1E7] text-[#1B1B1B]'
									}`}
							>
								{isFilled ? '✓ Added' : card.btn}
							</Button>
						</div>
					);
				})}
			</div>

			<SubjectModal
				isOpen={modals.subjectModalOpen}
				onClose={modals.closeModal}
				initialSubject={subject}
				initialPreview={previewText}
				onSave={onSubjectSave}
			/>
			<RecipientsModal
				isOpen={modals.recipientsModalOpen}
				onClose={modals.closeModal}
				selectedGroupId={selectedGroupId}
				onSave={handleRecipientsSave}
			/>
		</>
	);
}