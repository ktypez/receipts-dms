import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface AuthContextType {
  authenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      setAuthenticated(data.authenticated);
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const login = useCallback(async (password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Invalid password");
    }
    setAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
