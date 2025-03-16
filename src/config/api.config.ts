// Base API URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_SECUCOM_API;

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh",
  GET_USER_DETAILS: (userId: string) => `/users/${userId}`,
} as const;

// User endpoints
export const USER_ENDPOINTS = {
  UPDATE_PROFILE: (userId: string) => `/users/${userId}`,
  UPDATE_SECRETARIAT_EMPLOYEE: (userId: string) =>
    `/users/secretariat-employees/${userId}`,
  GET_SECRETARIAT_EMPLOYEES: (secretariatId: string) =>
    `/users/secretariat-employees/by-secretariat/${secretariatId}`,
} as const;

// Social Secretariat endpoints
export const SECRETARIAT_ENDPOINTS = {
  GET_DETAILS: (secretariatId: string) =>
    `/social-secretariat/${secretariatId}`,
  UPDATE: (secretariatId: string) => `/socialSecretariat/${secretariatId}`,
  GET_ALL: "/social-secretariat",
} as const;
