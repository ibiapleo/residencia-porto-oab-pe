import { jwtDecode } from "jwt-decode";
import { logout } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";

export const fetcher = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Adiciona o token JWT se existir
  if (typeof window !== "undefined") {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      try {
        const decoded = jwtDecode<{ exp: number }>(accessToken);
        if (decoded.exp < Date.now() / 1000) {
          logout();
          throw new Error("Seu login expirou! Entre novamente na plataforma!");
        }
      } catch (error) {
        logout();
        throw new Error("Seu login expirou! Entre novamente na plataforma!");
        // router.push('/login');
      }

      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      logout();
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Erro na requisição");
  }

  // Se for status 204 (No Content), retorna void
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
};
