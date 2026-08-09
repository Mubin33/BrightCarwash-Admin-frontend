import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { authApi } from '@/services/auth.api';
import { dashboardApi } from '@/services/dashboard.api';
import { leadsApi } from '@/services/leads.api';
import authReducer from '@/store/slices/authSlice';
import { paymentApi } from '@/services/payment.api';
import { campaignApi } from '@/services/campaign.api';
import { teamApi } from '@/services/team.api';
import { templateApi } from '@/services/template.api';
import { activityLogApi } from '@/services/activity-log.api';
import campaignCreationReducer from '@/store/slices/campaignCreationSlice';
import { reportsApi } from '@/services/reports.api';
import { faqApi } from '@/services/faq.api';
import { galleryApi } from '@/services/gallery.api';
import { newsApi } from '@/services/news.api';
import { categoryApi } from '@/services/category.api';
import { testimonialApi } from '@/services/testimonial.api';
import { heroApi } from '@/services/hero.api';
import { sectionApi } from '@/services/sections.api';
import { emailListApi } from '@/services/email-list.api';
import { settingsApi } from '@/services/settings.api';
import { notificationApi } from '@/services/notification.api';
import { queriesApi } from '@/services/queries.api';
import { chatboxApis } from '@/services/ai-Chatbox.api';
import { knowledgeApi } from '@/services/knowledge.api';
import { aiCampaignApi } from '@/services/ai-campaign.api';
export const store = configureStore({
	reducer: {
		auth: authReducer,
		[authApi.reducerPath]: authApi.reducer,
		[dashboardApi.reducerPath]: dashboardApi.reducer,
		[leadsApi.reducerPath]: leadsApi.reducer,
		[paymentApi.reducerPath]: paymentApi.reducer,
		[campaignApi.reducerPath]: campaignApi.reducer,
		[teamApi.reducerPath]: teamApi.reducer,
		[templateApi.reducerPath]: templateApi.reducer,
		[activityLogApi.reducerPath]: activityLogApi.reducer,
		campaignCreation: campaignCreationReducer,
		[reportsApi.reducerPath]: reportsApi.reducer,
		[faqApi.reducerPath]: faqApi.reducer,
		[galleryApi.reducerPath]: galleryApi.reducer,
		[newsApi.reducerPath]: newsApi.reducer,
		[categoryApi.reducerPath]: categoryApi.reducer,
		[testimonialApi.reducerPath]: testimonialApi.reducer,
		[heroApi.reducerPath]: heroApi.reducer,
		[sectionApi.reducerPath]: sectionApi.reducer,
		[emailListApi.reducerPath]: emailListApi.reducer,
		[settingsApi.reducerPath]: settingsApi.reducer,
		[notificationApi.reducerPath]: notificationApi.reducer,
		[queriesApi.reducerPath]: queriesApi.reducer,
		[chatboxApis.reducerPath]: chatboxApis.reducer,
		[knowledgeApi.reducerPath]: knowledgeApi.reducer,
		[aiCampaignApi.reducerPath]: aiCampaignApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			authApi.middleware,
			dashboardApi.middleware,
			leadsApi.middleware,
			paymentApi.middleware,
			campaignApi.middleware,
			teamApi.middleware,
			templateApi.middleware,
			activityLogApi.middleware,
			reportsApi.middleware,
			faqApi.middleware,
			galleryApi.middleware,
			newsApi.middleware,
			categoryApi.middleware,
			testimonialApi.middleware,
			heroApi.middleware,
			sectionApi.middleware,
			emailListApi.middleware,
			settingsApi.middleware,
			notificationApi.middleware,
			queriesApi.middleware,
			chatboxApis.middleware,
			knowledgeApi.middleware,
			aiCampaignApi.middleware,
		),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;