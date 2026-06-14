import { h } from "preact";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({
  children,
}: {
  children: h.JSX.Element;
}) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    window.location.hash = "/login";
    return null;
  }

  return <>{children}</>;
}
