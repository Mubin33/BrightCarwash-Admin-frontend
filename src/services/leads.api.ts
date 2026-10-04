import { fetchFromBackend, apiFetch } from "@/lib/api-fetch";
import type { LeadGroupsListResponse } from "@/types/campaign";
import type {
  CreateLeadRequest,
  Lead,
  ReorderLeadRequest,
  ReorderLeadResponse,
  LeadApiResponse,
  LeadFilterOptions,
  LeadFilterOptionsResponse,
} from "@/types/leads";
import { createApi } from "@reduxjs/toolkit/query/react";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function mapApiToLead(data: LeadApiResponse): Lead {
  const nameToValue: Record<string, string> = {
    "new lead": "new",
    contracted: "contracted",
    converted: "converted",
    lost: "lost",
  };
  const rawStage = data.stage?.name?.toLowerCase() || "";
  const stageSlug = nameToValue[rawStage] ?? rawStage.replace(/\s+/g, "_");

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    avatar: "/images/avatar-placeholder.png",
    service: data.service,
    vehicle: data.vehicle,
    source: data.source,
    priority: (data.priority as Lead["priority"]) || "MEDIUM",
    deposit: 0,
    depositStatus: (data.deposit_status as Lead["depositStatus"]) || "NONE",
    stage: stageSlug,
    stageId: data.stage_id,
    stageIcon: data.stage?.icon ?? null,
    assignedToId: data.assigned_to_id || null,
    notes: data.notes || [],
    date: data.created_at?.split("T")[0] || "",
    rank: data.rank || undefined,
  };
}

// Centralized fetchFromBackend imported from @/lib/api-fetch

