export const ROUTES = {
  // Public routes
  LOGIN: "/login",

  // Protected routes
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  DIMONA: "/dimona",
  DIMONA_DETAILS: (id: string) => `/dimona/${id}`,
  CREATE_DIMONA: "/dimona/create",
  EDIT_DIMONA: (id: string) => `/dimona/${id}/edit`,

  // Document routes
  DOCUMENTS: "/documents",
  DOCUMENTS_LIST: (categoryId: string) => `/documents/${categoryId}`,
  DOCUMENT_GENERATE: (templateName: string) => `/documents/generate/${templateName}`,

  // Company routes
  COMPANIES: "/companies",
  COMPANY_CREATE: "/companies/create",
  COMPANY_DETAILS: (id: string) => `/companies/${id}`,

  // Collaborator routes
  COLLABORATORS: "/collaborator",
  COLLABORATOR_CREATE: "/collaborator/create",
  COLLABORATOR_DETAILS: (id: string) => `/collaborator/${id}`,

  // Secretariat routes
  SECRETARIAT_DETAILS: (id: string) => `/secretariat/${id}`,

  // Notification routes
  NOTIFICATIONS: "/notifications",

  // Admin routes
  SETTINGS: "/settings",
  ADMIN_USERS: "/admin/users",
  ADMIN_USERS_CREATE_COMPANY_CONTACT: "/admin/users/create/company-contact",
  ADMIN_USER_DETAILS: (id: string) => `/admin/users/${id}`,
  ADMIN_USER_EDIT: (id: string) => `/admin/users/${id}/edit`,

  // Default routes
  ROOT: "/",
} as const;
