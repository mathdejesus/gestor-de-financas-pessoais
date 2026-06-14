import { describe, it, expect } from "vitest";
import { formatCurrency, parseCurrency } from "@/utils/currency";

describe("currency utils", () => {
  describe("formatCurrency", () => {
    it("formats positive numbers correctly", () => {
      expect(formatCurrency(1000)).toMatch(/R\$\s*1\.000,00/);
      expect(formatCurrency(1000.5)).toMatch(/R\$\s*1\.000,50/);
      expect(formatCurrency(0.01)).toMatch(/R\$\s*0,01/);
    });

    it("formats negative numbers correctly", () => {
      expect(formatCurrency(-1000)).toMatch(/-R\$\s*1\.000,00/);
      expect(formatCurrency(-0.01)).toMatch(/-R\$\s*0,01/);
    });

    it("formats zero correctly", () => {
      expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
    });

    it("handles large numbers", () => {
      expect(formatCurrency(1000000)).toMatch(/R\$\s*1\.000\.000,00/);
    });
  });

  describe("parseCurrency", () => {
    it("parses valid currency strings", () => {
      expect(parseCurrency("R$ 1.000,00")).toBe(1000);
      expect(parseCurrency("1.000,00")).toBe(1000);
      expect(parseCurrency("1000")).toBe(1000);
      expect(parseCurrency("-R$ 500,00")).toBe(-500);
    });

    it("returns 0 for invalid input", () => {
      expect(parseCurrency("invalid")).toBe(0);
      expect(parseCurrency("")).toBe(0);
    });
  });
});
