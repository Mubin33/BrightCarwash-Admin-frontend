export const APP_CONFIG = {
  MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE === "true",
  MOCK_DELAY_MS: 400,
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://bright-carwash-api.pixelstack.cloud/api",
  STORAGE_URL:
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    "https://s3.us-east-1.amazonaws.com/bright-side-car-wash",
  AI_BASE_URL:
    process.env.NEXT_PUBLIC_AI_BASE_URL ||
    "https://bright-carwash-ai.pixelstack.cloud/api/v1",
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || "",
  DASHBOARD_MOCK: false,
} as const;
