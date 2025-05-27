import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { CompanyDashboard } from '@/pages';
import { SecretariatAdminDashboard } from '@/pages';

const DashboardRouter: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600">Utilisateur non connecté</p>
        </div>
      </div>
    );
  }

  // Afficher le dashboard selon le rôle
  if (hasRole('ROLE_ADMIN') || hasRole('ROLE_SECRETARIAT')) {
    return <SecretariatAdminDashboard />;
  } else if (hasRole('ROLE_COMPANY') || user.isCompanyContact) {
    return <CompanyDashboard />;
  }

  // Rôle non reconnu
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h1>
        <p className="text-gray-600">Votre rôle ne permet pas d'accéder au dashboard</p>
      </div>
    </div>
  );
};

export default DashboardRouter;
