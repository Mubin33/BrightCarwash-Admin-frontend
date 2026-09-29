"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useReportState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tab =
    (searchParams.get("tab") as
      | "lead-conversion"
      | "deposit-revenue"
      | "campaign-performance"
      | "member-activity") || "lead-conversion";
  const period = searchParams.get("period") || "last30days";

  const setTab = useCallback(
    (t: string, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", t);
      if (replace) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      } else {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [router, pathname, searchParams],
  );

  const setPeriod = useCallback(
    (p: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("period", p);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return { tab, period, setTab, setPeriod };
}
