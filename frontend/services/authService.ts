import Cookies from "js-cookie";
import { fetcher } from "@/lib/fetcher";
import { AuthResponse, User } from "@/types/auth";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  iss: string;
  sub: string;
  exp: number;
  permissions: {
    [modulo: string]: string[];
  };
}

// Apenas realiza o login e retorna o token
export const login = async (credentials: {
  username: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await fetcher<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", response.accessToken);
    Cookies.set("accessToken", response.accessToken, {
      secure: false,
      sameSite: "Strict",
      path: "/",
    });
  }

  return response;
};

// Apenas remove os dados do usuário e redireciona
export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    Cookies.remove("accessToken");

    window.location.replace("/login");
  }
};

// Função utilitária para pegar o usuário logado (pode ser usada onde precisar)
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;

  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(accessToken);
    return {
      sub: decoded.sub,
      accessToken,
      permissions: decoded.permissions,
    };
  } catch {
    return null;
  }
};

// Verifica se o token ainda é válido
export const verifyToken = (): boolean => {
  if (typeof window === "undefined") return false;

  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return false;

  try {
    const decoded = jwtDecode<JwtPayload>(accessToken);
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      logout();
      return false;
    }

    return true;
  } catch (err) {
    logout();
    return false;
  }
};
