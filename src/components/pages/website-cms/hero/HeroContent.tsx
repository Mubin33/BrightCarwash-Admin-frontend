'use client';

import { useState, useEffect } from 'react';
import { HeroHeader } from './HeroHeader';
import { HeroBackgroundImage } from './HeroBackgroundImage';
import { HeroTextContent } from './HeroTextContent';
import { HeroRightSideContent } from './HeroRightSideContent';
import { HeroTrustStatistics } from './HeroTrustStatistics';
import { useHeroData, type HeroFormData } from '@/hooks/useHeroData';

export function HeroContent() {
	const { initialData, isLoading, isUpdating, handleImageUpload, handleSave } =
		useHeroData();

	const buildFormData = (data: HeroFormData): HeroFormData => ({
		eyebrowText: data.eyebrowText,
		mainHeadline: data.mainHeadline,
		subtext: data.subtext,
		starRating: data.starRating,
		carsWashed: data.carsWashed,
		avgTime: data.avgTime,
		status: data.status,
		backgroundImageUrl: data.backgroundImageUrl || [],
		bannerImageUrl: data.bannerImageUrl,
		textAlignment: data.textAlignment,
	});

	const [formData, setFormData] = useState<HeroFormData>(() =>
		buildFormData(initialData),
	);
	const [isBannerUploading, setIsBannerUploading] = useState(false);

	useEffect(() => {
		if (!isLoading) {
			const next = buildFormData(initialData);
			setFormData((prev) => {
				if (
					prev.eyebrowText === next.eyebrowText &&
					prev.mainHeadline === next.mainHeadline &&
					prev.subtext === next.subtext &&
					prev.starRating === next.starRating &&
					prev.carsWashed === next.carsWashed &&
					prev.avgTime === next.avgTime &&
					prev.status === next.status &&
					JSON.stringify(prev.backgroundImageUrl) ===
					JSON.stringify(next.backgroundImageUrl) &&
					prev.bannerImageUrl === next.bannerImageUrl &&
					prev.textAlignment === next.textAlignment
				) {
					return prev;
				}
				return next;
			});
		}
	}, [initialData, isLoading]);

	const updateField = <K extends keyof HeroFormData>(
		key: K,
		value: HeroFormData[K],
	) => {
		setFormData((prev) => {
			const updated = { ...prev, [key]: value };

			// Auto-save when text alignment changes
			if (key === 'textAlignment') {
				handleSave({
					eyebrowText: updated.eyebrowText,
					mainHeadline: updated.mainHeadline,
					subtext: updated.subtext,
					starRating: updated.starRating,
					carsWashed: updated.carsWashed,
					avgTime: updated.avgTime,
					backgroundImageUrl: updated.backgroundImageUrl,
					bannerImageUrl: updated.bannerImageUrl,
					status: updated.status,
					textAlignment: value as HeroFormData['textAlignment'],
					text_alignment: value as HeroFormData['textAlignment'],
				} as any);
			}

			return updated;
		});
	};

	const buildSavePayload = (overrides?: Partial<HeroFormData>) => {
		const data = { ...formData, ...overrides };
		return {
			eyebrowText: data.eyebrowText,
			mainHeadline: data.mainHeadline,
			subtext: data.subtext,
			starRating: data.starRating,
			carsWashed: data.carsWashed,
			avgTime: data.avgTime,
			backgroundImageUrl: data.backgroundImageUrl || [],
			bannerImageUrl: data.bannerImageUrl,
			status: data.status,
			textAlignment: data.textAlignment,
			text_alignment: data.textAlignment,
		} as any;
	};

	const handleBannerImageUpload = async (file: File): Promise<string> => {
		setIsBannerUploading(true);
		try {
			return await handleImageUpload(file);
		} finally {
			setIsBannerUploading(false);
		}
	};

	const handleBannerImageSave = async (data: { bannerImageUrl: string }) => {
		updateField('bannerImageUrl', data.bannerImageUrl);
		await handleSave(buildSavePayload({ bannerImageUrl: data.bannerImageUrl }));
	};

	const handleBackgroundSave = async (data: { backgroundImageUrl: string[] }) => {
		updateField('backgroundImageUrl', data.backgroundImageUrl);
		await handleSave(
			buildSavePayload({ backgroundImageUrl: data.backgroundImageUrl }),
		);
	};

	const handleFullSave = async () => {
		await handleSave(buildSavePayload());
	};

	const handleStatusSave = async (newStatus: 'form' | 'banner' | 'hidden') => {
		updateField('status', newStatus);
		await handleSave(buildSavePayload({ status: newStatus }));
	};

	if (isLoading) {
		return (
			<div className='flex flex-col gap-4 w-full'>
				<div className='h-10 w-48 bg-gray-200 rounded animate-pulse' />
				<div className='h-64 bg-gray-100 rounded-lg animate-pulse' />
				<div className='h-64 bg-gray-100 rounded-lg animate-pulse' />
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-4 w-full'>
			<HeroHeader onSave={handleFullSave} isUpdating={isUpdating} />

			<div className='flex gap-4'>
				<div className='flex-1 flex flex-col gap-4'>
					<HeroBackgroundImage
						key={JSON.stringify(formData.backgroundImageUrl)}
						initialImageUrls={formData.backgroundImageUrl || []}
						onImageUpload={handleImageUpload}
						onSave={handleBackgroundSave}
						label='Background Images (Carousel)'
					/>
					<HeroTextContent
						eyebrowText={formData.eyebrowText}
						setEyebrowText={(value) => updateField('eyebrowText', value)}
						mainHeadline={formData.mainHeadline}
						setMainHeadline={(value) => updateField('mainHeadline', value)}
						subtext={formData.subtext}
						setSubtext={(value) => updateField('subtext', value)}
					/>
				</div>

				<div className='flex-1 flex flex-col gap-4'>
					<HeroRightSideContent
						status={formData.status}
						onStatusChange={handleStatusSave}
						bannerImageUrl={formData.bannerImageUrl}
						onBannerImageUpload={handleBannerImageUpload}
						onBannerImageSave={handleBannerImageSave}
						isUploading={isBannerUploading}
						textAlignment={formData.textAlignment}
						onTextAlignmentChange={(value) =>
							updateField('textAlignment', value)
						}
					/>
					<HeroTrustStatistics
						starRating={formData.starRating}
						setStarRating={(value) => updateField('starRating', value)}
						carsWashed={formData.carsWashed}
						setCarsWashed={(value) => updateField('carsWashed', value)}
						avgTime={formData.avgTime}
						setAvgTime={(value) => updateField('avgTime', value)}
					/>
				</div>
			</div>
		</div>
	);
}