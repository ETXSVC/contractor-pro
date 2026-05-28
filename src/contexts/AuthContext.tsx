import { createContext, useContext, useState, ReactNode } from "react";

export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("cp_token"));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("cp_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem("cp_token", newToken);
    localStorage.setItem("cp_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    const keys = ["cp_token", "cp_user", "cp_projects", "cp_tasks", "cp_documents",
      "cp_team", "cp_proposals", "cp_invoices", "cp_changeOrders", "cp_costCodes", "cp_timeRecords"];
    keys.forEach(k => localStorage.removeItem(k));
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
