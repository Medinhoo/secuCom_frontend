import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// API base URL
const API_URL = import.meta.env.VITE_SECUCOM_API;

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

  // Function to fetch complete user details
  const fetchUserDetails = async (
    userId: string,
    accessToken?: string
  ): Promise<boolean> => {
    // Use either the token passed as parameter or the one from state
    const currentToken = accessToken || token;
    if (!currentToken) throw new Error("No token provided");

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to retrieve user details");
      }

      const userData = await response.json();
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Error while retrieving user details:", error);
      return false;
    }
  };

  // Function to refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Include refresh token cookie
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      setToken(data.token);

      // If we have user ID, retrieve complete details
      if (data.id) {
        await fetchUserDetails(data.id, data.token);
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
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, []); // Run once on mount

  // Navigate when user becomes authenticated
  useEffect(() => {
    if (user && token) {
      // Navigate to dashboard only if on login page
      if (window.location.pathname === "/login") {
        navigate("/dashboard");
      }
    }
  }, [user, token, navigate]);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // For refresh token cookie
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // Store token
      setToken(data.token);

      // Create minimal user with ID and roles
      const minimalUser = {
        id: data.id,
        username: username, // Logged in user
        roles: data.roles || [],
      };

      // Set minimal user to be immediately authenticated
      setUser(minimalUser);

      // Retrieve complete user details
      await fetchUserDetails(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login error");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      // Clean local state
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
