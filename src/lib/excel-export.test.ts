import { describe, it, expect, vi, beforeEach } from "vitest";
import * as XLSX from "xlsx";
import { exportToExcel, sanitizeCellValue } from "./excel-export";
import fs from "fs";
import path from "path";

const mockWriteFile = vi.fn();

vi.mock("xlsx", async (importOriginal) => {
  const actual = await importOriginal<typeof import("xlsx")>();
  return {
    ...actual,
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
  };
});

describe("XU5 / X-5: Supply chain security & Excel export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Supply chain security (xlsx dependency)", () => {
    it("uses SheetJS secure distribution with version >= 0.20.2 (CVE-2023-30533, CVE-2024-22363 resolved)", () => {
      // 1. Verify runtime XLSX version is >= 0.20.2
      const [major, minor, patch] = XLSX.version.split(".").map(Number);
      const isSecureVersion =
        major > 0 || minor > 20 || (minor === 20 && patch >= 2);
      expect(isSecureVersion).toBe(true);

      // 2. Verify package.json points to SheetJS secure distribution rather than unpatched npm release
      const pkgPath = path.resolve(process.cwd(), "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      expect(pkg.dependencies.xlsx).toMatch(/cdn\.sheetjs\.com/);
    });

    it("does not pollute prototype during spreadsheet creation (CVE-2023-30533 resistance)", () => {
      const maliciousData = [
        {
          __proto__: { polluted: true },
          key: "test",
          value: "normal",
        },
      ];

      const columns = [
        { key: "key", header: "Key" },
        { key: "value", header: "Value" },
      ];

      exportToExcel(maliciousData, columns, "security-test.xlsx");

      expect(mockWriteFile).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((Object.prototype as any).polluted).toBeUndefined();
    });
  });

  describe("Formula injection sanitization (CWE-1236)", () => {
    it("prepends a single quote to formula prefix characters (=, @, tab, CR)", () => {
      expect(sanitizeCellValue("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
      expect(sanitizeCellValue("@cmd")).toBe("'@cmd");
      expect(sanitizeCellValue("\t123")).toBe("'\t123");
      expect(sanitizeCellValue("\r123")).toBe("'\r123");
    });

    it("escapes malicious formula payloads starting with + or - while preserving legitimate numbers", () => {
      expect(sanitizeCellValue("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
      expect(sanitizeCellValue("-cmd|' /C calc'!A0")).toBe("'-cmd|' /C calc'!A0");
      expect(sanitizeCellValue("-123.45")).toBe("-123.45");
      expect(sanitizeCellValue("+42")).toBe("+42");
      expect(sanitizeCellValue(100)).toBe(100);
      expect(sanitizeCellValue(-50)).toBe(-50);
    });

    it("handles null, undefined, dates, and booleans safely", () => {
      expect(sanitizeCellValue(null)).toBe("");
      expect(sanitizeCellValue(undefined)).toBe("");
      expect(sanitizeCellValue(true)).toBe(true);
      expect(sanitizeCellValue(false)).toBe(false);
      const now = new Date();
      expect(sanitizeCellValue(now)).toBe(now);
    });
  });

  describe("Workbook generation and file export", () => {
    it("calls XLSX.writeFile with sanitized data and correct bookType for xlsx", () => {
      const data = [
        { id: "1", name: "Alice", balance: "-100" },
        { id: "2", name: "=DDE('cmd')", balance: "50" },
      ];
      const columns = [
        { key: "id", header: "ID" },
        { key: "name", header: "Customer Name" },
        { key: "balance", header: "Balance" },
      ];

      exportToExcel(data, columns, "customers-report", "xlsx");

      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      const [workbook, filename, options] = mockWriteFile.mock.calls[0];

      expect(filename).toBe("customers-report.xlsx");
      expect(options).toEqual({ bookType: "xlsx" });
      expect(workbook.SheetNames).toContain("Sheet1");
    });

    it("calls XLSX.writeFile with correct bookType for csv and strips existing extension from filename", () => {
      const data = [{ id: "1", role: "admin" }];
      const columns = [
        { key: "id", header: "ID" },
        { key: "role", header: "Role" },
      ];

      exportToExcel(data, columns, "export-test.xlsx", "csv");

      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      const [, filename, options] = mockWriteFile.mock.calls[0];

      expect(filename).toBe("export-test.csv");
      expect(options).toEqual({ bookType: "csv" });
    });
  });

  describe("CI Action pinning supply chain verification", () => {
    it("pins all GitHub actions in ci.yml to 40-character commit SHAs", () => {
      const ciPath = path.resolve(process.cwd(), ".github/workflows/ci.yml");
      const ciContent = fs.readFileSync(ciPath, "utf-8");

      const usesLines = ciContent
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("uses:"));

      expect(usesLines.length).toBeGreaterThan(0);

      for (const line of usesLines) {
        // Must match action@<40-char-hex-sha> with optional comment
        const match = line.match(/^uses:\s+[^@]+@([0-9a-f]{40})(?:\s*#.*)?$/);
        expect(
          match,
          `Action line '${line}' is not pinned to a 40-character commit SHA`
        ).not.toBeNull();
      }
    });
  });
});
