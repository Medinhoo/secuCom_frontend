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

  // Si l'entreprise est confirmée ou l'utilisateur n'est pas ROLE_COMPANY, laisser passer
  if (!isPendingAccount) {
    return <>{children}</>;
  }

  // Si l'entreprise n'est pas confirmée, vérifier si la route est autorisée
  if (!isAllowedRoute(location.pathname)) {
    // Rediriger vers le dashboard si la route n'est pas autorisée
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Route autorisée, afficher le contenu
  return <>{children}</>;
};

export default PendingAccountGuard;
