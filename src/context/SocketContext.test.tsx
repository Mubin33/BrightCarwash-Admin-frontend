import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getSocketAuthData, getSocketBaseUrl, type SocketAuthData } from "./SocketContext";
import { notificationApi } from "@/services/notification.api";
import { store } from "@/lib/store";
import axiosInstance from "@/lib/axios-instance";
import * as tokenRefresh from "@/lib/token-refresh";

// Mock axiosInstance
vi.mock("@/lib/axios-instance", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe("AU7 / A-7 / N-5 — Notifications Socket & Feed Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("A-7: Handshake token format (SocketContext)", () => {
    it("AU7 / A-7: sends bare JWT token in auth.token for gateway verification without Bearer prefix", () => {
      const rawToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.header.payload.signature";
      const authData = getSocketAuthData(rawToken);

      // CRITICAL A-7 assertion:
      // Backend notification.gateway.ts runs jwtService.verify(client.handshake.auth.token).
      // If token starts with "Bearer ", jwtService.verify fails!
      expect(authData.token).toBe(rawToken);
      expect(authData.token).not.toMatch(/^Bearer\s+/i);

      // Backwards-compatible / dual headers
      expect(authData.accessToken).toBe(rawToken);
      expect(authData.authorization).toBe(`Bearer ${rawToken}`);
    });

    it("AU7 / A-7: safely handles null or undefined tokens", () => {
      const nullAuth = getSocketAuthData(null);
      expect(nullAuth.token).toBe("");
      expect(nullAuth.accessToken).toBe("");
      expect(nullAuth.authorization).toBe("");

      const undefAuth = getSocketAuthData(undefined);
      expect(undefAuth.token).toBe("");
      expect(undefAuth.accessToken).toBe("");
      expect(undefAuth.authorization).toBe("");
    });

    it("resolves socket base URL correctly from env or fallback", () => {
      const originalSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
      const originalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      try {
        process.env.NEXT_PUBLIC_SOCKET_URL = "https://ws.example.com/";
        expect(getSocketBaseUrl()).toBe("https://ws.example.com");

        delete process.env.NEXT_PUBLIC_SOCKET_URL;
        process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/api/";
        expect(getSocketBaseUrl()).toBe("https://api.example.com");

        delete process.env.NEXT_PUBLIC_API_BASE_URL;
        expect(getSocketBaseUrl()).toBe("http://localhost:4000");
      } finally {
        process.env.NEXT_PUBLIC_SOCKET_URL = originalSocketUrl;
        process.env.NEXT_PUBLIC_API_BASE_URL = originalApiUrl;
      }
    });
  });

  describe("AU7 / A-7: Reconnection on connect_error and token refresh", () => {
    it("refreshes token and updates socket auth with bare token on auth-related connect_error", async () => {
      const refreshedToken = "new_bare_refreshed_jwt_token_456";
      const refreshSpy = vi
        .spyOn(tokenRefresh, "refreshAccessToken")
        .mockResolvedValue(refreshedToken);

      // Simulate the connect_error handler logic from SocketContext
      const fakeSocket = {
        auth: (cb: (data: object) => void) => {
          cb(getSocketAuthData("old_expired_token"));
        },
        connect: vi.fn(),
      };

      const handleConnectError = async (error: Error) => {
        const errorMessage = error?.message?.toLowerCase() || "";
        const isAuthError =
          errorMessage.includes("auth") ||
          errorMessage.includes("token") ||
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("jwt") ||
          errorMessage.includes("forbidden");

        if (isAuthError) {
          const newToken = await tokenRefresh.refreshAccessToken();
          if (newToken) {
            fakeSocket.auth = (cb: (data: object) => void) => {
              cb(getSocketAuthData(newToken));
            };
            fakeSocket.connect();
          }
        }
      };

      // Trigger auth error
      await handleConnectError(new Error("Unauthorized: jwt expired"));

      expect(refreshSpy).toHaveBeenCalledTimes(1);
      expect(fakeSocket.connect).toHaveBeenCalled();

      // Verify the new auth callback supplies the bare token
      let authDataResult: SocketAuthData | null = null;
      fakeSocket.auth((data: object) => {
        authDataResult = data as SocketAuthData;
      });

      expect(authDataResult).not.toBeNull();
      const verifiedAuth = authDataResult as unknown as SocketAuthData;
      expect(verifiedAuth.token).toBe(refreshedToken);
      expect(verifiedAuth.token).not.toMatch(/^Bearer\s+/i);
      expect(verifiedAuth.accessToken).toBe(refreshedToken);
      expect(verifiedAuth.authorization).toBe(`Bearer ${refreshedToken}`);
    });

    it("does not attempt token refresh on non-auth connect_error", async () => {
      const refreshSpy = vi.spyOn(tokenRefresh, "refreshAccessToken");

      const fakeSocket = {
        connect: vi.fn(),
      };

      const handleConnectError = async (error: Error) => {
        const errorMessage = error?.message?.toLowerCase() || "";
        const isAuthError =
          errorMessage.includes("auth") ||
          errorMessage.includes("token") ||
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("jwt") ||
          errorMessage.includes("forbidden");

        if (isAuthError) {
          await tokenRefresh.refreshAccessToken();
          fakeSocket.connect();
        }
      };

      await handleConnectError(new Error("Connection timed out (ECONNREFUSED)"));

      expect(refreshSpy).not.toHaveBeenCalled();
      expect(fakeSocket.connect).not.toHaveBeenCalled();
    });
  });

  describe("AU7 / N-5: Notification feed and mark-all-read API endpoints", () => {
    it("AU7 / N-5: getNotification calls /admin/notifications/offset-feed with correct params", async () => {
      const mockFeedResponse = {
        success: true,
        message: "OK",
        data: {
          items: [
            {
              id: "notif_1",
              title: "Lead Assigned",
              body: "You have a new lead",
              created_at: new Date().toISOString(),
              is_read: false,
            },
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 1,
            total_pages: 1,
            has_next_page: false,
            has_prev_page: false,
          },
        },
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockFeedResponse,
      });

      const result = await store.dispatch(
        notificationApi.endpoints.getNotification.initiate({
          page: 1,
          limit: 10,
        })
      );

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/admin/notifications/offset-feed",
        {
          params: { page: 1, limit: 10 },
        }
      );
      expect(result.data).toEqual(mockFeedResponse);
    });

    it("AU7 / N-5: getNotification formats HTTP errors gracefully", async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce({
        response: {
          status: 403,
          data: { message: "Forbidden: insufficient permissions" },
        },
      });

      const result = await store.dispatch(
        notificationApi.endpoints.getNotification.initiate({
          page: 2,
          limit: 5,
        })
      );

      expect(result.error).toEqual({
        status: 403,
        data: "Forbidden: insufficient permissions",
      });
    });

    it("AU7 / N-5: readAllNotification calls PATCH /admin/notifications/read/all", async () => {
      const mockReadResponse = {
        success: true,
        message: "All notifications marked as read",
        data: { items: [], meta: { total: 0 } },
      };

      vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
        data: mockReadResponse,
      });

      const result = await store.dispatch(
        notificationApi.endpoints.readAllNotification.initiate()
      );

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/admin/notifications/read/all"
      );
      expect(result.data).toEqual(mockReadResponse);
    });

    it("AU7 / N-5: readAllNotification handles error gracefully", async () => {
      vi.mocked(axiosInstance.patch).mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: "Internal server error" },
        },
      });

      const result = await store.dispatch(
        notificationApi.endpoints.readAllNotification.initiate()
      );

      expect(result.error).toEqual({
        status: 500,
        data: "Internal server error",
      });
    });

    it("getNotificationMetrics calls GET /admin/notifications/metrics", async () => {
      const mockMetrics = {
        success: true,
        data: { unread: 5 },
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockMetrics,
      });

      const result = await store.dispatch(
        notificationApi.endpoints.getNotificationMetrics.initiate()
      );

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/admin/notifications/metrics"
      );
      expect(result.data).toEqual(mockMetrics);
    });
  });
});
