import { getAccessToken } from "@/lib/auth-client";
import {
  ApiMessage,
  ApiResponse,
  ApiSession,
  ApiUser,
  GetUsersParams,
} from "@/types/aiChatbox";
import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_AI_BASE_URL?.replace(/\/$/, "");

export const chatboxApis = createApi({
  reducerPath: "chatboxApi",
  baseQuery: async () => ({ data: null }),
  tagTypes: ["Chatbox"],
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<ApiUser[]>, GetUsersParams>({
      queryFn: async ({ cursor, pageSize = 20, search }) => {
        try {
          const response = await axios.get(`${API_BASE}/api/v1/admin/users/`, {
            params: {
              page_size: pageSize,
              ...(cursor ? { cursor } : {}),
              ...(search ? { search } : {}),
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getAccessToken()}`,
            },
          });
          return { data: response.data };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error ? error.message : "Unable to load users",
            },
          };
        }
      },
    }),
    getUserSessions: builder.query<ApiResponse<ApiSession[]>, string>({
      queryFn: async (userId) => {
        try {
          const response = await axios.get(
            `${API_BASE}/api/v1/admin/users/${userId}/sessions/`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAccessToken()}`,
              },
            },
          );
          return { data: response.data };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to load sessions",
            },
          };
        }
      },
      providesTags: ["Chatbox"],
    }),
    getSessionChats: builder.query<ApiResponse<ApiMessage[]>, string>({
      queryFn: async (sessionId) => {
        try {
          const response = await axios.get(
            `${API_BASE}/api/v1/admin/sessions/${sessionId}/`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAccessToken()}`,
              },
            },
          );
          return { data: response.data };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to load conversation",
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserSessionsQuery,
  useGetSessionChatsQuery,
} = chatboxApis;
