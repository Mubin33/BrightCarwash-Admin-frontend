import * as XLSX from "xlsx";

export function exportToExcel(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  columns: { key: string; header: string }[],
  filename: string
): void {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) => columns.map((c) => row[c.key] ?? ""));

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}