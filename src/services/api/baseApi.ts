import { toast } from "sonner";

const API_URL = import.meta.env.VITE_SECUCOM_API;

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

interface ApiError {
  message: string;
  status?: number;
}

class BaseApiClient {
  private static instance: BaseApiClient;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): BaseApiClient {
    if (!this.instance) {
      this.instance = new BaseApiClient();
    }
    return this.instance;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: "An error occurred",
      };

      try {
        const errorData = await response.json();
        error.message = errorData.message || error.message;
      } catch {
        // If parsing JSON fails, use default error message
      }

      throw error;
    }

    return response.json();
  }

  private getHeaders(config: RequestConfig = {}): HeadersInit {
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    // Add custom headers from config
    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        if (value) headers.set(key, value.toString());
      });
    }

    // Add auth header if required
    if (config.requiresAuth && this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    return headers;
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...config,
        headers: this.getHeaders(config),
        credentials: "include",
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      const apiError = error as ApiError;

      // Show error toast
      toast.error("Error", {
        description: apiError.message || "An unexpected error occurred",
      });

      throw error;
    }
  }

  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

export const apiClient = BaseApiClient.getInstance();
