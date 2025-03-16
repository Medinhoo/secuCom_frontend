import { apiClient } from "./baseApi";
import { User } from "@/context/AuthContext";

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
      "/auth/login",
      credentials
    );
    apiClient.setToken(response.token);
    return response;
  }

  static async logout(): Promise<void> {
    await apiClient.post("/auth/logout", undefined, { requiresAuth: true });
    apiClient.setToken(null);
  }

  static async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/refresh");
    apiClient.setToken(response.token);
    return response;
  }

  static async getUserDetails(userId: string): Promise<User> {
    return apiClient.get<User>(`/users/${userId}`, { requiresAuth: true });
  }
}
