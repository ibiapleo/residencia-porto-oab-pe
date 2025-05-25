"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types/auth";
import Cookies from "js-cookie";

interface AuthContextProps {
  user: User | null;
  permissions: { [modulo: string]: string[] };
  setUserFromToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<{ [modulo: string]: string[] }>({});

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) setUserFromToken(token);
  }, []);

  const setUserFromToken = (token: string) => {
    try {
      const decoded = jwtDecode<{ sub: string; permissions: { [modulo: string]: string[] } }>(token);
      const userData: User = {
        sub: decoded.sub,
        accessToken: token,
        permissions: decoded.permissions,
      };
      setUser(userData);
      setPermissions(decoded.permissions);
    } catch (err) {
      console.error("Erro ao decodificar o token", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    Cookies.remove("accessToken"); // ✅ Remove cookie do token
    Cookies.remove("refreshToken"); // opcional, se tiver

    setUser(null);
    setPermissions({});

    window.location.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, permissions, setUserFromToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
};
