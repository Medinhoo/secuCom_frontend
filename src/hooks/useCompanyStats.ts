import { useState, useEffect } from 'react';
import { dimonaService } from '@/services/api/dimonaService';
import { collaboratorService } from '@/services/api/collaboratorService';
import { companyService } from '@/services/api/companyService';
import { NotificationService } from '@/services/api/notificationService';
import { DimonaStatus, DimonaType } from '@/types/DimonaTypes';
import { CollaboratorType } from '@/types/CollaboratorTypes';

interface CompanyStats {
  // Company info
  companyName: string;
  companyId: string;
  
  // Dimona stats for this company
  totalDimonas: number;
  dimonasByStatus: Record<DimonaStatus, number>;
  dimonasByType: Record<DimonaType, number>;
  dimonasWithErrors: number;
  pendingDimonas: number;
  
  // Collaborator stats for this company
  totalCollaborators: number;
  newCollaboratorsThisMonth: number;
  collaboratorsByType: Record<CollaboratorType, number>;
  activeCollaborators: number;
  
  // Performance metrics
  averageProcessingTime: number;
  acceptanceRate: number;
  
  // Notifications for this company
  unreadNotifications: number;
}

export const useCompanyStats = (companyId: string) => {
  const [stats, setStats] = useState<CompanyStats>({
    companyName: '',
    companyId: '',
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
    pendingDimonas: 0,
    totalCollaborators: 0,
    newCollaboratorsThisMonth: 0,
    collaboratorsByType: {
      [CollaboratorType.EMPLOYEE]: 0,
      [CollaboratorType.WORKER]: 0,
      [CollaboratorType.FREELANCE]: 0,
      [CollaboratorType.INTERN]: 0,
      [CollaboratorType.STUDENT]: 0,
    },
    activeCollaborators: 0,
    averageProcessingTime: 0,
    acceptanceRate: 0,
    unreadNotifications: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyStats = async () => {
    if (!companyId) {
      setError('ID d\'entreprise requis');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch company-specific data in parallel
      const [company, dimonas, collaborators, unreadCount] = await Promise.all([
        companyService.getCompanyById(companyId),
        dimonaService.getDimonasByCompany(companyId),
        collaboratorService.getCollaboratorsByCompany(companyId),
        NotificationService.getUnreadCount(), // Could be filtered by company if API supports it
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
      const pendingDimonas = dimonas.filter(dimona => 
        dimona.status === DimonaStatus.TO_CONFIRM || 
        dimona.status === DimonaStatus.TO_SEND ||
        dimona.status === DimonaStatus.REJECTED
      ).length;

      // Calculate collaborator statistics
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

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

      const activeCollaborators = collaborators.length; // All collaborators are considered active

      // Calculate performance metrics
      const acceptedDimonas = dimonas.filter(dimona => dimona.status === DimonaStatus.ACCEPTED);
      const acceptanceRate = dimonas.length > 0 ? (acceptedDimonas.length / dimonas.length) * 100 : 0;

      // Calculate average processing time (placeholder - would need actual timestamps)
      const averageProcessingTime = 2.5; // days - placeholder

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
        companyName: company.name,
        companyId: company.id,
        totalDimonas: dimonas.length,
        dimonasByStatus,
        dimonasByType,
        dimonasWithErrors,
        pendingDimonas,
        totalCollaborators: collaborators.length,
        newCollaboratorsThisMonth,
        collaboratorsByType,
        activeCollaborators,
        averageProcessingTime,
        acceptanceRate,
        unreadNotifications: unreadCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques de l\'entreprise');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyStats();
  }, [companyId]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchCompanyStats,
  };
};
