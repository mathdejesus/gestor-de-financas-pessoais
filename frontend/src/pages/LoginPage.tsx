import { useState } from "preact/hooks";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { setToken, setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInput = (field: string) => (e: Event) => {
    const target = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [field]: target.value }));
    setError("");
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "auth/login" : "auth/register";
      const data = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            name: formData.name,
          };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro ao autenticar");
      }

      const result = await response.json();
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({ email: "", password: "", name: "" });
  };

  return (
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>💰 Finanças Pessoais</h1>
          <p>{isLogin ? "Entre na sua conta" : "Crie sua conta"}</p>
        </div>

        {error && <div class="error-message">{error}</div>}

        <form onSubmit={handleSubmit} class="auth-form">
          {!isLogin && (
            <div class="form-group">
              <label htmlFor="name">Nome *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleInput("name")}
                placeholder="Seu nome"
                required={!isLogin}
                autoFocus={!isLogin}
              />
            </div>
          )}

          <div class="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInput("email")}
              placeholder="seu@email.com"
              required
              autoFocus={isLogin}
            />
          </div>

          <div class="form-group">
            <label htmlFor="password">Senha *</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleInput("password")}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "⏳ Aguarde..." : isLogin ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <p class="auth-toggle">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}
          <button type="button" class="link-btn" onClick={toggleMode}>
            {isLogin ? "Cadastrar" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}
