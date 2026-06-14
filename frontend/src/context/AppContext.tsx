import { createContext, h } from "preact";
import { useState, useEffect } from "preact/hooks";
import type { User } from "../types";

interface AppContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: h.JSX.Element }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value: AppContextValue = {
    user,
    setUser,
    token,
    setToken: (newToken) => {
      setToken(newToken);
      if (newToken) {
        localStorage.setItem("token", newToken);
      } else {
        localStorage.removeItem("token");
      }
    },
    logout,
    isAuthenticated: !!token,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
