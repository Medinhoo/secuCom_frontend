import { apiClient } from "./baseApi";
import { DIMONA_ENDPOINTS } from "@/config/api.config";
import { 
  CreateDimonaRequest, 
  DimonaDto, 
  DimonaStatus, 
  StatusHistoryDto
} from "@/types/DimonaTypes";

export interface UpdateDimonaRequest {
  type?: string;
  entryDate?: string;
  exitDate?: string;
  exitReason?: string;
  collaboratorId?: string;
  companyId?: string;
}

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

  updateDimona: async (id: string, request: UpdateDimonaRequest): Promise<DimonaDto> => {
    try {
      const updatedDimona = await apiClient.put<DimonaDto>(
        DIMONA_ENDPOINTS.UPDATE(id), 
        request, 
        {
          requiresAuth: true,
        }
      );
      
      // Automatically update status to TO_SEND after modification
      if (updatedDimona.status === DimonaStatus.REJECTED) {
        return await dimonaService.updateDimonaStatus(
          id, 
          DimonaStatus.TO_SEND, 
          "Déclaration modifiée par le contact entreprise"
        );
      }
      
      return updatedDimona;
    } catch (error: any) {
      // Handle specific backend validation errors
      if (error.response?.status === 400 && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  updateDimonaStatus: async (
    id: string, 
    status: DimonaStatus, 
    reason?: string
  ): Promise<DimonaDto> => {
    // Validate status enum value
    if (!Object.values(DimonaStatus).includes(status)) {
      throw new Error(`Invalid status value: ${status}. Valid values are: ${Object.values(DimonaStatus).join(', ')}`);
    }

    // Build query parameters for the URL
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);
    if (reason && reason.trim()) {
      queryParams.append('reason', reason.trim());
    }

    // Construct the URL with query parameters
    const url = `${DIMONA_ENDPOINTS.UPDATE_STATUS(id)}?${queryParams.toString()}`;

    try {
      return await apiClient.put<DimonaDto>(url, null, {
        requiresAuth: true,
      });
    } catch (error: any) {
      // Handle specific backend validation errors
      if (error.response?.status === 400 && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  deleteDimona: async (id: string): Promise<void> => {
    return apiClient.delete(DIMONA_ENDPOINTS.DELETE(id), {
      requiresAuth: true,
    });
  },

  // Status history methods
  getStatusHistory: async (id: string): Promise<StatusHistoryDto[]> => {
    return apiClient.get<StatusHistoryDto[]>(
      DIMONA_ENDPOINTS.GET_STATUS_HISTORY(id),
      { requiresAuth: true }
    );
  },

  getLatestStatusChange: async (id: string): Promise<StatusHistoryDto> => {
    return apiClient.get<StatusHistoryDto>(
      DIMONA_ENDPOINTS.GET_LATEST_STATUS_CHANGE(id),
      { requiresAuth: true }
    );
  },

  getStatusHistoryCount: async (id: string): Promise<number> => {
    return apiClient.get<number>(
      DIMONA_ENDPOINTS.GET_STATUS_HISTORY_COUNT(id),
      { requiresAuth: true }
    );
  },
};
