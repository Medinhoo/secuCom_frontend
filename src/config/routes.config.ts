export const ROUTES = {
  // Public routes
  LOGIN: "/login",

  // Protected routes
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  DIMONA: "/dimona",
  DIMONA_DETAILS: (id: string) => `/dimona/${id}`,
  CREATE_DIMONA: "/dimona/create",

  // Document routes
  DOCUMENTS: "/documents",
  DOCUMENTS_LIST: (categoryId: string) => `/documents/${categoryId}`,

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

  // Admin routes
  SETTINGS: "/settings",

  // Default routes
  ROOT: "/",
} as const;
