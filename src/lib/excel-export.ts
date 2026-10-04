import * as XLSX from "xlsx";

/**
 * Sanitizes cell values to prevent CSV / Excel formula injection (CWE-1236).
 * Prepends a single quote (') if the value is a string starting with:
 * - '=' (formula prefix)
 * - '@' (implicit intersection / formula prefix in Excel)
 * - '\t' (tab)
 * - '\r' (carriage return)
 * - '+' or '-' when followed by a non-digit / formula expression
 */
export function sanitizeCellValue(val: unknown): unknown {
  if (val === null || val === undefined) {
    return "";
  }

  // Preserve pure numbers, booleans, and dates without stringification
  if (typeof val === "number" || typeof val === "boolean" || val instanceof Date) {
    return val;
  }

  const str = String(val);

  if (!str) {
    return "";
  }

  // If string starts with =, @, tab, or carriage return, escape with '
  if (/^[=@\t\r]/.test(str)) {
    return `'${str}`;
  }

  // If string starts with + or -, check if it's a valid numeric value
  if (/^[+-]/.test(str)) {
    // If it's a valid number representation like "-50" or "+12.50", keep as is
    if (/^[+-]?\d+(\.\d+)?$/.test(str.trim())) {
      return str;
    }
    // Otherwise it's a formula / DDE payload like "+cmd|..." or "-HYPERLINK(...)"
    return `'${str}`;
  }

  // If it starts with pipe, quotes, or backslash followed by formula chars
  if (/^["'|\\]/.test(str) && /^[=@\t\r+-]/.test(str.slice(1))) {
    return `'${str}`;
  }

  return str;
}

export function exportToExcel(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  columns: { key: string; header: string }[],
  filename: string,
  format: "xlsx" | "csv" = "xlsx"
): void {
  const headers = columns.map((c) => sanitizeCellValue(c.header));
  const rows = data.map((row) =>
    columns.map((c) => sanitizeCellValue(row[c.key] ?? ""))
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Clean filename: remove trailing .xlsx or .csv if already present
  const baseName = filename.replace(/\.(xlsx|csv)$/i, "");
  const ext = format === "csv" ? "csv" : "xlsx";

  XLSX.writeFile(workbook, `${baseName}.${ext}`, {
    bookType: ext,
  });
}
