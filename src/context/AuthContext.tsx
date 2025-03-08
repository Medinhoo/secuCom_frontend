import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Types
export interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
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
  fetchUserDetails: (userId: number) => Promise<boolean>;
  hasRole: (role: string) => boolean;
  isInitialized: boolean;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider du contexte
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const navigate = useNavigate();

  // Fonction pour récupérer les détails complets de l'utilisateur
  const fetchUserDetails = async (
    userId: number,
    accessToken?: string
  ): Promise<boolean> => {
    // Utiliser soit le token passé en paramètre, soit celui du state
    const currentToken = accessToken || token;
    if (!currentToken) return false;

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Impossible de récupérer les détails utilisateur");
      }

      const userData = await response.json();
      setUser(userData);
      return true;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails utilisateur:",
        error
      );
      return false;
    }
  };

  // Fonction pour rafraîchir le token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Inclure le cookie refresh token
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      setToken(data.token);

      // Si on a l'ID utilisateur, récupérer les détails complets
      if (data.id) {
        await fetchUserDetails(data.id, data.token);
      }

      return true;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      return false;
    }
  };

  // Vérifier l'authentification au chargement initial
  useEffect(() => {
    const checkAuth = async () => {
      // Si déjà authentifié, ne rien faire
      if (token && user) {
        setIsInitialized(true);
        return;
      }

      // Tenter de rafraîchir le token
      const success = await refreshToken();
      setIsInitialized(true);

      // Si rafraîchissement réussi et sur la page login, rediriger
      if (success && window.location.pathname === "/login") {
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, []); // S'exécute une seule fois au montage

  // Navigation quand l'utilisateur devient authentifié
  useEffect(() => {
    if (user && token) {
      // Naviguer vers dashboard seulement si on est sur la page login
      if (window.location.pathname === "/login") {
        navigate("/dashboard");
      }
    }
  }, [user, token, navigate]);

  // Fonction de connexion
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Pour le cookie refresh token
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de connexion");
      }

      const data = await response.json();

      // Stocker le token
      setToken(data.token);

      // Créer un utilisateur minimal avec l'ID et les rôles
      const minimalUser = {
        id: data.id,
        username: username, // Utilisateur connecté
        roles: data.roles || [],
      };

      // Définir l'utilisateur minimal pour être authentifié immédiatement
      setUser(minimalUser);

      // Récupérer les détails complets de l'utilisateur
      await fetchUserDetails(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      console.log("Réponse de déconnexion:", data);

      // Nettoyer l'état local
      setUser(null);
      setToken(null);
      navigate("/login");
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  // Effacer les erreurs
  const clearError = () => setError(null);

  // Fonction utilitaire pour les requêtes API authentifiées
  const authFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error("Non authentifié");
    }

    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, authOptions);

    // Si token expiré (401), essayer de le rafraîchir
    if (response.status === 401) {
      const refreshSuccess = await refreshToken();

      if (refreshSuccess) {
        // Réessayer avec le nouveau token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Échec du rafraîchissement, déconnecter
        logout();
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }
    }

    return response;
  };

  // Exposer authFetch à l'application
  useEffect(() => {
    // @ts-ignore - Ajout d'une propriété personnalisée à window pour faciliter l'accès
    window.authFetch = authFetch;
  }, [token]);

  // Fonction pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  // Valeur du contexte
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

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
};

export default AuthContext;
