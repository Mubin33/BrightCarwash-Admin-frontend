export const APP_CONFIG = {
  MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE === "true",
  MOCK_DELAY_MS: 400,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  DASHBOARD_MOCK: false,
} as const;