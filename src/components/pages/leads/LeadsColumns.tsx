import { StageDropdown, type StageOption } from '@/components/ui/StageDropdown';
import { ActionsDropdown } from '@/components/ui/ActionsDropdown';
import type { Column } from '@/components/ui/DataTable';
import type { Lead } from '@/types/leads';
import { PERMISSIONS } from '@/lib/permissions';
import { PriorityDropdown } from '@/components/ui/PriorityDropdown';

interface LeadsColumnsParams {
	onStageChange: (id: string, stageId: string) => void;
	onPriorityChange: (id: string, priority: string) => void;
	onView: (lead: Lead) => void;
	onDelete: (lead: Lead) => void;
	onSelectRow: (id: string) => void;
	onSelectAll: () => void;
	allSelected: boolean;
	selectedIds: Set<string>;
	router: { push: (url: string) => void };
	stages: StageOption[];
	onStageCreated?: () => void;
}

const truncateToMaxWords = (text: string, maxWords: number = 8): string => {
	if (!text) return '';
	const words = text.split(' ');
	if (words.length <= maxWords) return text;
	return words.slice(0, maxWords).join(' ') + '...';
};

const PRIORITY_OPTIONS = [
	{ value: 'LOW', label: 'Low' },
	{ value: 'MEDIUM', label: 'Medium' },
	{ value: 'HIGH', label: 'High' },
	{ value: 'URGENT', label: 'Urgent' },
];

export function createLeadsColumns({
	onStageChange,
	onPriorityChange,
	onDelete,
	onSelectRow,
	onSelectAll,
	allSelected,
	selectedIds,
	router,
	stages,
	onStageCreated,
}: LeadsColumnsParams): Column<Lead>[] {
	return [
		{
			key: 'checkbox',
			header: (
				<input
					type='checkbox'
					className='w-5 h-5 rounded-md border border-[#E8E8E9] bg-white cursor-pointer accent-[#0098E8] no-row-click'
					checked={allSelected}
					onChange={onSelectAll}
				/>
			),
			className: 'w-12',
			render: (row) => (
				<input
					type='checkbox'
					className='w-5 h-5 rounded-md border border-[#E8E8E9] bg-white cursor-pointer accent-[#0098E8] no-row-click'
					checked={selectedIds.has(row.id)}
					onChange={() => onSelectRow(row.id)}
				/>
			),
		},
		{
			key: 'leadName',
			header: 'Lead Name',
			render: (row) => (
				<div className='flex items-center gap-2'>
					<span className='text-[#1B1B1B] font-inter text-sm font-normal leading-[150%] truncate max-w-32'>
						{row.name}
					</span>
				</div>
			),
		},
		{
			key: 'service',
			header: 'Service',
			render: (row) => (
				<span
					className='text-[#1B1B1B] font-inter text-sm block max-w-[180px] truncate'
					title={row.service}
				>
					{truncateToMaxWords(row.service, 8)}
				</span>
			),
		},
		{
			key: 'email',
			header: 'Email',
			render: (row) => (
				<span className='text-[#1B1B1B] font-inter text-sm truncate block max-w-[180px]'>
					{row.email}
				</span>
			),
		},
		{
			key: 'source',
			header: 'Source',
			render: (row) => (
				<span className='text-[#1B1B1B] font-inter text-sm truncate block max-w-[140px]'>
					{row.source}
				</span>
			),
		},
		{
			key: 'priority',
			header: 'Priority',
			className: 'no-row-click',
			render: (row) => (
				<PriorityDropdown
					currentPriority={row.priority}
					options={PRIORITY_OPTIONS}
					onSelect={(val) => onPriorityChange(row.id, val)}
				/>
			),
		},
		{
			key: 'stage',
			header: 'Stage',
			className: 'no-row-click',
			render: (row) => (
				<StageDropdown
					currentStage={row.stage}
					stages={stages}
					onSelect={(stageId) => onStageChange(row.id, stageId)}
					onStageCreated={onStageCreated}
				/>
			),
		},
		{
			key: 'date',
			header: 'Date',
			render: (row) => (
				<span className='text-[#1B1B1B] font-inter text-sm whitespace-nowrap'>
					{row.date}
				</span>
			),
		},
		{
			key: 'actions',
			header: '',
			className: 'w-12 no-row-click',
			render: (row) => (
				<ActionsDropdown
					items={[
						{
							label: 'View Lead',
							onClick: () => router.push(`/leads/${row.id}`),
							permission: PERMISSIONS.lead.read,
						},
						{
							label: 'Delete',
							onClick: () => onDelete(row),
							variant: 'danger' as const,
							permission: PERMISSIONS.lead.delete,
						},
					]}
				/>
			),
		},
	];
}