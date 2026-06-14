import { describe, it, expect } from "vitest";
import { formatDate, formatRelativeDate, getMonthYear } from "@/utils/date";

describe("date utils", () => {
  describe("formatDate", () => {
    it("formats ISO date string correctly", () => {
      expect(formatDate("2024-01-15")).toBe("15/01/2024");
      expect(formatDate("2024-12-31")).toBe("31/12/2024");
    });

    it("returns formatted date for valid string", () => {
      expect(formatDate("2024-06-10")).toBe("10/06/2024");
    });

    it('returns "Invalid Date" for invalid input', () => {
      expect(formatDate("invalid")).toBe("Invalid Date");
      expect(formatDate("")).toBe("Invalid Date");
    });
  });

  describe("formatRelativeDate", () => {
    it('returns "Hoje" for today', () => {
      const today = new Date().toISOString().split("T")[0];
      expect(formatRelativeDate(today)).toBe("Hoje");
    });

    it('returns "Ontem" for yesterday', () => {
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];
      expect(formatRelativeDate(yesterday)).toBe("Ontem");
    });

    it("returns formatted date for older dates", () => {
      expect(formatRelativeDate("2024-01-15")).toBe("15/01/2024");
    });
  });

  describe("getMonthYear", () => {
    it("returns month/year string in Portuguese", () => {
      // toLocaleDateString with month: 'long' returns lowercase month in pt-BR
      expect(getMonthYear("2024-01-15")).toMatch(/janeiro de 2024/i);
      expect(getMonthYear("2024-12-31")).toMatch(/dezembro de 2024/i);
    });
  });
});
