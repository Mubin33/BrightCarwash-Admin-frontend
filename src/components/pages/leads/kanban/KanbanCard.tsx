import Image from 'next/image';
import { Calendar, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ActionsDropdown } from '@/components/ui/ActionsDropdown';
import type { Lead } from '@/types/leads';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { PERMISSIONS } from '@/lib/permissions';

interface KanbanCardProps {
	lead: Lead;
	index: number;
	onDelete: (lead: Lead) => void;
}

// const depositStatusStyles: Record<string, string> = {
// 	PAID: 'text-[#006F1F] border-[#DFE1E7] bg-white',
// 	PENDING: 'text-[#FFAF00] border-[#DFE1E7] bg-white',
// 	REFUNDED: 'text-[#FF4345] border-[#DFE1E7] bg-white',
// 	NONE: 'text-[#777980] border-[#DFE1E7] bg-white',
// };
export function KanbanCard({ lead, onDelete }: KanbanCardProps) {
	const formatDate = (dateStr: string): string => {
		const d = new Date(dateStr);
		return d.toLocaleDateString('en-US', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	};
	const router = useRouter();
	return (
		<div className='flex w-full p-3 flex-col items-start gap-3 rounded-lg border border-[#DFE1E7] bg-white adm-kanban-card'>
			<div className='flex justify-between items-center self-stretch'>
				<div className='flex items-center gap-2 flex-1 min-w-0'>
					{/* <div className='w-9 h-9 rounded-full overflow-hidden shrink-0'>
						<Image
							src={lead.avatar}
							alt={lead.name}
							width={36}
							height={36}
							className='object-cover'
						/>
					</div> */}
					<div className='flex flex-col justify-center items-start gap-1 flex-1 min-w-0'>
						<span className='text-[#4A4C56] font-inter text-base font-normal leading-[100%] tracking-[-0.24px] truncate self-stretch'>
							{lead.name}
						</span>
						<span className='text-[#777980] font-inter text-xs font-normal leading-[100%] tracking-[-0.18px] truncate self-stretch'>
							{lead.service}
						</span>
					</div>
				</div>
				<ActionsDropdown
					items={[
						{
							label: 'View Lead',
							onClick: () => router.push(`/leads/${lead.id}`),
						},
						{
							label: 'Delete',
							onClick: () => toast.info(`Delete ${lead.name}`),
						},
						{
							label: 'Delete',
							onClick: () => onDelete(lead),
							variant: 'danger' as const,
							permission: PERMISSIONS.lead.delete,
						},
					]}
				/>
			</div>

			<div className='flex items-center gap-2 flex-wrap'>
				{/* <span
					className={`inline-flex py-1 px-2 justify-center items-center gap-1 rounded border text-xs capitalize ${depositStatusStyles[lead.depositStatus] || depositStatusStyles.NONE}`}
				>
					{lead.depositStatus}
				</span> */}
				<span className='inline-flex py-1 px-2 justify-center items-center gap-1 rounded border border-[#DFE1E7] bg-white text-xs text-[#1B1B1B] capitalize'>
					{lead.source}
				</span>
			</div>

			<div className='w-full h-px bg-[#DFE1E7]' />

			<div className='flex justify-between items-center self-stretch'>
				<div className='flex items-center gap-1 text-[#777980]'>
					<Calendar size={14} />
					<span className='font-inter text-xs'>{formatDate(lead.date)}</span>
				</div>
				<Button
					variant='icon'
					className='flex p-1.5 items-center gap-3 rounded border border-[#DFE1E7] bg-white cursor-pointer'
				>
					<MessageCircle size={14} className='text-[#777980]' />
				</Button>
			</div>
		</div>
	);
}
