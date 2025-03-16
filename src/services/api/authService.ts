import { apiClient } from "./baseApi";
import { User } from "@/context/AuthContext";
import { AUTH_ENDPOINTS } from "@/config/api.config";

interface LoginResponse {
  token: string;
  id: string;
  roles: string[];
}

interface LoginCredentials {
  username: string;
  password: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    apiClient.setToken(response.token);
    return response;
  }

  static async logout(): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.LOGOUT, undefined, {
      requiresAuth: true,
    });
    apiClient.setToken(null);
  }

  static async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      AUTH_ENDPOINTS.REFRESH_TOKEN
    );
    apiClient.setToken(response.token);
    return response;
  }

  static async getUserDetails(userId: string): Promise<User> {
    return apiClient.get<User>(AUTH_ENDPOINTS.GET_USER_DETAILS(userId), {
      requiresAuth: true,
    });
  }
}
