import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '@/lib/axios-instance';
import { settingsApi } from '@/services/settings.api';
import { configureStore } from '@reduxjs/toolkit';
import { getEditedBusinessProfileFields } from '@/hooks/useBusinessSettings';

vi.mock('@/lib/axios-instance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AU14 / A-20: Business Profile Data Preservation (Settings)', () => {
  let store: ReturnType<typeof createTestStore>;

  const createTestStore = () =>
    configureStore({
      reducer: {
        [settingsApi.reducerPath]: settingsApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(settingsApi.middleware),
    });

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  describe('settingsApi getBusinessProfile: Surface Load Errors', () => {
    it('proves A-20: profile load answers 500 -> surfaces load error and does NOT return fake empty success', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      });

      const result = await store.dispatch(
        settingsApi.endpoints.getBusinessProfile.initiate()
      );

      // Must be an error, NOT data: { logo: null, business_name: '', tagline: '' }
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error).toMatchObject({
        status: 500,
        data: 'Internal Server Error',
      });
    });

    it('proves A-20: profile load times out -> surfaces load error and does NOT return fake empty success', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('timeout of 10000ms exceeded')
      );

      const result = await store.dispatch(
        settingsApi.endpoints.getBusinessProfile.initiate()
      );

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error).toMatchObject({
        status: 500,
        data: 'timeout of 10000ms exceeded',
      });
    });

    it('proves A-20: profile load succeeds -> returns valid profile data', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: {
            content: {
              logo: '/storage/logos/brightside.png',
              business_name: 'BrightSide Car Wash',
              tagline: 'Spotless. Every time.',
            },
          },
        },
      });

      const result = await store.dispatch(
        settingsApi.endpoints.getBusinessProfile.initiate()
      );

      expect(result.data).toEqual({
        logo: '/storage/logos/brightside.png',
        business_name: 'BrightSide Car Wash',
        tagline: 'Spotless. Every time.',
      });
    });
  });

  describe('useBusinessSettings data preservation & save guard', () => {
    it('proves A-20: after a 500 failed load, saving is blocked (returns null) resulting in zero update calls', () => {
      const failedInitialData = { logo: null, business_name: '', tagline: '' };
      const attemptedEditedForm = {
        logo: null,
        business_name: 'Accidental Overwrite',
        tagline: 'Should Not Save',
      };

      // When isLoaded = false (load failed with 500)
      const editedFields = getEditedBusinessProfileFields(
        attemptedEditedForm,
        failedInitialData,
        false
      );

      // Save is blocked: returns null
      expect(editedFields).toBeNull();
      // Zero update calls made
      expect(axiosInstance.patch).not.toHaveBeenCalled();
    });

    it('proves A-20: after a timeout failed load, saving is blocked (returns null) resulting in zero update calls', () => {
      const failedInitialData = { logo: null, business_name: '', tagline: '' };
      const blankForm = { logo: null, business_name: '', tagline: '' };

      // When isLoaded = false (timeout)
      const editedFields = getEditedBusinessProfileFields(
        blankForm,
        failedInitialData,
        false
      );

      expect(editedFields).toBeNull();
      expect(axiosInstance.patch).not.toHaveBeenCalled();
    });

    it('proves A-20: after a successful load, editing one field sends ONLY the edited field, untouched fields not sent', () => {
      const loadedProfile = {
        logo: '/storage/logos/original.png',
        business_name: 'BrightSide Car Wash',
        tagline: 'Spotless. Every time.',
      };

      // User edits ONLY tagline
      const formWithEditedTagline = {
        ...loadedProfile,
        tagline: 'The Cleanest Cars in Town!',
      };

      const editedFields = getEditedBusinessProfileFields(
        formWithEditedTagline,
        loadedProfile,
        true
      );

      expect(editedFields).toEqual({
        tagline: 'The Cleanest Cars in Town!',
      });
      // Untouched fields (logo, business_name) are NOT sent at all
      expect(editedFields).not.toHaveProperty('logo');
      expect(editedFields).not.toHaveProperty('business_name');
    });

    it('proves A-20: after a successful load, editing business_name sends ONLY business_name', () => {
      const loadedProfile = {
        logo: '/storage/logos/original.png',
        business_name: 'BrightSide Car Wash',
        tagline: 'Spotless. Every time.',
      };

      // User edits ONLY business_name
      const formWithEditedName = {
        ...loadedProfile,
        business_name: 'BrightSide Express',
      };

      const editedFields = getEditedBusinessProfileFields(
        formWithEditedName,
        loadedProfile,
        true
      );

      expect(editedFields).toEqual({
        business_name: 'BrightSide Express',
      });
      expect(editedFields).not.toHaveProperty('logo');
      expect(editedFields).not.toHaveProperty('tagline');
    });

    it('proves A-20: after a successful load, if no fields are changed, empty object is returned (zero update calls)', () => {
      const loadedProfile = {
        logo: '/storage/logos/original.png',
        business_name: 'BrightSide Car Wash',
        tagline: 'Spotless. Every time.',
      };

      const editedFields = getEditedBusinessProfileFields(
        { ...loadedProfile },
        loadedProfile,
        true
      );

      expect(editedFields).toEqual({});
      expect(Object.keys(editedFields || {}).length).toBe(0);
      expect(axiosInstance.patch).not.toHaveBeenCalled();
    });
  });

  describe('settingsApi updateBusinessProfile payload shaping', () => {
    it('proves A-20: updateBusinessProfile sends complete profile content preserving logo and business name', async () => {
      vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
        data: { success: true },
      });

      await store.dispatch(
        settingsApi.endpoints.updateBusinessProfile.initiate({
          logo: '/storage/logos/original.png',
          business_name: 'New Brand Name',
          tagline: 'Spotless. Every time.',
        })
      );

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/admin/sections/business_profile',
        {
          section_type: 'business_profile',
          content: {
            logo: '/storage/logos/original.png',
            business_name: 'New Brand Name',
            tagline: 'Spotless. Every time.',
          },
        }
      );

      const sentContent = vi.mocked(axiosInstance.patch).mock.calls[0][1] as {
        content: Record<string, unknown>;
      };
      expect(sentContent.content.logo).toBe('/storage/logos/original.png');
      expect(sentContent.content.business_name).toBe('New Brand Name');
      expect(sentContent.content.tagline).toBe('Spotless. Every time.');
    });

    it('proves A-20: handles patch update errors gracefully', async () => {
      vi.mocked(axiosInstance.patch).mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Failed to update section' },
        },
      });

      const result = await store.dispatch(
        settingsApi.endpoints.updateBusinessProfile.initiate({
          tagline: 'Failing Tagline',
        })
      );

      expect(result.error).toMatchObject({
        status: 500,
        data: 'Failed to update section',
      });
    });
  });
});
