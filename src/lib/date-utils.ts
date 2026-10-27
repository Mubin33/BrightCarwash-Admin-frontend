import { format } from "date-fns";

/**
 * Standard date formatter: e.g. "Sep 24, 2025"
 * Safe against timezone shifts when parsing YYYY-MM-DD date-only strings.
 */
export function formatStandardDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "—";
  try {
    let date: Date;
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim();
      if (!trimmed) return "—";
      // Prevent timezone shift when parsing YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, d] = trimmed.split("-").map(Number);
        date = new Date(y, m - 1, d);
      } else {
        date = new Date(trimmed);
      }
    } else {
      date = dateInput;
    }
    if (isNaN(date.getTime())) return String(dateInput);
    return format(date, "MMM d, yyyy");
  } catch {
    return String(dateInput);
  }
}

/**
 * Standard date & time formatter for files and attachments:
 * E.g. "Sep 24, 2025, 10:30 AM"
 */
export function formatFileDateTime(dateInput?: string | Date | null): string {
  if (!dateInput) return "Recently added";
  try {
    let date: Date;
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim();
      if (!trimmed) return "Recently added";
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, d] = trimmed.split("-").map(Number);
        date = new Date(y, m - 1, d);
      } else {
        date = new Date(trimmed);
      }
    } else {
      date = dateInput;
    }
    if (isNaN(date.getTime())) return "Recently added";
    return format(date, "MMM d, yyyy, h:mm a");
  } catch {
    return "Recently added";
  }
}

/**
 * Standard date & time formatter:
 * E.g. "Sep 24, 2025, 10:30 AM" or "Sep 24, 2025" if date-only
 */
export function formatStandardDateTime(dateInput?: string | Date | null): string {
  if (!dateInput) return "Recently added";
  try {
    let date: Date;
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim();
      if (!trimmed) return "Recently added";
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, d] = trimmed.split("-").map(Number);
        date = new Date(y, m - 1, d);
        return format(date, "MMM d, yyyy");
      } else {
        date = new Date(trimmed);
      }
    } else {
      date = dateInput;
    }
    if (isNaN(date.getTime())) return String(dateInput);
    return format(date, "MMM d, yyyy, h:mm a");
  } catch {
    return String(dateInput);
  }
}

export const BUSINESS_TIMEZONE = "America/Chicago";

function formatYMD(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, "0");
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getZonedDateParts(
  date: Date,
  timeZone: string = BUSINESS_TIMEZONE,
): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") {
      map[p.type] = parseInt(p.value, 10);
    }
  }
  return { year: map.year, month: map.month, day: map.day };
}

/**
 * Formats a UTC ISO timestamp or Date into YYYY-MM-DD in the business timezone.
 * E.g. "2026-11-01T01:00:00Z" (8 PM Central on Oct 31) -> "2026-10-31"
 */
export function formatBusinessDate(
  dateInput?: string | Date | null,
  timeZone: string = BUSINESS_TIMEZONE,
): string {
  if (!dateInput) return "";
  try {
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim();
      if (!trimmed) return "";
      // If already a calendar date YYYY-MM-DD, keep as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }
      const d = new Date(trimmed);
      if (isNaN(d.getTime())) return trimmed;
      const { year, month, day } = getZonedDateParts(d, timeZone);
      return formatYMD(year, month, day);
    } else {
      if (isNaN(dateInput.getTime())) return "";
      const { year, month, day } = getZonedDateParts(dateInput, timeZone);
      return formatYMD(year, month, day);
    }
  } catch {
    return typeof dateInput === "string" ? dateInput : "";
  }
}

/**
 * Computes business report date ranges anchored to the business time zone (Central Time).
 * Ensures identical bounds for viewers regardless of their local browser timezone (e.g. Chicago vs Dhaka).
 */
export function getTimezoneOffsetString(
  date: Date,
  timeZone: string = BUSINESS_TIMEZONE,
): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (tzPart && tzPart.value.startsWith("GMT")) {
      return tzPart.value.replace("GMT", "");
    }
  } catch {}
  return "-05:00";
}

export function getBusinessReportDateRange(
  period: string,
  now: Date = new Date(),
  timeZone: string = BUSINESS_TIMEZONE,
): { startDate: string; endDate: string } {
  const { year, month, day } = getZonedDateParts(now, timeZone);
  const todayStr = formatYMD(year, month, day);
  const endOffset = getTimezoneOffsetString(now, timeZone);

  if (period === "thisMonth") {
    const startDateStr = formatYMD(year, month, 1);
    const startOffset = getTimezoneOffsetString(
      new Date(Date.UTC(year, month - 1, 1, 12)),
      timeZone,
    );
    return {
      startDate: `${startDateStr}T00:00:00${startOffset}`,
      endDate: `${todayStr}T23:59:59${endOffset}`,
    };
  }

  if (period === "last30days") {
    const anchor = new Date(Date.UTC(year, month - 1, day, 12));
    anchor.setUTCDate(anchor.getUTCDate() - 30);
    const startDateStr = formatYMD(
      anchor.getUTCFullYear(),
      anchor.getUTCMonth() + 1,
      anchor.getUTCDate(),
    );
    const startOffset = getTimezoneOffsetString(anchor, timeZone);
    return {
      startDate: `${startDateStr}T00:00:00${startOffset}`,
      endDate: `${todayStr}T23:59:59${endOffset}`,
    };
  }

  if (period === "last6months") {
    const anchor = new Date(Date.UTC(year, month - 1, day, 12));
    anchor.setUTCMonth(anchor.getUTCMonth() - 6);
    const startDateStr = formatYMD(
      anchor.getUTCFullYear(),
      anchor.getUTCMonth() + 1,
      anchor.getUTCDate(),
    );
    const startOffset = getTimezoneOffsetString(anchor, timeZone);
    return {
      startDate: `${startDateStr}T00:00:00${startOffset}`,
      endDate: `${todayStr}T23:59:59${endOffset}`,
    };
  }

  // thisYear default
  const startDateStr = formatYMD(year, 1, 1);
  const startOffset = getTimezoneOffsetString(
    new Date(Date.UTC(year, 0, 1, 12)),
    timeZone,
  );
  return {
    startDate: `${startDateStr}T00:00:00${startOffset}`,
    endDate: `${todayStr}T23:59:59${endOffset}`,
  };
}
