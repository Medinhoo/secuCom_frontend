import { apiClient } from "./baseApi";
import { COLLABORATOR_ENDPOINTS } from "@/config/api.config";
import type { Collaborator } from "@/types/CollaboratorTypes";

export const collaboratorService = {
  getAllCollaborators: () =>
    apiClient.get<Collaborator[]>(COLLABORATOR_ENDPOINTS.GET_ALL, {
      requiresAuth: true,
    }),

  getCollaboratorById: (id: string) =>
    apiClient.get<Collaborator>(COLLABORATOR_ENDPOINTS.GET_BY_ID(id), {
      requiresAuth: true,
    }),

  createCollaborator: (
    collaborator: Omit<Collaborator, "id" | "createdAt" | "updatedAt">
  ) =>
    apiClient.post<Collaborator>(COLLABORATOR_ENDPOINTS.CREATE, collaborator, {
      requiresAuth: true,
    }),

  updateCollaborator: (id: string, collaborator: Partial<Collaborator>) =>
    apiClient.put<Collaborator>(
      COLLABORATOR_ENDPOINTS.UPDATE(id),
      collaborator,
      {
        requiresAuth: true,
      }
    ),

  deleteCollaborator: (id: string) =>
    apiClient.delete(COLLABORATOR_ENDPOINTS.DELETE(id), { requiresAuth: true }),
};
