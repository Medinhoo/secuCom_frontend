import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAccountRestrictions } from "@/hooks/useAccountRestrictions";
import { ROUTES } from "@/config/routes.config";

interface PendingAccountGuardProps {
  children: React.ReactNode;
}

const PendingAccountGuard: React.FC<PendingAccountGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isPendingAccount, isAllowedRoute } = useAccountRestrictions();

  // Si ce n'est pas un compte PENDING, laisser passer
  if (!isPendingAccount) {
    return <>{children}</>;
  }

  // Si c'est un compte PENDING, vérifier si la route est autorisée
  if (!isAllowedRoute(location.pathname)) {
    // Rediriger vers le dashboard si la route n'est pas autorisée
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Route autorisée, afficher le contenu
  return <>{children}</>;
};

export default PendingAccountGuard;
