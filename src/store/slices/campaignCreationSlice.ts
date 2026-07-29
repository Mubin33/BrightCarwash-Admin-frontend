import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CampaignCreationState {
    campaignName: string;
    tags: string[];
    tagInput: string;
    selectedTemplateName: string;
    templateId: string | null;
    designFilled: boolean;
    selectedGroupId: string | null;
    selectedGroupName: string | null;
    subject: string;
    previewText: string;
    filled: {
        recipients: boolean;
        subject: boolean;
        design: boolean;
    };
    isEdit: boolean;
    campaignId: string | null;
}

const initialState: CampaignCreationState = {
    campaignName: '',
    tags: [],
    tagInput: '',
    selectedTemplateName: '',
    templateId: null,
    designFilled: false,
    selectedGroupId: null,
    selectedGroupName: null,
    subject: '',
    previewText: '',
    filled: {
        recipients: false,
        subject: false,
        design: false,
    },
    isEdit: false,
    campaignId: null,
};

const campaignCreationSlice = createSlice({
    name: 'campaignCreation',
    initialState,
    reducers: {
        resetCampaignCreation: () => {
            console.log('🔄 Resetting campaign creation state to initial');
            return initialState;
        },

        setCampaignName: (state, action: PayloadAction<string>) => {
            state.campaignName = action.payload;
        },

        setTags: (state, action: PayloadAction<string[]>) => {
            state.tags = action.payload;
        },

        addTag: (state, action: PayloadAction<string>) => {
            if (!state.tags.includes(action.payload)) {
                state.tags.push(action.payload);
            }
        },

        setTagInput: (state, action: PayloadAction<string>) => {
            state.tagInput = action.payload;
        },

        removeTag: (state, action: PayloadAction<string>) => {
            state.tags = state.tags.filter(t => t !== action.payload);
        },

        setSelectedTemplateName: (state, action: PayloadAction<string>) => {
            state.selectedTemplateName = action.payload;
        },

        setTemplateId: (state, action: PayloadAction<string | null>) => {
            state.templateId = action.payload;
            if (action.payload) {
                state.filled.design = true;
                state.designFilled = true;
            } else {
                state.filled.design = false;
                state.designFilled = false;
            }
        },

        setDesignFilled: (state, action: PayloadAction<boolean>) => {
            state.designFilled = action.payload;
            state.filled.design = action.payload;
        },

        setSelectedGroup: (state, action: PayloadAction<{ id: string; name: string }>) => {
            state.selectedGroupId = action.payload.id;
            state.selectedGroupName = action.payload.name;
            state.filled.recipients = true;
        },

        setSubject: (state, action: PayloadAction<{ subject: string; preview: string }>) => {
            state.subject = action.payload.subject;
            state.previewText = action.payload.preview;
            state.filled.subject = true;
        },

        loadCampaignForEdit: (state, action: PayloadAction<Partial<CampaignCreationState>>) => {
            console.log('📝 Loading campaign for edit:', action.payload);

            // Reset first to clear any previous state
            Object.assign(state, initialState);

            // Then apply the edit data
            Object.assign(state, action.payload);
            state.isEdit = true;

            console.log('📝 State after load:', state);
        },
    },
});

export const {
    resetCampaignCreation,
    setCampaignName,
    setTags,
    addTag,
    removeTag,
    setTagInput,
    setSelectedTemplateName,
    setTemplateId,
    setDesignFilled,
    setSelectedGroup,
    setSubject,
    loadCampaignForEdit,
} = campaignCreationSlice.actions;

export default campaignCreationSlice.reducer;