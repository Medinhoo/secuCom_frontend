import { apiClient } from "./baseApi";
import { DIMONA_ENDPOINTS } from "@/config/api.config";
import { CreateDimonaRequest, DimonaDto, DimonaStatus } from "@/types/DimonaTypes";

export const dimonaService = {
  createDimona: async (request: CreateDimonaRequest): Promise<DimonaDto> => {
    return apiClient.post<DimonaDto>(DIMONA_ENDPOINTS.CREATE, request, {
      requiresAuth: true,
    });
  },

  getDimona: async (id: string): Promise<DimonaDto> => {
    return apiClient.get<DimonaDto>(DIMONA_ENDPOINTS.GET_BY_ID(id), {
      requiresAuth: true,
    });
  },

  getAllDimonas: async (): Promise<DimonaDto[]> => {
    return apiClient.get<DimonaDto[]>(DIMONA_ENDPOINTS.GET_ALL, {
      requiresAuth: true,
    });
  },

  getDimonasByCollaborator: async (
    collaboratorId: string
  ): Promise<DimonaDto[]> => {
    return apiClient.get<DimonaDto[]>(
      DIMONA_ENDPOINTS.GET_BY_COLLABORATOR(collaboratorId),
      { requiresAuth: true }
    );
  },

  getDimonasByCompany: async (companyId: string): Promise<DimonaDto[]> => {
    return apiClient.get<DimonaDto[]>(
      DIMONA_ENDPOINTS.GET_BY_COMPANY(companyId),
      { requiresAuth: true }
    );
  },

  updateDimonaStatus: async (id: string, status: DimonaStatus): Promise<DimonaDto> => {
    return apiClient.put<DimonaDto>(DIMONA_ENDPOINTS.UPDATE_STATUS(id, status), {}, {
      requiresAuth: true,
    });
  },

  deleteDimona: async (id: string): Promise<void> => {
    return apiClient.delete(DIMONA_ENDPOINTS.DELETE(id), {
      requiresAuth: true,
    });
  },
};
