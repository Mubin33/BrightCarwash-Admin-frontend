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
