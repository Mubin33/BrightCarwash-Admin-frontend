"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
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
    resetCampaignCreation,
} from "@/store/slices/campaignCreationSlice";

export function useCampaignCreation() {
    const dispatch = useDispatch();
    const state = useSelector((state: RootState) => state.campaignCreation);

    return {
        ...state,

        setCampaignName: (name: string) => dispatch(setCampaignName(name)),
        setTags: (tags: string[]) => dispatch(setTags(tags)),
        addTag: (tag: string) => dispatch(addTag(tag)),
        removeTag: (tag: string) => dispatch(removeTag(tag)),
        setTagInput: (value: string) => dispatch(setTagInput(value)),
        setSelectedTemplateName: (name: string) =>
            dispatch(setSelectedTemplateName(name)),
        setTemplateId: (id: string | null) => dispatch(setTemplateId(id)),
        setDesignFilled: (filled: boolean) => dispatch(setDesignFilled(filled)),
        setSelectedGroup: (id: string, name: string) =>
            dispatch(setSelectedGroup({ id, name })),
        setSubject: (subject: string, preview: string) =>
            dispatch(setSubject({ subject, preview })),
        reset: () => dispatch(resetCampaignCreation()),
    };
}