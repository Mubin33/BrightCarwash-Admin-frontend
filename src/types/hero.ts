export interface HeroContent {
	eyebrow_text: string;
	main_headline: string;
	subtext: string;
	background_image_url?: string;
	backgroundImageUrl?: string | string[];
	bannerImageUrl?: string;
	banner_image_url?: string;
	star_rating: string;
	cars_washed: string;
	avg_time: string;
	status?: 'form' | 'banner' | 'hidden';
	text_alignment?: 'left' | 'center' | 'right';
	textAlignment?: 'left' | 'center' | 'right';
}

export interface HeroSection {
	section_key: string;
	section_type: string;
	content: HeroContent;
	is_active: boolean;
	sort_order: number;
	created_at: string;
	updated_at: string;
}

export interface UpdateHeroSectionRequest {
	section_type?: string;
	content?: Partial<HeroContent>;
	is_active?: boolean;
	sort_order?: number;
}

export interface SectionListResponse {
	success: boolean;
	message: string;
	data: {
		sections: HeroSection[];
		meta: {
			total_items: number;
			current_page: number;
			per_page: number;
			total_pages: number;
		};
	};
}

export interface SectionSingleResponse {
	success: boolean;
	message: string;
	data: HeroSection;
}
