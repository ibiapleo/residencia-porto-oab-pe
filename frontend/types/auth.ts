export interface User {
  sub: string;
  permissions: {
    [modulo: string]: string[];
  };
  accessToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string>;
}