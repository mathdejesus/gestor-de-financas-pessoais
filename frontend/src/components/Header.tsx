import { h } from 'preact';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="logo">
            <span class="logo-icon">💰</span>
            <span>Finanças</span>
          </h1>
        </div>
        <div class="header-right">
          <button
            class="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div class="user-menu">
            <span class="user-name">{user?.name || 'Usuário'}</span>
            <button class="btn btn-secondary btn-sm" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
