import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/config/routes.config";

export interface AccountRestrictions {
  isPendingAccount: boolean;
  isAllowedRoute: (path: string) => boolean;
  getAllowedRoutes: () => string[];
  getRestrictedRoutes: () => string[];
  shouldShowInNavigation: (path: string) => boolean;
}

export const useAccountRestrictions = (): AccountRestrictions => {
  const { user } = useAuth();

  const isPendingAccount = user?.accountStatus === "PENDING" && 
    (user?.isCompanyContact || user?.roles?.includes("ROLE_COMPANY"));

  // Pages autorisées pour les comptes PENDING
  const allowedRoutesForPending = [
    ROUTES.DASHBOARD,
    ROUTES.PROFILE,
    ROUTES.COMPANIES,
    // Permettre l'accès aux détails de l'entreprise de l'utilisateur
    ...(user?.companyId ? [ROUTES.COMPANY_DETAILS(user.companyId)] : []),
    ROUTES.COMPANY_CREATE,
  ];

  // Pages bloquées pour les comptes PENDING
  const restrictedRoutesForPending = [
    ROUTES.COLLABORATORS,
    ROUTES.COLLABORATOR_CREATE,
    ROUTES.DIMONA,
    ROUTES.CREATE_DIMONA,
    ROUTES.DOCUMENTS,
    ROUTES.NOTIFICATIONS,
    ROUTES.SETTINGS,
    ROUTES.ADMIN_USERS,
  ];

  const isAllowedRoute = (path: string): boolean => {
    if (!isPendingAccount) {
      return true; // Pas de restrictions pour les comptes actifs
    }

    // Vérifier si la route est explicitement autorisée
    const isExplicitlyAllowed = allowedRoutesForPending.some(allowedRoute => {
      if (typeof allowedRoute === 'string') {
        return path === allowedRoute || path.startsWith(allowedRoute + '/');
      }
      return false;
    });

    if (isExplicitlyAllowed) {
      return true;
    }

    // Vérifier les routes dynamiques (comme /companies/:id)
    if (path.startsWith('/companies/')) {
      // Permettre l'accès aux détails de l'entreprise de l'utilisateur
      if (user?.companyId && path === `/companies/${user.companyId}`) {
        return true;
      }
      // Permettre l'accès à la liste des entreprises
      if (path === '/companies') {
        return true;
      }
    }

    return false;
  };

  const getAllowedRoutes = (): string[] => {
    if (!isPendingAccount) {
      return []; // Pas de restrictions
    }
    return allowedRoutesForPending;
  };

  const getRestrictedRoutes = (): string[] => {
    if (!isPendingAccount) {
      return []; // Pas de restrictions
    }
    return restrictedRoutesForPending;
  };

  const shouldShowInNavigation = (path: string): boolean => {
    if (!isPendingAccount) {
      return true; // Afficher tous les éléments pour les comptes actifs
    }

    return isAllowedRoute(path);
  };

  return {
    isPendingAccount,
    isAllowedRoute,
    getAllowedRoutes,
    getRestrictedRoutes,
    shouldShowInNavigation,
  };
};
