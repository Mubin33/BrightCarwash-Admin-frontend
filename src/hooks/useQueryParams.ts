"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useQueryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getParam = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const removeParam = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const getAllParams = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [searchParams]);
  

  return { getParam, setParam, setParams, removeParam, getAllParams, searchParams };
}