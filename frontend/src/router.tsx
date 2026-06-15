import { h, createContext } from "preact";
import { useContext, useState, useEffect } from "preact/hooks";

type Route = "login" | "dashboard" | "transactions" | "settings" | "not-found";

export interface NavigationContext {
  current: Route;
  navigate: (route: Route) => void;
  params?: Record<string, string>;
}

export const NavigationContext = createContext<NavigationContext | null>(null);

export function NavigationProvider({ children }: { children: h.JSX.Element }) {
  const [current, setCurrent] = useState<Route>("login");
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "/";
      const [path, search] = hash.split("?");
      const routeMap: Record<string, Route> = {
        "/": "dashboard",
        "/login": "login",
        "/transactions": "transactions",
        "/settings": "settings",
      };
      setCurrent(routeMap[path] || "not-found");
      if (search) {
        const searchParams = new URLSearchParams(search);
        const paramObj: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          paramObj[key] = value;
        });
        setParams(paramObj);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (route: Route) => {
    const pathMap: Record<Route, string> = {
      login: "/login",
      dashboard: "/",
      transactions: "/transactions",
      settings: "/settings",
      "not-found": "/404",
    };
    window.location.hash = pathMap[route];
  };

  return (
    <NavigationContext.Provider value={{ current, navigate, params }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      "useNavigation deve ser usado dentro de um NavigationProvider",
    );
  }
  return context;
}
