import { useState, useEffect } from 'react';
import { dimonaService } from '@/services/api/dimonaService';
import { DimonaDto, DimonaStatus } from '@/types/DimonaTypes';

export const useDimonasToConfirm = () => {
  const [dimonas, setDimonas] = useState<DimonaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDimonasToConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allDimonas = await dimonaService.getAllDimonas();
      const toConfirmDimonas = allDimonas.filter((d: DimonaDto) => d.status === DimonaStatus.TO_CONFIRM);
      
      // Sort by creation date (most recent first)
      toConfirmDimonas.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
      
      setDimonas(toConfirmDimonas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des dimonas TO_CONFIRM');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDimona = async (dimonaId: string) => {
    try {
      await dimonaService.updateDimonaStatus(
        dimonaId, 
        DimonaStatus.TO_SEND, 
        'Confirmé par l\'entreprise depuis le dashboard'
      );
      
      // Refresh the list
      await fetchDimonasToConfirm();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la confirmation');
      return false;
    }
  };

  const getDaysOld = (entryDate: Date): number => {
    const now = new Date();
    const entry = new Date(entryDate);
    const diffTime = Math.abs(now.getTime() - entry.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    fetchDimonasToConfirm();
  }, []);

  return {
    dimonas,
    isLoading,
    error,
    refetch: fetchDimonasToConfirm,
    confirmDimona,
    getDaysOld,
  };
};
