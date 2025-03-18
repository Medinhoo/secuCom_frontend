import { apiClient } from "./baseApi";
import { User } from "@/context/AuthContext";
import { USER_ENDPOINTS } from "@/config/api.config";

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  specialization?: string;
}

export interface CompanyContactUpdateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  fonction?: string;
  permissions?: string;
}

export class UserService {
  static async updateProfile(
    userId: string,
    updates: UserProfileUpdate
  ): Promise<User> {
    return apiClient.put<User>(USER_ENDPOINTS.UPDATE_PROFILE(userId), updates, {
      requiresAuth: true,
    });
  }

  static async updateSecretariatEmployeeProfile(
    userId: string,
    updates: UserProfileUpdate
  ): Promise<User> {
    return apiClient.put<User>(
      USER_ENDPOINTS.UPDATE_SECRETARIAT_EMPLOYEE(userId),
      updates,
      { requiresAuth: true }
    );
  }

  static async updateCompanyContactProfile(
    userId: string,
    updates: CompanyContactUpdateDto
  ): Promise<User> {
    return apiClient.put<User>(
      USER_ENDPOINTS.UPDATE_COMPANY_CONTACT(userId),
      updates,
      { requiresAuth: true }
    );
  }

  static async getCompanyContacts(): Promise<User[]> {
    return apiClient.get<User[]>(USER_ENDPOINTS.GET_COMPANY_CONTACTS, {
      requiresAuth: true,
    });
  }

  static async getCompanyContactsByCompanyId(
    companyId: string
  ): Promise<User[]> {
    return apiClient.get<User[]>(
      USER_ENDPOINTS.GET_COMPANY_CONTACTS_BY_COMPANY(companyId),
      { requiresAuth: true }
    );
  }

  static async getSecretariatEmployees(secretariatId: string): Promise<User[]> {
    return apiClient.get<User[]>(
      USER_ENDPOINTS.GET_SECRETARIAT_EMPLOYEES(secretariatId),
      { requiresAuth: true }
    );
  }
}
