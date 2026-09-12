import { APP_CONFIG } from "@/configs/app.config";
import axiosInstance from "@/lib/axios-instance";

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function axiosBaseQuery<T>(config: {
  url: string;
  method: string;
  body?: unknown;
}): Promise<{ data: T }> {
  const { data } = await axiosInstance.request<T>({
    url: config.url,
    method: config.method,
    data: config.body,
  });
  return { data };
}

export async function mockOrReal<T>(
  mockFn: () => T | Promise<T>,
  axiosConfig: { url: string; method: string; body?: unknown }
): Promise<{ data: T }> {
  if (APP_CONFIG.MOCK_MODE) {
    await delay(APP_CONFIG.MOCK_DELAY_MS);
    const result = await mockFn();
    return { data: result };
  }

  return axiosBaseQuery<T>(axiosConfig);
}