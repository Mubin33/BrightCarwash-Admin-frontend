import { getAccessToken } from "@/lib/auth-client";
import { Users } from "@/types/aiChatbox";
import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";

export const chatboxApis = createApi({
  reducerPath: "chatboxApi",
  baseQuery: async () => ({ data: null }),
  tagTypes: ["Chatbox", "Chatbox"],
  endpoints: (builder) => ({
    getUsers: builder.query<Users, void>({
      queryFn: async () => {
        try {
          const response = await axios.get(
            "https://taste-engineer-terms-ends.trycloudflare.com/api/v1/admin/users/",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAccessToken()}`,
              },
            },
          );
          return response.data;
        } catch (error) {
          return error;
        }
      },
    }),
  }),
});

export const { useGetUsersQuery } = chatboxApis;
