export const APP_CONFIG = {
  get MOCK_MODE(): boolean {
    return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_MOCK_MODE === "true";
  },
  MOCK_DELAY_MS: 400,
  get API_BASE_URL(): string {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "https://bright-carwash-api.pixelstack.cloud/api";
  },
  get STORAGE_URL(): string {
    return process.env.NEXT_PUBLIC_STORAGE_URL || "https://s3.us-east-1.amazonaws.com/bright-side-car-wash";
  },
  get AI_BASE_URL(): string {
    return process.env.NEXT_PUBLIC_AI_BASE_URL || "https://bright-carwash-ai.pixelstack.cloud/api/v1";
  },
  get SOCKET_URL(): string {
    return process.env.NEXT_PUBLIC_SOCKET_URL || "";
  },
  DASHBOARD_MOCK: false,
};
