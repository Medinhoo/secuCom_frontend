import { useState, useEffect } from 'react';
import { dimonaService } from '@/services/api/dimonaService';
import { DimonaDto, DimonaStatus } from '@/types/DimonaTypes';

export const useDimonasToSend = () => {
  const [dimonas, setDimonas] = useState<DimonaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDimonasToSend = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allDimonas = await dimonaService.getAllDimonas();
      const toSendDimonas = allDimonas.filter((d: DimonaDto) => d.status === DimonaStatus.TO_SEND);
      
      // Sort by creation date (most recent first)
      toSendDimonas.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
      
      setDimonas(toSendDimonas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des dimonas TO_SEND');
    } finally {
      setIsLoading(false);
    }
  };

  const sendToONSS = async (dimonaId: string) => {
    try {
      await dimonaService.updateDimonaStatus(
        dimonaId, 
        DimonaStatus.IN_PROGRESS, 
        'Envoyé à l\'ONSS depuis le dashboard'
      );
      
      // Refresh the list
      await fetchDimonasToSend();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi à l\'ONSS');
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
    fetchDimonasToSend();
  }, []);

  return {
    dimonas,
    isLoading,
    error,
    refetch: fetchDimonasToSend,
    sendToONSS,
    getDaysOld,
  };
};
