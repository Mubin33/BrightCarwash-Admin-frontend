'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useCampaignCreation } from '@/hooks/useCampaignCreation';
import { CampaignBreadcrumb } from './components/CampaignBreadcrumb';
import { StepOneDetails } from './steps/StepOneDetails';
import { StepTwoTemplate } from './steps/StepTwoTemplate';
import { StepThreeDesign } from './steps/StepThreeDesign';
import {
	loadCampaignForEdit,
	restoreCampaignDraft,
	resetCampaignCreation,
	setDesignFilled,
	setSelectedTemplateName,
	setTemplateId,
} from '@/store/slices/campaignCreationSlice';
import { useGetCampaignByIdQuery } from '@/services/campaign.api';
import { useGetTemplateByIdQuery } from '@/services/template.api';
import { getAccessToken } from '@/lib/auth-client';
import CampaignsSkeleton from '../CampaignSkeleton';

const DRAFT_STORAGE_KEY = 'campaign_creation_draft';

export function CampaignCreateContent() {
	const dispatch = useDispatch();
	const searchParams = useSearchParams();
	const isEdit = searchParams.get("edit") === "true";
	const campaignId = searchParams.get("id");
	const stepFromUrl = searchParams.get("step") || "";
	const templateIdFromUrl = searchParams.get("templateId");
	const templateNameFromUrl = searchParams.get("templateName");

	const [currentStep, setCurrentStep] = useState(() => {
		if (stepFromUrl === "3") return 3;
		if (stepFromUrl === "2" || templateIdFromUrl) return 2;
		return 1;
	});

	const { data: campaignData, isLoading: isLoadingCampaign } = useGetCampaignByIdQuery(
		campaignId || '',
		{ skip: !campaignId || !isEdit }
	);

	const campaign = useCampaignCreation();

	// Restore draft from sessionStorage if Redux is empty on mount (e.g. after refresh or returning to campaign)
	useEffect(() => {
		if (!isEdit && typeof window !== "undefined") {
			const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
			if (savedDraft) {
				try {
					const parsed = JSON.parse(savedDraft);
					// If Redux is currently empty but draft exists in sessionStorage, rehydrate
					if (!campaign.campaignName && !campaign.selectedGroupId && !campaign.subject) {
						dispatch(restoreCampaignDraft(parsed));
					}
				} catch (e) {
					console.error("Failed to parse campaign draft:", e);
				}
			}
		}
	}, [isEdit, dispatch, campaign.campaignName, campaign.selectedGroupId, campaign.subject]);

	// Sync campaign draft to sessionStorage so sub-route navigation or reload never loses data
	useEffect(() => {
		if (!isEdit && typeof window !== "undefined") {
			const hasData =
				Boolean(campaign.campaignName) ||
				Boolean(campaign.selectedGroupId) ||
				Boolean(campaign.subject) ||
				Boolean(campaign.templateId) ||
				(campaign.tags && campaign.tags.length > 0);

			if (hasData) {
				sessionStorage.setItem(
					DRAFT_STORAGE_KEY,
					JSON.stringify({
						campaignName: campaign.campaignName,
						tags: campaign.tags,
						tagInput: campaign.tagInput,
						selectedTemplateName: campaign.selectedTemplateName,
						templateId: campaign.templateId,
						designFilled: campaign.designFilled,
						selectedGroupId: campaign.selectedGroupId,
						selectedGroupName: campaign.selectedGroupName,
						subject: campaign.subject,
						previewText: campaign.previewText,
						filled: campaign.filled,
					})
				);
			}
		}
	}, [
		isEdit,
		campaign.campaignName,
		campaign.tags,
		campaign.tagInput,
		campaign.selectedTemplateName,
		campaign.templateId,
		campaign.designFilled,
		campaign.selectedGroupId,
		campaign.selectedGroupName,
		campaign.subject,
		campaign.previewText,
		campaign.filled,
	]);

	// Apply template from URL if passed (e.g. from editor or template select page)
	useEffect(() => {
		if (templateIdFromUrl) {
			dispatch(setTemplateId(templateIdFromUrl));
			dispatch(setDesignFilled(true));
			if (templateNameFromUrl) {
				dispatch(setSelectedTemplateName(decodeURIComponent(templateNameFromUrl)));
			}
		}
	}, [templateIdFromUrl, templateNameFromUrl, dispatch]);

	// Reset state ONLY when navigating away from the campaign creation hierarchy
	useEffect(() => {
		return () => {
			if (typeof window !== "undefined") {
				const nextPath = window.location.pathname;
				if (!nextPath.startsWith("/campaigns/create")) {
					dispatch(resetCampaignCreation());
					sessionStorage.removeItem(DRAFT_STORAGE_KEY);
				}
			}
		};
	}, [dispatch]);

	// Active template ID (from campaignData if editing, or from Redux / URL)
	const activeTemplateId = isEdit
		? (campaignData?.emailConfig?.templateId || null)
		: (campaign.templateId || templateIdFromUrl || null);

	// Fetch template details when activeTemplateId exists
	const { data: templateData, isLoading: isLoadingTemplate } = useGetTemplateByIdQuery(
		activeTemplateId || '',
		{
			skip: !activeTemplateId,
			refetchOnMountOrArgChange: true
		}
	);

	// Load draft campaign data for editing an existing campaign
	useEffect(() => {
		if (isEdit && campaignData) {
			const tags = campaignData.tags || [];
			const leadGroupId = campaignData.emailConfig?.leadGroupId || null;
			const leadGroupName = campaignData.emailConfig?.leadGroup?.name || '';
			const subject = campaignData.emailConfig?.subject || '';
			const templateIdFromConfig = campaignData.emailConfig?.templateId || null;

			const filled = {
				recipients: Boolean(leadGroupId),
				subject: Boolean(subject),
				design: Boolean(templateIdFromConfig),
			};

			dispatch(loadCampaignForEdit({
				campaignName: campaignData.name || '',
				tags: tags,
				subject: subject,
				selectedGroupId: leadGroupId,
				selectedGroupName: leadGroupName,
				templateId: templateIdFromConfig,
				filled: filled,
				isEdit: true,
				campaignId: campaignData.id || null,
				selectedTemplateName: '', 
			}));

			if (templateIdFromConfig) {
				dispatch(setDesignFilled(true));
			}
		}
	}, [isEdit, campaignData, dispatch]);

	// Set template name when template data loads from API
	useEffect(() => {
		if (templateData && templateData.name) {
			dispatch(setSelectedTemplateName(templateData.name));
		}
	}, [templateData, dispatch]);

	// Fallback fetch for template name if needed
	const fetchTemplateName = useCallback(async (id: string) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/templates/${id}`,
				{
					headers: {
						'Authorization': `Bearer ${getAccessToken()}`,
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				const templateName = data.data?.name || '';
				if (templateName) {
					dispatch(setSelectedTemplateName(templateName));
				}
			}
		} catch (error) {
			console.error('Failed to fetch template name:', error);
		}
	}, [dispatch]);

	useEffect(() => {
		if (activeTemplateId && !templateData && !isLoadingTemplate && !campaign.selectedTemplateName) {
			fetchTemplateName(activeTemplateId);
		}
	}, [activeTemplateId, templateData, isLoadingTemplate, campaign.selectedTemplateName, fetchTemplateName]);

	const handleTemplateSelect = (name: string, id: string) => {
		campaign.setSelectedTemplateName(name);
		campaign.setTemplateId(id);
		campaign.setDesignFilled(true);
		setCurrentStep(2);
	};

	if (isLoadingCampaign && isEdit) {
		return <CampaignsSkeleton />;
	}

	return (
		<div className="flex flex-col gap-6 w-full">
			<div className="flex justify-between items-start self-stretch">
				<CampaignBreadcrumb
					isEdit={isEdit}
					currentStep={currentStep}
					campaignName={campaign.campaignName}
					onBackToStep1={() => setCurrentStep(1)}
				/>
			</div>

			{currentStep === 1 && (
				<StepOneDetails
					campaignName={campaign.campaignName}
					setCampaignName={campaign.setCampaignName}
					tagInput={campaign.tagInput}
					setTagInput={campaign.setTagInput}
					tags={campaign.tags}
					addTag={() => campaign.addTag(campaign.tagInput || "")}
					removeTag={campaign.removeTag}
					handleTagKeyDown={(e: React.KeyboardEvent) => {
						if (e.key === "Enter") {
							e.preventDefault();
							if (campaign.tagInput.trim()) {
								campaign.addTag(campaign.tagInput.trim());
								campaign.setTagInput("");
							}
						}
					}}
					onContinue={() => {
						if (campaign.tagInput.trim()) {
							campaign.addTag(campaign.tagInput.trim());
							campaign.setTagInput("");
						}
						setCurrentStep(2);
					}}
				/>
			)}

			{currentStep === 2 && (
				<StepTwoTemplate
					campaignName={campaign.campaignName}
					setCampaignName={campaign.setCampaignName}
					onBack={() => setCurrentStep(1)}
					onNextStep={() => setCurrentStep(3)}
					designFilled={campaign.designFilled}
					selectedTemplateName={campaign.selectedTemplateName}
					templateId={campaign.templateId}
					onDesignClick={() => {
						setCurrentStep(3);
						campaign.setDesignFilled(true);
					}}
					selectedGroupId={campaign.selectedGroupId}
					selectedGroupName={campaign.selectedGroupName}
					onRecipientsSave={campaign.setSelectedGroup}
					subject={campaign.subject}
					previewText={campaign.previewText}
					filled={campaign.filled}
					onSubjectSave={campaign.setSubject}
					tags={campaign.tags}
				/>
			)}

			{currentStep === 3 && (
				<StepThreeDesign
					onBack={() => setCurrentStep(2)}
					onTemplateSelect={handleTemplateSelect}
				/>
			)}
		</div>
	);
}
