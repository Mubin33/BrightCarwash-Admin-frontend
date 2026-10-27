export const APP_CONFIG = {
  get MOCK_MODE(): boolean {
    return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_MOCK_MODE === "true";
  },
  MOCK_DELAY_MS: 400,
  get API_BASE_URL(): string {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "";
  },
  get STORAGE_URL(): string {
    return process.env.NEXT_PUBLIC_STORAGE_URL || "";
  },
  get AI_BASE_URL(): string {
    return process.env.NEXT_PUBLIC_AI_BASE_URL || "";
  },
  get SOCKET_URL(): string {
    return process.env.NEXT_PUBLIC_SOCKET_URL || "";
  },
  DASHBOARD_MOCK: false,
};
