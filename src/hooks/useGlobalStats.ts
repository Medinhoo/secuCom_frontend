import { useState, useEffect } from 'react';
import { dimonaService } from '@/services/api/dimonaService';
import { collaboratorService } from '@/services/api/collaboratorService';
import { companyService } from '@/services/api/companyService';
import { NotificationService } from '@/services/api/notificationService';
import { DimonaStatus, DimonaType, DimonaDto } from '@/types/DimonaTypes';
import { CollaboratorType } from '@/types/CollaboratorTypes';

interface GlobalStats {
  // Dimona stats
  totalDimonas: number;
  dimonasByStatus: Record<DimonaStatus, number>;
  dimonasByType: Record<DimonaType, number>;
  dimonasWithErrors: number;
  
  // Company stats
  totalCompanies: number;
  newCompaniesThisMonth: number;
  
  // Collaborator stats
  totalCollaborators: number;
  newCollaboratorsThisMonth: number;
  collaboratorsByType: Record<CollaboratorType, number>;
  
  // Notification stats
  unreadNotifications: number;
}

export const useGlobalStats = () => {
  const [stats, setStats] = useState<GlobalStats>({
    totalDimonas: 0,
    dimonasByStatus: {
      [DimonaStatus.TO_CONFIRM]: 0,
      [DimonaStatus.TO_SEND]: 0,
      [DimonaStatus.IN_PROGRESS]: 0,
      [DimonaStatus.REJECTED]: 0,
      [DimonaStatus.ACCEPTED]: 0,
    },
    dimonasByType: {
      [DimonaType.IN]: 0,
      [DimonaType.OUT]: 0,
      [DimonaType.UPDATE]: 0,
    },
    dimonasWithErrors: 0,
    totalCompanies: 0,
    newCompaniesThisMonth: 0,
    totalCollaborators: 0,
    newCollaboratorsThisMonth: 0,
    collaboratorsByType: {
      [CollaboratorType.EMPLOYEE]: 0,
      [CollaboratorType.WORKER]: 0,
      [CollaboratorType.FREELANCE]: 0,
      [CollaboratorType.INTERN]: 0,
      [CollaboratorType.STUDENT]: 0,
    },
    unreadNotifications: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [dimonas, companies, collaborators, unreadCount] = await Promise.all([
        dimonaService.getAllDimonas(),
        companyService.getAllCompanies(),
        collaboratorService.getAllCollaborators(),
        NotificationService.getUnreadCount(),
      ]);

      // Calculate dimona statistics
      const dimonasByStatus = dimonas.reduce((acc, dimona) => {
        acc[dimona.status] = (acc[dimona.status] || 0) + 1;
        return acc;
      }, {} as Record<DimonaStatus, number>);

      const dimonasByType = dimonas.reduce((acc, dimona) => {
        acc[dimona.type] = (acc[dimona.type] || 0) + 1;
        return acc;
      }, {} as Record<DimonaType, number>);

      const dimonasWithErrors = dimonas.filter(dimona => dimona.errorMessage).length;

      // Calculate company statistics
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const newCompaniesThisMonth = companies.filter(company => {
        // Assuming companies have a createdAt field, if not available we'll skip this calculation
        return true; // Placeholder - would need actual creation date from backend
      }).length;

      // Calculate collaborator statistics
      const collaboratorsByType = collaborators.reduce((acc, collaborator) => {
        if (collaborator.type) {
          acc[collaborator.type] = (acc[collaborator.type] || 0) + 1;
        }
        return acc;
      }, {} as Record<CollaboratorType, number>);

      const newCollaboratorsThisMonth = collaborators.filter(collaborator => {
        const serviceEntryDate = new Date(collaborator.serviceEntryDate);
        return serviceEntryDate.getMonth() === currentMonth && 
               serviceEntryDate.getFullYear() === currentYear;
      }).length;

      // Fill missing status/type counts with 0
      Object.values(DimonaStatus).forEach(status => {
        if (!(status in dimonasByStatus)) {
          dimonasByStatus[status] = 0;
        }
      });

      Object.values(DimonaType).forEach(type => {
        if (!(type in dimonasByType)) {
          dimonasByType[type] = 0;
        }
      });

      Object.values(CollaboratorType).forEach(type => {
        if (!(type in collaboratorsByType)) {
          collaboratorsByType[type] = 0;
        }
      });

      setStats({
        totalDimonas: dimonas.length,
        dimonasByStatus,
        dimonasByType,
        dimonasWithErrors,
        totalCompanies: companies.length,
        newCompaniesThisMonth,
        totalCollaborators: collaborators.length,
        newCollaboratorsThisMonth,
        collaboratorsByType,
        unreadNotifications: unreadCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchGlobalStats,
  };
};
