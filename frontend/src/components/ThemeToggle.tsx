import { h } from "preact";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      class="theme-toggle"
      onClick={toggleTheme}
      aria-label="Alternar tema"
      data-testid="theme-toggle"
    >
      {theme === "dark" ? (
        <span role="img" aria-label="Lua" data-testid="moon-icon">
          🌙
        </span>
      ) : (
        <span role="img" aria-label="Sol" data-testid="sun-icon">
          ☀️
        </span>
      )}
    </button>
  );
}
