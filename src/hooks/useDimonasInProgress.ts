import { useState, useEffect } from 'react';
import { dimonaService } from '@/services/api/dimonaService';
import { DimonaDto, DimonaStatus } from '@/types/DimonaTypes';

export const useDimonasInProgress = () => {
  const [dimonas, setDimonas] = useState<DimonaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDimonasInProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allDimonas = await dimonaService.getAllDimonas();
      const inProgressDimonas = allDimonas.filter((d: DimonaDto) => d.status === DimonaStatus.IN_PROGRESS);
      
      // Sort by entry date (oldest first to prioritize checking)
      inProgressDimonas.sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
      
      setDimonas(inProgressDimonas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des dimonas IN_PROGRESS');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsAccepted = async (dimonaId: string) => {
    try {
      await dimonaService.updateDimonaStatus(
        dimonaId, 
        DimonaStatus.ACCEPTED, 
        'Marqué comme accepté depuis le dashboard'
      );
      
      // Refresh the list
      await fetchDimonasInProgress();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage comme accepté');
      return false;
    }
  };

  const markAsRejected = async (dimonaId: string, reason?: string) => {
    try {
      await dimonaService.updateDimonaStatus(
        dimonaId, 
        DimonaStatus.REJECTED, 
        reason || 'Marqué comme rejeté depuis le dashboard'
      );
      
      // Refresh the list
      await fetchDimonasInProgress();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage comme rejeté');
      return false;
    }
  };

  const getDaysInProgress = (entryDate: Date): number => {
    const now = new Date();
    const entry = new Date(entryDate);
    const diffTime = Math.abs(now.getTime() - entry.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isUrgent = (entryDate: Date): boolean => {
    return getDaysInProgress(entryDate) > 5;
  };

  useEffect(() => {
    fetchDimonasInProgress();
  }, []);

  return {
    dimonas,
    isLoading,
    error,
    refetch: fetchDimonasInProgress,
    markAsAccepted,
    markAsRejected,
    getDaysInProgress,
    isUrgent,
  };
};
