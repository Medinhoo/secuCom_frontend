import { useState, useEffect } from 'react';
import { dimonaService } from '@/services/api/dimonaService';
import { NotificationService } from '@/services/api/notificationService';
import { DimonaStatus, DimonaDto } from '@/types/DimonaTypes';

interface DashboardStats {
  toSendCount: number;
  inProgressCount: number;
  notificationCount: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    toSendCount: 0,
    inProgressCount: 0,
    notificationCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all dimonas and notifications in parallel
      const [dimonas, notificationCount] = await Promise.all([
        dimonaService.getAllDimonas(),
        NotificationService.getUnreadCount(),
      ]);

      // Count dimonas by status
      const toSendCount = dimonas.filter((d: DimonaDto) => d.status === DimonaStatus.TO_SEND).length;
      const inProgressCount = dimonas.filter((d: DimonaDto) => d.status === DimonaStatus.IN_PROGRESS).length;

      setStats({
        toSendCount,
        inProgressCount,
        notificationCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};
