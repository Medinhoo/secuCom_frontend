import { apiClient } from "./baseApi";
import { User } from "@/context/AuthContext";

interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  specialization?: string;
}

export class UserService {
  static async updateProfile(
    userId: string,
    updates: UserProfileUpdate
  ): Promise<User> {
    return apiClient.put<User>(`/users/${userId}`, updates, {
      requiresAuth: true,
    });
  }

  static async updateSecretariatEmployeeProfile(
    userId: string,
    updates: UserProfileUpdate
  ): Promise<User> {
    return apiClient.put<User>(
      `/users/secretariat-employees/${userId}`,
      updates,
      { requiresAuth: true }
    );
  }

  static async getSecretariatEmployees(secretariatId: string): Promise<User[]> {
    return apiClient.get<User[]>(
      `/users/secretariat-employees/by-secretariat/${secretariatId}`,
      { requiresAuth: true }
    );
  }
}
