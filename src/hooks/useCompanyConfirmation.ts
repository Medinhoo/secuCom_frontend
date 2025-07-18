import { useState, useCallback } from 'react';
import { companyService } from '@/services/api/companyService';
import type { CompanyDto, CompanyConfirmationHistoryDto } from '@/types/CompanyTypes';
import { toast } from 'sonner';

export const useCompanyConfirmation = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [confirmationHistory, setConfirmationHistory] = useState<CompanyConfirmationHistoryDto[]>([]);

  const confirmCompanyData = useCallback(async (companyId: string): Promise<CompanyDto | null> => {
    setIsConfirming(true);
    try {
      const response = await companyService.confirmCompanyData(companyId);
      toast.success('Données de l\'entreprise confirmées avec succès');
      return response;
    } catch (error) {
      console.error('Error confirming company data:', error);
      toast.error('Erreur lors de la confirmation des données');
      return null;
    } finally {
      setIsConfirming(false);
    }
  }, []);

  const loadConfirmationHistory = useCallback(async (companyId: string) => {
    setIsLoadingHistory(true);
    try {
      const history = await companyService.getConfirmationHistory(companyId);
      setConfirmationHistory(history);
    } catch (error) {
      console.error('Error loading confirmation history:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  return {
    confirmCompanyData,
    loadConfirmationHistory,
    isConfirming,
    isLoadingHistory,
    confirmationHistory,
  };
};
