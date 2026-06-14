import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/preact";
import { useAuth } from "@/hooks/useAuth";
import { AppProvider } from "@/context/AppContext";

const wrapper = ({ children }: { children: unknown }) => (
  <AppProvider>{children}</AppProvider>
);

describe("useAuth hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("returns user as null initially", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it("returns token as null initially", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.token).toBeNull();
  });

  it("returns isAuthenticated as false initially", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("calls setUser and setToken on login", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.setUser({
        id: "1",
        name: "Test User",
        email: "test@example.com",
      });
      result.current.setToken("mock-token");
    });
    expect(result.current.user).toEqual({
      id: "1",
      name: "Test User",
      email: "test@example.com",
    });
    expect(result.current.token).toBe("mock-token");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("clears user and token on logout", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.setUser({
        id: "1",
        name: "Test User",
        email: "test@example.com",
      });
      result.current.setToken("mock-token");
    });
    act(() => {
      result.current.logout();
    });
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
