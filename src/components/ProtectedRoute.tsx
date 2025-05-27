import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "./layout/LoadingSpinner";
import { ROUTES } from "@/config/routes.config";

interface ProtectedRouteProps {
  requiredRole?: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, user, refreshToken, hasRole, isInitialized } =
    useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!isInitialized) return; // Ne rien faire si AuthContext n'est pas initialisé

    const checkAuth = async () => {
      if (!isAuthenticated) {
        // Essayer de rafraîchir le token
        await refreshToken();
      }
      setAuthChecked(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, refreshToken]);

  // Afficher le spinner de chargement pendant la vérification
  if (!isInitialized || isLoading) {
    return <LoadingSpinner />;
  }

  // Après vérification, si toujours pas authentifié, rediriger
  if (authChecked && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Vérification des rôles
  if (requiredRole && user) {
    const requiredRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    const hasRequiredRole = requiredRoles.some((role) => hasRole(role));

    if (!hasRequiredRole) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  // Si tout est OK, afficher le contenu protégé
  return <Outlet />;
};

export default ProtectedRoute;
