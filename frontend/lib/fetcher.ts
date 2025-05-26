import { logout } from "@/services/authService";
import { jwtDecode } from "jwt-decode";

export const fetcher = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers: HeadersInit = {
    // Só define Content-Type como JSON se não for FormData
    ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  // Adiciona o token JWT se existir
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      try {
        const decoded = jwtDecode<{ exp: number }>(accessToken);
        if (decoded.exp < Date.now() / 1000) {
          logout();
          throw new Error('Seu login expirou! Entre novamente na plataforma!');
        }
      } catch (error) {
        logout();
        throw new Error('Seu login expirou! Entre novamente na plataforma!');
      }

      headers['Authorization'] = `Bearer ${accessToken}`;
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
    throw new Error(error.message || 'Erro na requisição');
  }

  // Se for status 204 (No Content), retorna void
  const contentLength = response.headers.get('content-length');
  if (
    response.status === 204 ||
    (contentLength && parseInt(contentLength) === 0)
  ) {
    return undefined as unknown as T;
  }

  try {
    return await response.json();
  } catch (error) {
    return undefined as unknown as T;
  }
};