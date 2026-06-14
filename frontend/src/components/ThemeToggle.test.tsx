import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import ThemeToggle from "@/components/ThemeToggle";

let mockTheme = "light";
let mockToggleTheme = vi.fn();

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    get theme() {
      return mockTheme;
    },
    toggleTheme: mockToggleTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = "light";
    mockToggleTheme = vi.fn();
  });

  it("renders theme toggle button", () => {
    render(<ThemeToggle />);
    const button = screen.getByTestId("theme-toggle");
    expect(button).toBeInTheDocument();
  });

  it("shows sun icon in light mode", () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    const sunIcon = screen.getByTestId("sun-icon");
    expect(sunIcon).toBeInTheDocument();
  });

  it("shows moon icon in dark mode", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    const moonIcon = screen.getByTestId("moon-icon");
    expect(moonIcon).toBeInTheDocument();
  });

  it("calls toggleTheme on click", () => {
    mockTheme = "light";
    mockToggleTheme = vi.fn();
    render(<ThemeToggle />);
    const button = screen.getByTestId("theme-toggle");
    fireEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
