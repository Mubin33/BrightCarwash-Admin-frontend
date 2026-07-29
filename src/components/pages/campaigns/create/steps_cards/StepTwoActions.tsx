'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Calendar, Send, Save } from 'lucide-react';
import { getAccessToken } from '@/lib/auth-client';
import { toast } from 'react-toastify';
import { useCreateCampaignMutation, useLaunchCampaignMutation, useUpdateCampaignMutation } from '@/services/campaign.api';
import { ScheduleModal } from '@/components/pages/campaigns/create/modals/ScheduleModal';
import type { CreateCampaignRequest } from '@/types/campaign';
import { PERMISSIONS } from '@/lib/permissions';

interface StepTwoActionsProps {
	allFilled: boolean;
	campaignData?: {
		name: string;
		tags: string[];
		subject: string;
		templateId: string;
		leadGroupId: string | null | undefined;
	};
}

export function StepTwoActions({
	allFilled,
	campaignData,
}: StepTwoActionsProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const isEdit = searchParams.get("edit") === "true";
	const campaignId = searchParams.get("id");

	const [createCampaign] = useCreateCampaignMutation();
	const [updateCampaign] = useUpdateCampaignMutation();
	const [launchCampaign] = useLaunchCampaignMutation();
	const [isSending, setIsSending] = useState(false);
	const [isScheduling, setIsScheduling] = useState(false);
	const [isSavingDraft, setIsSavingDraft] = useState(false);
	const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

	// Debug: Log the edit state
	console.log('🔍 StepTwoActions - isEdit:', isEdit, 'campaignId:', campaignId);

	const buildPayload = (overrides: Partial<CreateCampaignRequest> = {}): CreateCampaignRequest => ({
		name: campaignData?.name || '',
		tags: campaignData?.tags || [],
		subject: campaignData?.subject || '',
		templateId: campaignData?.templateId || '',
		leadGroupId: campaignData?.leadGroupId || '',
		...overrides,
	});

	const handleSendNow = async () => {
		const token = getAccessToken();
		if (!token) {
			toast.error('Please login to continue');
			router.push('/login');
			return;
		}

		if (!allFilled) {
			toast.warning('Please complete all steps before sending');
			return;
		}

		if (!campaignData?.templateId) {
			toast.error('Please select a template first');
			return;
		}

		setIsSending(true);
		try {
			let campaign;
			if (isEdit && campaignId) {
				console.log('📝 Updating existing campaign:', campaignId);
				campaign = await updateCampaign({
					id: campaignId,
					data: buildPayload({ scheduledAt: null })
				}).unwrap();
			} else {
				console.log('📝 Creating new campaign');
				campaign = await createCampaign(buildPayload({ scheduledAt: null })).unwrap();
			}
			await launchCampaign(campaign.id).unwrap();
			toast.success('Campaign sent successfully!');
			router.push('/campaigns');
		} catch (error: any) {
			console.error('Send error:', error);
			toast.error(error?.data?.message || 'Failed to send campaign');
		} finally {
			setIsSending(false);
		}
	};

	const handleScheduleLater = (scheduledAt: string) => {
		setScheduleModalOpen(false);
		handleScheduleCampaign(scheduledAt);
	};

	const handleScheduleCampaign = async (scheduledAt: string) => {
		const token = getAccessToken();
		if (!token) {
			toast.error("Please login to continue");
			router.push("/login");
			return;
		}

		if (!allFilled) {
			toast.warning("Please complete all steps before scheduling");
			return;
		}

		if (!campaignData?.templateId) {
			toast.error("Please select a template first");
			return;
		}

		setIsScheduling(true);
		try {
			let campaign;
			if (isEdit && campaignId) {
				console.log('📝 Updating existing campaign with schedule:', campaignId);
				campaign = await updateCampaign({
					id: campaignId,
					data: buildPayload({ scheduledAt })
				}).unwrap();
			} else {
				console.log('📝 Creating new campaign with schedule');
				campaign = await createCampaign(buildPayload({ scheduledAt })).unwrap();
			}
			await launchCampaign(campaign.id).unwrap();
			toast.success(`Campaign scheduled for ${new Date(scheduledAt).toLocaleString()}`);
			router.push("/campaigns");
		} catch (error: any) {
			console.error("Schedule error:", error);
			toast.error(error?.data?.message || "Failed to schedule campaign");
		} finally {
			setIsScheduling(false);
		}
	};

	const handleSaveDraft = async () => {
		const token = getAccessToken();
		if (!token) {
			toast.error('Please login to continue');
			router.push('/login');
			return;
		}

		if (!campaignData?.name.trim()) {
			toast.warning('Please enter a campaign name');
			return;
		}

		console.log('💾 Saving draft - isEdit:', isEdit, 'campaignId:', campaignId);

		setIsSavingDraft(true);
		try {
			if (isEdit && campaignId) {
				console.log('📝 UPDATING draft campaign:', campaignId);
				await updateCampaign({
					id: campaignId,
					data: buildPayload({ scheduledAt: null })
				}).unwrap();
				toast.success('Campaign updated as draft!');
			} else {
				console.log('📝 CREATING new draft campaign');
				await createCampaign(buildPayload({ scheduledAt: null })).unwrap();
				toast.success('Campaign saved as draft!');
			}
			router.push('/campaigns');
		} catch (error: any) {
			console.error('Save draft error:', error);
			toast.error(error?.data?.message || 'Failed to save draft');
		} finally {
			setIsSavingDraft(false);
		}
	};

	return (
		<div className='flex items-center gap-3'>
			<Button
				onClick={handleSendNow}
				isLoading={isSending}
				loadingText='Sending...'
				permission={PERMISSIONS.campaign.create}
				className='flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors w-auto!'
				disabled={!allFilled}
			>
				<Send size={16} />
				Send now
			</Button>
			<Button
				onClick={() => setScheduleModalOpen(true)}
				isLoading={isScheduling}
				loadingText='Scheduling...'
				variant='outline'
				permission={PERMISSIONS.campaign.create}
				className='flex py-2.5 px-4 items-center gap-2 rounded border border-[#DFE1E7] text-[#1B1B1B] font-inter text-sm hover:bg-[#F8FAFB] transition-colors w-auto!'
				disabled={!allFilled}
			>
				<Calendar size={16} />
				Schedule for later
			</Button>
			<Button
				onClick={handleSaveDraft}
				isLoading={isSavingDraft}
				loadingText='Saving...'
				variant='outline'
				permission={PERMISSIONS.campaign.create}
				className='flex py-2.5 px-4 items-center gap-2 rounded border border-[#DFE1E7] text-[#1B1B1B] font-inter text-sm hover:bg-[#F8FAFB] transition-colors w-auto!'
			>
				<Save size={16} />
				{isEdit ? 'Update Draft' : 'Save as Draft'}
			</Button>

			<ScheduleModal
				isOpen={scheduleModalOpen}
				onClose={() => setScheduleModalOpen(false)}
				onSchedule={handleScheduleLater}
				isScheduling={isScheduling}
			/>
		</div>
	);
}