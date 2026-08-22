import type { Stage } from '@/types/stage';

export const mockStages: Stage[] = [
	{
		id: 'stage_new',
		name: 'New Lead',
		color: '#0098E8',
		sort_order: 1,
		icon: null,
	},
	{
		id: 'stage_contracted',
		name: 'Contracted',
		color: '#FFAF00',
		sort_order: 2,
		icon: null,
	},
	{
		id: 'stage_converted',
		name: 'Converted',
		color: '#006F1F',
		sort_order: 3,
		icon: null,
	},
	{
		id: 'stage_lost',
		name: 'Lost',
		color: '#FF4345',
		sort_order: 4,
		icon: null,
	},
];