export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: async () => ({ data: null }),
  tagTypes: ["Leads", "LeadGroups", "LeadFilterOptions"],
  endpoints: (builder) => ({
    getLeads: builder.query<
      PaginatedResponse<Lead>,
      {
        page?: number;
        limit?: number;
        search?: string;
        source?: string;
        depositStatus?: string;
        stageId?: string;
        assignedToId?: string;
        priority?: string;
        dateFrom?: string;
        dateTo?: string;
        sortBy?: string;
        sortOrder?: string;
      }
    >({
      queryFn: async (params = {}) => {
        try {
          const queryParams = new URLSearchParams();

          queryParams.append("pagination_type", "offset");
          queryParams.append("page", String(params.page || 1));
          queryParams.append("limit", String(params.limit || 10));

          // Sort params
          queryParams.append("sort_by", params.sortBy || "created_at");
          queryParams.append("sort_order", params.sortOrder || "desc");

          // Filters
          if (params.search) queryParams.append("search", params.search);
          if (params.source) queryParams.append("source", params.source);
          if (params.depositStatus)
            queryParams.append("deposit_status", params.depositStatus);
          if (params.stageId) queryParams.append("stage_id", params.stageId);
          if (params.assignedToId)
            queryParams.append("assigned_to_id", params.assignedToId);
          if (params.priority) queryParams.append("priority", params.priority);
          if (params.dateFrom) queryParams.append("date_from", params.dateFrom);
          if (params.dateTo) queryParams.append("date_to", params.dateTo);

          const url = `/admin/lead?${queryParams.toString()}`;

          const json = await fetchFromBackend<{
            success: boolean;
            message: string;
            data: LeadApiResponse[];
            meta: {
              page: number;
              limit: number;
              total_count: number;
              total_pages: number;
              has_next: boolean;
              has_previous: boolean;
            };
          }>(url);

          return {
            data: {
              data: (json.data || []).map(mapApiToLead),
              total: json.meta?.total_count || 0,
              page: json.meta?.page || params.page || 1,
              limit: json.meta?.limit || params.limit || 10,
              totalPages: json.meta?.total_pages || 1,
            },
          };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch leads",
            },
          };
        }
      },
      providesTags: ["Leads"],
    }),

    updateLeadStage: builder.mutation<Lead, { id: string; stageName: string }>({
      queryFn: async ({ id, stageName }) => {
        try {
          const formData = new FormData();
          formData.append("stage_name", stageName);
          const json = await fetchFromBackend<{
            success: boolean;
            data: LeadApiResponse;
          }>(`/admin/lead/${id}`, {
            method: "PATCH",
            body: formData,
          });
          return { data: mapApiToLead(json.data) };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to update stage",
            },
          };
        }
      },
      async onQueryStarted({ id, stageName }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          leadsApi.util.updateQueryData(
            "getLeads",
            { page: 1, limit: 10 },
            (draft) => {
              const lead = draft.data.find((l) => l.id === id);
              if (lead) {
                const newSlug = stageName.toLowerCase().replace(/\s+/g, "_");
                lead.stage = newSlug;
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch (error) {
          patchResult.undo();
          console.error("Mutation failed, rolled back optimistic update:", error);
        }
      },
      invalidatesTags: ["Leads"],
    }),

    createLead: builder.mutation<Lead, CreateLeadRequest>({
      queryFn: async (body) => {
        try {
          const formData = new FormData();
          formData.append("name", body.name);
          formData.append("email", body.email);
          if (body.phone) formData.append("phone", body.phone);
          formData.append("service", body.service);
          formData.append("vehicle", body.vehicle);
          if (body.source) formData.append("source", body.source);
          if (body.priority) formData.append("priority", body.priority);
          if (body.deposit_status)
            formData.append("deposit_status", body.deposit_status);
          if (body.stage_name) formData.append("stage_name", body.stage_name);
          if (body.notes)
            body.notes.forEach((n) => formData.append("notes", n));
          const json = await fetchFromBackend<{
            success: boolean;
            data: LeadApiResponse;
          }>("/admin/lead", {
            method: "POST",
            body: formData,
          });
          return { data: mapApiToLead(json.data) };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to create lead",
            },
          };
        }
      },
      invalidatesTags: ["Leads"],
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data: newLead } = await queryFulfilled;
          dispatch(
            leadsApi.util.updateQueryData(
              "getLeads",
              { page: 1, limit: 10 },
              (draft) => {
                draft.data.unshift(newLead);
                draft.total += 1;
              },
            ),
          );
        } catch (error) {
          console.error("Failed to update leads cache after create:", error);
        }
      },
    }),

    getLeadGroups: builder.query<
      LeadGroupsListResponse["data"],
      { search?: string; page?: number; limit?: number } | void
    >({
      queryFn: async (params = {}) => {
        try {
          const queryParams = new URLSearchParams();
          if (params?.search) queryParams.append("search", params.search);
          if (params?.page)
            queryParams.append("page", String(params.page || 1));
          if (params?.limit)
            queryParams.append("limit", String(params.limit || 50));

          const url = `/admin/lead-groups${queryParams.toString() ? `?${queryParams}` : ""}`;
          const json = await fetchFromBackend<LeadGroupsListResponse>(url);
          return { data: json.data };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch lead groups",
            },
          };
        }
      },
      providesTags: ["LeadGroups"],
      keepUnusedDataFor: 300,
    }),

    deleteLead: builder.mutation<{ success: boolean }, string>({
      queryFn: async (id) => {
        try {
          await fetchFromBackend(`/admin/lead/${id}`, { method: "DELETE" });
          return { data: { success: true } };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to delete lead",
            },
          };
        }
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          leadsApi.util.updateQueryData(
            "getLeads",
            { page: 1, limit: 10 },
            (draft) => {
              const idx = draft.data.findIndex((l) => l.id === id);
              if (idx !== -1) {
                draft.data.splice(idx, 1);
                draft.total -= 1;
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch (error) {
          patchResult.undo();
          console.error("Mutation failed, rolled back optimistic update:", error);
        }
      },
      invalidatesTags: ["Leads"],
    }),

    connectLeadsToGroup: builder.mutation<
      { success: boolean },
      { groupId: string; leadIds: string[] }
    >({
      queryFn: async ({ groupId, leadIds }) => {
        try {
          await fetchFromBackend(`/admin/lead-groups/connect-leads`, {
            method: "POST",
            body: JSON.stringify({ groupId, leadIds }),
          });
          return { data: { success: true } };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to connect leads to group",
            },
          };
        }
      },
      invalidatesTags: ["LeadGroups", "Leads"],
    }),

    disconnectLeadsFromGroup: builder.mutation<
      { success: boolean },
      { groupId: string; leadIds: string[] }
    >({
      queryFn: async ({ groupId, leadIds }) => {
        try {
          await fetchFromBackend(`/admin/lead-groups/disconnect-leads`, {
            method: "POST",
            body: JSON.stringify({ groupId, leadIds }),
          });
          return { data: { success: true } };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to disconnect leads from group",
            },
          };
        }
      },
      invalidatesTags: ["LeadGroups", "Leads"],
    }),

    getGroupLeads: builder.query<
      Lead[],
      { groupId: string; search?: string; page?: number; limit?: number }
    >({
      queryFn: async ({ groupId, search, page = 1, limit = 50 }) => {
        try {
          const queryParams = new URLSearchParams();
          if (search) queryParams.append("search", search);
          queryParams.append("page", String(page));
          queryParams.append("limit", String(limit));

          const url = `/admin/lead-groups/${groupId}/leads${queryParams.toString() ? `?${queryParams}` : ""}`;
          const json = await fetchFromBackend<{
            success: boolean;
            data: LeadApiResponse[];
          }>(url);
          return { data: (json.data || []).map(mapApiToLead) };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch group leads",
            },
          };
        }
      },
      providesTags: ["Leads"],
    }),
    // Add to endpoints inside leadsApi
    exportLeads: builder.mutation<
      { success: boolean; message: string },
      {
        format?: "xlsx" | "csv";
        leadIds?: string[];
        search?: string;
        source?: string;
        depositStatus?: string;
        stageId?: string;
        assignedToId?: string;
        priority?: string;
        stageName?: string;
        dateFrom?: string;
        dateTo?: string;
        sortBy?: string;
        sortOrder?: string;
      }
    >({
      queryFn: async (params) => {
        try {

          // Build request body
          const requestBody: Record<string, unknown> = {
            format: params.format || "xlsx",
            sort_by: params.sortBy || "created_at",
            sort_order: params.sortOrder || "desc",
          };

          // Add optional filters
          if (params.leadIds && params.leadIds.length > 0) {
            requestBody.leadIds = params.leadIds;
          }
          if (params.search) requestBody.search = params.search;
          if (params.source) requestBody.source = params.source;
          if (params.depositStatus)
            requestBody.deposit_status = params.depositStatus;
          if (params.stageId) requestBody.stage_id = params.stageId;
          if (params.assignedToId)
            requestBody.assigned_to_id = params.assignedToId;
          if (params.priority) requestBody.priority = params.priority;
          if (params.stageName) requestBody.stage_name = params.stageName;
          if (params.dateFrom) requestBody.date_from = params.dateFrom;
          if (params.dateTo) requestBody.date_to = params.dateTo;

          const response = await apiFetch("/admin/lead/export", {
            method: "POST",
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Export failed");
          }

          // Get filename from Content-Disposition header
          const contentDisposition = response.headers.get(
            "Content-Disposition",
          );
          let filename = `leads-export.${params.format || "xlsx"}`;
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^";]+)"?/i);
            if (match) filename = match[1];
          }

          // Download the file
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          return { data: { success: true, message: "Export successful" } };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to export leads",
            },
          };
        }
      },
    }),
    updateLeadPriority: builder.mutation<
      Lead,
      { id: string; priority: string }
    >({
      queryFn: async ({ id, priority }) => {
        try {
          const formData = new FormData();
          formData.append("priority", priority);

          const res = await apiFetch(`/admin/lead/${id}`, {
            method: "PATCH",
            body: formData,
          });

          if (!res.ok) throw new Error("Failed to update priority");
          const json = await res.json();
          return { data: mapApiToLead(json.data) };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to update priority",
            },
          };
        }
      },
      async onQueryStarted({ id, priority }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          leadsApi.util.updateQueryData(
            "getLeads",
            { page: 1, limit: 10 },
            (draft) => {
              const lead = draft.data.find((l) => l.id === id);
              if (lead) {
                lead.priority = priority as
                  | "LOW"
                  | "MEDIUM"
                  | "HIGH"
                  | "URGENT";
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch (error) {
          patchResult.undo();
          console.error("Mutation failed, rolled back optimistic update:", error);
        }
      },
      invalidatesTags: ["Leads"],
    }),

    exportGroupLeads: builder.mutation<
      { success: boolean; message: string },
      {
        groupId: string;
        format: "xlsx" | "csv";
      }
    >({
      queryFn: async ({ groupId, format }) => {
        try {
          const queryParams = new URLSearchParams({ format }).toString();
          const response = await apiFetch(
            `/admin/lead-groups/${encodeURIComponent(groupId)}/export-leads?${queryParams}`,
            {
              method: "GET",
              headers: {
                Accept: "*/*",
              },
            },
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Group export failed");
          }

          const contentDisposition = response.headers.get(
            "Content-Disposition",
          );

          let filename = `group-leads-export.${format}`;

          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^";]+)"?/i);

            if (match) {
              filename = match[1];
            }
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = filename;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.URL.revokeObjectURL(url);

          return {
            data: {
              success: true,
              message: "Group export successful",
            },
          };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to export group leads",
            },
          };
        }
      },
    }),

    getLeadFilterOptions: builder.query<LeadFilterOptions, void>({
      queryFn: async () => {
        try {
          const url = "/admin/lead/filter-options";

          const json = await fetchFromBackend<LeadFilterOptionsResponse>(url);

          return {
            data: json.data,
          };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch lead filter options",
            },
          };
        }
      },

      providesTags: ["LeadFilterOptions"],

      keepUnusedDataFor: 300,
    }),

    getNonGroupLeads: builder.query<
      PaginatedResponse<Lead>,
      {
        id: string;
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      queryFn: async (params) => {
        try {
          const queryParams = new URLSearchParams();

          queryParams.append("page", String(params.page || 1));
          queryParams.append("limit", String(params.limit || 10));

          if (params.search) {
            queryParams.append("search", params.search);
          }

          const url = `/admin/lead-groups/${params.id}/non-group-leads?${queryParams.toString()}`;

          const json = await fetchFromBackend<{
            success: boolean;
            message: string;
            data: {
              leads: LeadApiResponse[];
              meta: {
                totalItems: number;
                itemCount: number;
                itemsPerPage: number;
                totalPages: number;
                currentPage: number;
                hasNextPage: boolean;
                hasPreviousPage: boolean;
              };
            };
          }>(url);

          return {
            data: {
              data: (json.data?.leads || []).map(mapApiToLead),
              total: json.data?.meta?.totalItems || 0,
              page: json.data?.meta?.currentPage || params.page || 1,
              limit: json.data?.meta?.itemsPerPage || params.limit || 10,
              totalPages: json.data?.meta?.totalPages || 1,
            },
          };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch non-group leads",
            },
          };
        }
      },
      providesTags: ["Leads"],
    }),
    reorderLead: builder.mutation<
      ReorderLeadResponse,
      ReorderLeadRequest
    >({
      queryFn: async ({ leadId, target_stage_id, prev_rank, next_rank }) => {
        try {
          const body = JSON.stringify({
            target_stage_id,
            prev_rank,
            next_rank,
          });

          const json = await fetchFromBackend<{
            success: boolean;
            message?: string;
            data?: {
              id: string;
              rank: string;
              stage_id: string;
              [key: string]: unknown;
            };
          }>(`/admin/lead/${leadId}/move`, {
            method: "PATCH",
            body,
          });

          const leadData = json?.data;
          return {
            data: {
              id: leadData?.id || leadId,
              stage_id: leadData?.stage_id || target_stage_id,
              stage: typeof leadData?.stage === "string" ? leadData.stage : undefined,
              rank: leadData?.rank || prev_rank || next_rank || "",
            },
          };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to move lead",
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useUpdateLeadStageMutation,
  useUpdateLeadPriorityMutation,
  useCreateLeadMutation,
  useGetLeadGroupsQuery,
  useDeleteLeadMutation,
  useConnectLeadsToGroupMutation,
  useDisconnectLeadsFromGroupMutation,
  useGetGroupLeadsQuery,
  useExportLeadsMutation,
  useExportGroupLeadsMutation,
  useGetLeadFilterOptionsQuery,
  useGetNonGroupLeadsQuery,
  useReorderLeadMutation,
} = leadsApi;

export const useGetLeadGroupsFilterQuery = useGetLeadGroupsQuery;
