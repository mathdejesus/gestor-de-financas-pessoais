import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateAmount,
  validateRequired,
} from "@/utils/validation";

describe("validation utils", () => {
  describe("validateEmail", () => {
    it("returns false for invalid email", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@domain.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });

    it("returns true for valid email", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.uk")).toBe(true);
    });
  });

  describe("validatePassword", () => {
    it("returns invalid for short password", () => {
      expect(validatePassword("123")).toEqual({
        valid: false,
        message: "Senha deve ter pelo menos 6 caracteres",
      });
    });

    it("returns valid for valid password", () => {
      expect(validatePassword("123456")).toEqual({ valid: true, message: "" });
      expect(validatePassword("password123")).toEqual({
        valid: true,
        message: "",
      });
    });
  });

  describe("validateAmount", () => {
    it("returns invalid for invalid amount", () => {
      expect(validateAmount("")).toEqual({
        valid: false,
        message: "Valor deve ser maior que zero",
      });
      expect(validateAmount("abc")).toEqual({
        valid: false,
        message: "Valor deve ser maior que zero",
      });
      expect(validateAmount("0")).toEqual({
        valid: false,
        message: "Valor deve ser maior que zero",
      });
      expect(validateAmount("-10")).toEqual({
        valid: false,
        message: "Valor deve ser maior que zero",
      });
    });

    it("returns valid for valid amount", () => {
      expect(validateAmount("10")).toEqual({ valid: true, message: "" });
      expect(validateAmount("10.50")).toEqual({ valid: true, message: "" });
      expect(validateAmount("1000")).toEqual({ valid: true, message: "" });
    });
  });

  describe("validateRequired", () => {
    it("returns invalid for empty value", () => {
      expect(validateRequired("", "Nome")).toEqual({
        valid: false,
        message: "Nome é obrigatório",
      });
      expect(validateRequired("   ", "Email")).toEqual({
        valid: false,
        message: "Email é obrigatório",
      });
    });

    it("returns valid for valid value", () => {
      expect(validateRequired("value", "Campo")).toEqual({
        valid: true,
        message: "",
      });
      expect(validateRequired("0", "Quantidade")).toEqual({
        valid: true,
        message: "",
      });
    });
  });
});
