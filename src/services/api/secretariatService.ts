import { apiClient } from "./baseApi";
import { SocialSecretariat } from "@/types/SocialSecretariatTypes";

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
      `/social-secretariat/${secretariatId}`,
      { requiresAuth: true }
    );
  }

  static async updateSecretariat(
    secretariatId: string,
    updates: SecretariatUpdate
  ): Promise<SocialSecretariat> {
    return apiClient.put<SocialSecretariat>(
      `/socialSecretariat/${secretariatId}`,
      updates,
      { requiresAuth: true }
    );
  }

  static async getAllSecretariats(): Promise<SocialSecretariat[]> {
    return apiClient.get<SocialSecretariat[]>("/social-secretariat", {
      requiresAuth: true,
    });
  }
}
