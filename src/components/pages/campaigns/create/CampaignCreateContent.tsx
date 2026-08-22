'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useCampaignCreation } from '@/hooks/useCampaignCreation';
import { CampaignBreadcrumb } from './components/CampaignBreadcrumb';
import { StepOneDetails } from './steps/StepOneDetails';
import { StepTwoTemplate } from './steps/StepTwoTemplate';
import { StepThreeDesign } from './steps/StepThreeDesign';
import { loadCampaignForEdit, resetCampaignCreation, setDesignFilled, setSelectedTemplateName } from '@/store/slices/campaignCreationSlice';
import { useGetCampaignByIdQuery } from '@/services/campaign.api';
import { useGetTemplateByIdQuery } from '@/services/template.api';
import { getAccessToken } from '@/lib/auth-client';
import CampaignsSkeleton from '../CampaignSkeleton';

export function CampaignCreateContent() {
	const dispatch = useDispatch();
	const searchParams = useSearchParams();
	const isEdit = searchParams.get("edit") === "true";
	const campaignId = searchParams.get("id");
	const stepFromUrl = searchParams.get("step") || "";

	const [currentStep, setCurrentStep] = useState(() => {
		if (stepFromUrl === "3") return 3;
		if (stepFromUrl === "2") return 2;
		return 1;
	});

	const { data: campaignData, isLoading: isLoadingCampaign } = useGetCampaignByIdQuery(
		campaignId || '',
		{ skip: !campaignId || !isEdit }
	);

	const campaign = useCampaignCreation();

	// Reset state when NOT editing (new campaign)
	useEffect(() => {
		if (!isEdit && stepFromUrl !== "3") {
			dispatch(resetCampaignCreation());
			setCurrentStep(1);
		}
	}, [isEdit, stepFromUrl, dispatch]);

	// Reset state on unmount
	useEffect(() => {
		return () => {
			if (!isEdit) {
				dispatch(resetCampaignCreation());
			}
		};
	}, [isEdit, dispatch]);

	// Get templateId from campaignData
	const templateId = campaignData?.emailConfig?.templateId || null;

	// Fetch template details when templateId exists - with refetch on change
	const { data: templateData, isLoading: isLoadingTemplate } = useGetTemplateByIdQuery(
		templateId || '',
		{
			skip: !templateId,
			refetchOnMountOrArgChange: true
		}
	);

	// Clear template name when templateId is null (no template selected)
	useEffect(() => {
		if (!templateId) {
			dispatch(setSelectedTemplateName(''));
			return;
		}
	}, [templateId, dispatch]);

	// Load draft campaign data for editing
	useEffect(() => {
		if (isEdit && campaignData) {

			const tags = campaignData.tags || [];

			const leadGroupId = campaignData.emailConfig?.leadGroupId || null;
			const leadGroupName = campaignData.emailConfig?.leadGroup?.name || '';
			const subject = campaignData.emailConfig?.subject || '';
			const templateIdFromConfig = campaignData.emailConfig?.templateId || null;

			// Check which fields are filled
			const filled = {
				recipients: !!leadGroupId,
				subject: !!subject,
				design: !!templateIdFromConfig,
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
				if (stepFromUrl !== "3") {
					setCurrentStep(2);
				}
			}
		}
	}, [isEdit, campaignData, dispatch, stepFromUrl]);

	// Set template name when template data loads
	useEffect(() => {
		if (templateData && templateData.name) {
			dispatch(setSelectedTemplateName(templateData.name));
		}
	}, [templateData, dispatch]);

	// Also fetch template name via direct API call as fallback
	const fetchTemplateName = async (id: string) => {
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
	};

	useEffect(() => {
		if (campaignData?.emailConfig?.templateId && !templateData && !isLoadingTemplate) {
			fetchTemplateName(campaignData.emailConfig.templateId);
		}
	}, [campaignData, templateData, isLoadingTemplate]);

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