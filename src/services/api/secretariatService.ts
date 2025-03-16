import { apiClient } from "./baseApi";
import { SocialSecretariat } from "@/types/SocialSecretariatTypes";
import { SECRETARIAT_ENDPOINTS } from "@/config/api.config";

interface SecretariatUpdate {
  name?: string;
  companyNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export class SecretariatService {
  static async getSecretariatDetails(
    secretariatId: string
  ): Promise<SocialSecretariat> {
    return apiClient.get<SocialSecretariat>(
      SECRETARIAT_ENDPOINTS.GET_DETAILS(secretariatId),
      { requiresAuth: true }
    );
  }

  static async updateSecretariat(
    secretariatId: string,
    updates: SecretariatUpdate
  ): Promise<SocialSecretariat> {
    return apiClient.put<SocialSecretariat>(
      SECRETARIAT_ENDPOINTS.UPDATE(secretariatId),
      updates,
      { requiresAuth: true }
    );
  }

  static async getAllSecretariats(): Promise<SocialSecretariat[]> {
    return apiClient.get<SocialSecretariat[]>(SECRETARIAT_ENDPOINTS.GET_ALL, {
      requiresAuth: true,
    });
  }
}
