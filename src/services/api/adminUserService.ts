import { apiClient } from "./baseApi";
import { ADMIN_USER_ENDPOINTS, COMPANY_ENDPOINTS } from "@/config/api.config";
import { 
  AdminUser, 
  CreateCompanyContactRequest, 
  CreateCompanyRequest, 
  CreateCompanyResponse,
  UpdateUserRequest 
} from "@/types/AdminUserTypes";

export class AdminUserService {
  // Get all users for admin management
  static async getAllUsers(): Promise<AdminUser[]> {
    return apiClient.get<AdminUser[]>(ADMIN_USER_ENDPOINTS.GET_ALL_USERS, {
      requiresAuth: true,
    });
  }

  // Get user by ID
  static async getUserById(id: string): Promise<AdminUser> {
    return apiClient.get<AdminUser>(ADMIN_USER_ENDPOINTS.GET_USER_BY_ID(id), {
      requiresAuth: true,
    });
  }

  // Update user
  static async updateUser(id: string, updates: UpdateUserRequest): Promise<AdminUser> {
    return apiClient.put<AdminUser>(ADMIN_USER_ENDPOINTS.UPDATE_USER(id), updates, {
      requiresAuth: true,
    });
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(ADMIN_USER_ENDPOINTS.DELETE_USER(id), {
      requiresAuth: true,
    });
  }

  // Get all companies for selection
  static async getAllCompanies(): Promise<CreateCompanyResponse[]> {
    return apiClient.get<CreateCompanyResponse[]>(COMPANY_ENDPOINTS.GET_ALL, {
      requiresAuth: true,
    });
  }

  // Create company (Step 1 of company contact creation)
  static async createCompany(companyData: CreateCompanyRequest): Promise<CreateCompanyResponse> {
    return apiClient.post<CreateCompanyResponse>(COMPANY_ENDPOINTS.CREATE, companyData, {
      requiresAuth: true,
    });
  }

  // Create company contact (Step 2 of company contact creation)
  static async createCompanyContact(
    companyId: string, 
    userData: CreateCompanyContactRequest
  ): Promise<AdminUser> {
    return apiClient.post<AdminUser>(
      ADMIN_USER_ENDPOINTS.CREATE_COMPANY_CONTACT(companyId), 
      userData, 
      {
        requiresAuth: true,
      }
    );
  }

  // Check if BCE number already exists
  static async checkBceNumber(bceNumber: string): Promise<boolean> {
    try {
      const response = await apiClient.get<boolean>(COMPANY_ENDPOINTS.CHECK_BCE(bceNumber), {
        requiresAuth: true,
      });
      // The API returns a boolean directly: true if exists, false if not
      return response;
    } catch (error: any) {
      // If we get a 404 or similar error, the BCE doesn't exist
      if (error.status === 404 || error.message?.includes('not found')) {
        return false;
      }
      // For other errors, assume it exists to be safe
      return true;
    }
  }

  // Check if ONSS number already exists
  static async checkOnssNumber(onssNumber: string): Promise<boolean> {
    try {
      const response = await apiClient.get<boolean>(COMPANY_ENDPOINTS.CHECK_ONSS(onssNumber), {
        requiresAuth: true,
      });
      // The API returns a boolean directly: true if exists, false if not
      return response;
    } catch (error: any) {
      // If we get a 404 or similar error, the ONSS doesn't exist
      if (error.status === 404 || error.message?.includes('not found')) {
        return false;
      }
      // For other errors, assume it exists to be safe
      return true;
    }
  }
}
