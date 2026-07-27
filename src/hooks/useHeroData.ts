'use client';

import { useMemo } from 'react';
import {
	useGetHeroSectionQuery,
	useUpdateHeroSectionMutation,
	uploadHeroImage,
} from '@/services/hero.api';
import { toast } from 'react-toastify';

export interface HeroFormData {
	eyebrowText: string;
	mainHeadline: string;
	subtext: string;
	starRating: string;
	carsWashed: string;
	avgTime: string;
	backgroundImageUrl: string[]; // 👈 now array
	bannerImageUrl?: string;
	status: 'form' | 'banner' | 'hidden';
	textAlignment: 'left' | 'center' | 'right';
}

export function useHeroData() {
	const { data: hero, isLoading, refetch } = useGetHeroSectionQuery();
	const [updateHero, { isLoading: isUpdating }] =
		useUpdateHeroSectionMutation();

	const initialData = useMemo<HeroFormData>(() => {
		if (!hero?.content) {
			return {
				eyebrowText: '',
				mainHeadline: '',
				subtext: '',
				starRating: '',
				carsWashed: '',
				avgTime: '',
				backgroundImageUrl: [],
				bannerImageUrl: undefined,
				status: 'form',
				textAlignment: 'left',
			};
		}

		// Parse backgroundImageUrl – could be string or array
		let bgImages: string[] = [];
		const rawBg = hero.content.backgroundImageUrl || hero.content.background_image_url;
		if (Array.isArray(rawBg)) {
			bgImages = rawBg;
		} else if (rawBg) {
			bgImages = [rawBg]; // Convert single string to array
		}

		const textAlignment =
			hero.content.text_alignment ?? hero.content.textAlignment;
		const normalizedTextAlignment =
			textAlignment === 'center' || textAlignment === 'right'
				? textAlignment
				: 'left';

		return {
			eyebrowText: hero.content.eyebrow_text || '',
			mainHeadline: hero.content.main_headline || '',
			subtext: hero.content.subtext || '',
			starRating: hero.content.star_rating || '4.9',
			carsWashed: hero.content.cars_washed || '12K+',
			avgTime: hero.content.avg_time || '15-Min Average',
			backgroundImageUrl: bgImages,
			bannerImageUrl:
				hero.content.bannerImageUrl || hero.content.banner_image_url,
			status: hero.content.status || 'form',
			textAlignment: normalizedTextAlignment,
		};
	}, [hero]);

	const handleImageUpload = async (file: File): Promise<string> => {
		const imagePath = await uploadHeroImage(file);
		toast.success('Image uploaded successfully');
		return imagePath;
	};

	const handleSave = async (
		data: HeroFormData & { text_alignment?: HeroFormData['textAlignment'] },
	) => {
		try {
			const stripBaseUrl = (url?: string | string[]) => {
				if (!url) return undefined;
				if (Array.isArray(url)) {
					return url.map((u) => {
						const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
						if (baseUrl && u.startsWith(baseUrl)) {
							return u.substring(baseUrl.length);
						}
						if (u.includes('/public/')) {
							return u.substring(u.indexOf('/public/'));
						}
						return u;
					});
				}
				const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
				if (baseUrl && url.startsWith(baseUrl)) {
					return url.substring(baseUrl.length);
				}
				if (url.includes('/public/')) {
					return url.substring(url.indexOf('/public/'));
				}
				return url;
			};

			const content: Record<string, any> = {
				eyebrow_text: data.eyebrowText,
				main_headline: data.mainHeadline,
				subtext: data.subtext,
				star_rating: data.starRating,
				cars_washed: data.carsWashed,
				avg_time: data.avgTime,
				status: data.status,
				text_alignment: data.text_alignment ?? data.textAlignment,
			};

			// Handle backgroundImageUrl as array
			content.backgroundImageUrl = stripBaseUrl(data.backgroundImageUrl) || [];

			if (data.bannerImageUrl) {
				content.bannerImageUrl = stripBaseUrl(data.bannerImageUrl);
			}

			await updateHero({
				key: 'home_hero',
				data: {
					content: content,
					is_active: true,
				},
			}).unwrap();

			toast.success('Hero section updated successfully');
			refetch();
		} catch (error) {
			console.error('Update error:', error);
			toast.error('Failed to update hero section');
			throw error;
		}
	};

	return {
		initialData,
		isLoading,
		isUpdating,
		handleImageUpload,
		handleSave,
		refetch,
	};
}