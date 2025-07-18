import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/api/authService";
import { companyService } from "@/services/api/companyService";
import { ROUTES } from "@/config/routes.config";
import CompanyDataRequiredModal from "@/components/common/modals/CompanyDataRequiredModal";
import StatusChangeHandler from "@/components/common/StatusChangeHandler";

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
  companyConfirmed?: boolean; // Ajouter le statut de confirmation de l'entreprise
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
  forceAccountRestrictionsRefresh: () => void;
  notifyCompanySaved: () => void;
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
  const [showCompanyDataRequiredModal, setShowCompanyDataRequiredModal] = useState(false);
  const [suppressCompanyDataModal, setSuppressCompanyDataModal] = useState(false);
  const [accountRestrictionsRefreshTrigger, setAccountRestrictionsRefreshTrigger] = useState(0);

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

  // Check for company confirmation status after user details are loaded
  useEffect(() => {
    const checkCompanyConfirmation = async () => {
      if (user && user.roles?.includes("ROLE_COMPANY") && user.companyId && !suppressCompanyDataModal) {
        try {
          // D'abord essayer d'utiliser les données utilisateur si disponibles
          if (user.companyConfirmed !== undefined) {
            if (user.companyConfirmed === false) {
              setShowCompanyDataRequiredModal(true);
            } else {
              setShowCompanyDataRequiredModal(false);
            }
          } else {
            // Fallback : appel API si les données ne sont pas dans l'utilisateur
            const company = await companyService.getCompanyById(user.companyId);
            if (!company.companyConfirmed) {
              setShowCompanyDataRequiredModal(true);
            } else {
              setShowCompanyDataRequiredModal(false);
            }
          }
        } catch (error) {
          console.error("Error checking company confirmation status:", error);
        }
      } else {
        setShowCompanyDataRequiredModal(false);
      }
    };

    checkCompanyConfirmation();
  }, [user, suppressCompanyDataModal]);

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
      navigate(ROUTES.LOGIN);
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

  // Function to notify that company data was just saved
  const notifyCompanySaved = () => {
    setSuppressCompanyDataModal(true);
    setTimeout(() => setSuppressCompanyDataModal(false), 3000);
  };

  // Handle company data required modal actions
  const handleCloseCompanyDataRequiredModal = () => {
    setShowCompanyDataRequiredModal(false);
  };

  const handleCompleteProfile = () => {
    setShowCompanyDataRequiredModal(false);
    if (user?.companyId) {
      navigate(ROUTES.COMPANY_DETAILS(user.companyId));
    } else {
      navigate(ROUTES.COMPANIES);
    }
  };

  // Function to force account restrictions refresh
  const forceAccountRestrictionsRefresh = () => {
    setAccountRestrictionsRefreshTrigger(prev => prev + 1);
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
    forceAccountRestrictionsRefresh,
    notifyCompanySaved,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <CompanyDataRequiredModal
        isOpen={showCompanyDataRequiredModal}
        onClose={handleCloseCompanyDataRequiredModal}
        onCompleteProfile={handleCompleteProfile}
      />
      <StatusChangeHandler />
    </AuthContext.Provider>
  );
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
