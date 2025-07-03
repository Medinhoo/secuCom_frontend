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
  UPDATE_COMPANY_CONTACT: (userId: string) =>
    `/users/company-contacts/${userId}`,
  GET_SECRETARIAT_EMPLOYEES: (secretariatId: string) =>
    `/users/secretariat-employees/by-secretariat/${secretariatId}`,
  GET_COMPANY_CONTACTS: "/users/company-contacts",
  GET_COMPANY_CONTACT: (id: string) => `/users/company-contacts/${id}`,
  GET_COMPANY_CONTACTS_BY_COMPANY: (companyId: string) =>
    `/users/company-contacts/by-company/${companyId}`,
} as const;

// Admin User endpoints
export const ADMIN_USER_ENDPOINTS = {
  GET_ALL_USERS: "/users",
  GET_USER_BY_ID: (id: string) => `/users/${id}`,
  UPDATE_USER: (id: string) => `/users/${id}`,
  DELETE_USER: (id: string) => `/users/${id}`,
  CREATE_COMPANY_CONTACT: (companyId: string) => `/users/company-contacts?companyId=${companyId}`,
} as const;

// Social Secretariat endpoints
export const SECRETARIAT_ENDPOINTS = {
  GET_DETAILS: (secretariatId: string) =>
    `/social-secretariat/${secretariatId}`,
  UPDATE: (secretariatId: string) => `/socialSecretariat/${secretariatId}`,
  GET_ALL: "/social-secretariat",
} as const;

// Company endpoints
// Collaborator endpoints
export const COLLABORATOR_ENDPOINTS = {
  GET_ALL: "/collaborators",
  GET_BY_ID: (id: string) => `/collaborators/${id}`,
  CREATE: "/collaborators",
  UPDATE: (id: string) => `/collaborators/${id}`,
  DELETE: (id: string) => `/collaborators/${id}`,
  GET_BY_COMPANY: (companyId: string) => `/collaborators/company/${companyId}`,
} as const;

// Dimona endpoints
export const DIMONA_ENDPOINTS = {
  GET_ALL: "/dimona",
  GET_BY_ID: (id: string) => `/dimona/${id}`,
  CREATE: "/dimona",
  UPDATE: (id: string) => `/dimona/${id}`,
  DELETE: (id: string) => `/dimona/${id}`,
  UPDATE_STATUS: (id: string) => `/dimona/${id}/status`,
  GET_STATUS_HISTORY: (id: string) => `/dimona/${id}/status-history`,
  GET_LATEST_STATUS_CHANGE: (id: string) => `/dimona/${id}/status-history/latest`,
  GET_STATUS_HISTORY_COUNT: (id: string) => `/dimona/${id}/status-history/count`,
  GET_BY_COLLABORATOR: (collaboratorId: string) =>
    `/dimona/collaborator/${collaboratorId}`,
  GET_BY_COMPANY: (companyId: string) => `/dimona/company/${companyId}`,
} as const;

export const COMPANY_ENDPOINTS = {
  GET_ALL: "/company",
  GET_BY_ID: (id: string) => `/company/${id}`,
  CREATE: "/company",
  UPDATE: (id: string) => `/company/${id}`,
  DELETE: (id: string) => `/company/${id}`,
  CHECK_BCE: (bceNumber: string) => `/company/check/bce/${bceNumber}`,
  CHECK_ONSS: (onssNumber: string) => `/company/check/onss/${onssNumber}`,
  CHECK_VAT: (vatNumber: string) => `/company/check/vat/${vatNumber}`,
} as const;

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: "/notifications",
  GET_PAGINATED: (page: number, size: number) => `/notifications/paginated?page=${page}&size=${size}`,
  GET_UNREAD: "/notifications/unread",
  GET_UNREAD_COUNT: "/notifications/unread/count",
  MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_AS_READ: "/notifications/read-all",
  DELETE: (id: string) => `/notifications/${id}`,
} as const;

// Document endpoints
export const DOCUMENT_ENDPOINTS = {
  GET_TEMPLATES: "/documents/templates",
  GET_TEMPLATE_BY_ID: (id: string) => `/documents/templates/${id}`,
  GET_TEMPLATE_VARIABLES: (id: string) => `/documents/templates/${id}/variables`,
  GET_TEMPLATE_VARIABLES_BY_NAME: (name: string) => `/documents/templates/by-name/${name}/variables`,
  GENERATE_DOCUMENT: "/documents/generate",
  GET_GENERATIONS: "/documents/generations",
  GET_GENERATION_BY_ID: (id: string) => `/documents/generations/${id}`,
  DOWNLOAD_DOCUMENT: (id: string) => `/documents/generations/${id}/download-pdf`,
  DOWNLOAD_DOCUMENT_PDF: (id: string) => `/documents/generations/${id}/download-pdf`,
} as const;
