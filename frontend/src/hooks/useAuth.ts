import { useContext } from "preact/hooks";
import { AppContext } from "../context/AppContext";

export function useAuth() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AppProvider");
  }
  return context;
}
