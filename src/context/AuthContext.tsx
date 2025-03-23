import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/api/authService";
import { ROUTES } from "@/config/routes.config";

// Updated User interface to match backend entity
export interface User {
  id: string; // UUID type
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  accountStatus?: string; // ACTIVE, INACTIVE, LOCKED, PENDING
  roles: string[];
  createdAt?: string;
  lastLogin?: string;
  // Additional fields for secretariat employees
  position?: string;
  specialization?: string;
  secretariatId?: string;
  // Additional fields for company contacts
  fonction?: string;
  permissions?: string;
  companyId?: string;
  companyName?: string;
  isCompanyContact?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthenticated: boolean;
  refreshToken: () => Promise<boolean>;
  fetchUserDetails: (userId: string) => Promise<boolean>;
  hasRole: (role: string) => boolean;
  isInitialized: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const navigate = useNavigate();

  const fetchUserDetails = async (userId: string): Promise<boolean> => {
    try {
      const userData = await AuthService.getUserDetails(userId);
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Error while retrieving user details:", error);
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await AuthService.refreshToken();
      setToken(response.token);

      if (response.id) {
        await fetchUserDetails(response.id);
      }

      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  // Check authentication on initial load
  useEffect(() => {
    const checkAuth = async () => {
      // If already authenticated, do nothing
      if (token && user) {
        setIsInitialized(true);
        return;
      }

      // Try to refresh token
      const success = await refreshToken();
      setIsInitialized(true);

      // If refresh successful and on login page, redirect
      if (success && window.location.pathname === "/login") {
        navigate(ROUTES.DASHBOARD);
      }
    };

    checkAuth();
  }, []); // Run once on mount

  // Navigate when user becomes authenticated
  useEffect(() => {
    if (user && token) {
      // Navigate to dashboard only if on login page
      if (window.location.pathname === "/login") {
        navigate(ROUTES.DASHBOARD);
      }
    }
  }, [user, token, navigate]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.login({ username, password });

      setToken(response.token);

      // Create minimal user with ID and roles
      const minimalUser = {
        id: response.id,
        username: username,
        roles: response.roles || [],
      };

      setUser(minimalUser);

      // Retrieve complete user details
      await fetchUserDetails(response.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login error");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setToken(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Clear errors
  const clearError = () => setError(null);

  // Utility function for authenticated API requests
  const authFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, authOptions);

    // If token expired (401), try to refresh it
    if (response.status === 401) {
      const refreshSuccess = await refreshToken();

      if (refreshSuccess) {
        // Retry with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Refresh failed, logout
        logout();
        throw new Error("Session expired. Please log in again.");
      }
    }

    return response;
  };

  // Expose authFetch to the application
  useEffect(() => {
    // @ts-ignore - Add custom property to window for easy access
    window.authFetch = authFetch;
  }, [token]);

  // Function to check if user has a specific role
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  // Context value
  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    error,
    clearError,
    isAuthenticated: !!user && !!token,
    refreshToken,
    fetchUserDetails,
    hasRole,
    isInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};

export default AuthContext;
