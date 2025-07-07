import { useState, useCallback } from 'react';
import { companyService } from '@/services/api/companyService';
import { 
  validateBceNumber, 
  validateVatNumber,
  cleanBceNumber, 
  cleanVatNumber,
  getErrorMessage,
  mapLookupDataToFormData,
  detectLookupType,
  bceToVat,
  vatToBce
} from '@/utils/companyLookupUtils';
import type { 
  CompanyLookupState, 
  CompanyLookupDto, 
  CompanyFormData,
  LookupType 
} from '@/types/CompanyLookupTypes';

export function useCompanyLookup() {
  const [state, setState] = useState<CompanyLookupState>({
    isLoading: false,
    isCheckingDuplicate: false,
    isLookingUp: false,
    error: null,
    data: null,
    showModal: false,
  });

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      isCheckingDuplicate: false,
      isLookingUp: false,
      error: null,
      data: null,
      showModal: false,
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      isCheckingDuplicate: false,
      isLookingUp: false,
      error,
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
      error: null,
    }));
  }, []);

  const showModal = useCallback((data: CompanyLookupDto) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      isCheckingDuplicate: false,
      isLookingUp: false,
      error: null,
      data,
      showModal: true,
    }));
  }, []);

  const hideModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showModal: false,
    }));
  }, []);

  const lookupCompany = useCallback(async (value: string, lookupType?: LookupType): Promise<void> => {
    // Détection automatique du type si non spécifié
    const type = lookupType || detectLookupType(value);
    
    // Validation selon le type
    if (type === 'bce' && !validateBceNumber(value)) {
      setError('Numéro BCE invalide. Format attendu: 10 chiffres (ex: 1234.567.890)');
      return;
    }
    
    if (type === 'vat' && !validateVatNumber(value)) {
      setError('Numéro TVA invalide. Format attendu: BE + 10 chiffres (ex: BE1234.567.890)');
      return;
    }

    // Nettoyage du numéro selon le type
    const cleanedNumber = type === 'bce' ? cleanBceNumber(value) : cleanVatNumber(value);
    
    try {
      setLoading(true);

      // Étape 1: Vérifier si l'entreprise existe déjà
      setState(prev => ({ ...prev, isCheckingDuplicate: true }));
      
      const exists = type === 'bce' 
        ? await companyService.checkBceNumberExists(cleanedNumber)
        : await companyService.checkVatNumberExists(`BE${cleanedNumber}`);
      
      if (exists) {
        setError('Cette entreprise existe déjà dans le système');
        return;
      }

      // Étape 2: Lookup externe
      setState(prev => ({ 
        ...prev, 
        isCheckingDuplicate: false, 
        isLookingUp: true 
      }));

      const lookupData = type === 'bce'
        ? await companyService.lookupCompanyByBce(cleanedNumber)
        : await companyService.lookupCompanyByVat(`BE${cleanedNumber}`);
      
      // Étape 3: Afficher la modal de confirmation
      showModal(lookupData);

    } catch (error: any) {
      const errorInfo = getErrorMessage(error);
      setError(errorInfo.message);
    }
  }, [setError, setLoading, showModal]);

  const confirmData = useCallback((onSyncField?: (field: string, value: string) => void): CompanyFormData | null => {
    if (!state.data) return null;
    
    const formData = mapLookupDataToFormData(state.data);
    
    // Synchronisation automatique BCE ↔ TVA
    if (onSyncField) {
      const bceNumber = formData.bceNumber;
      const vatNumber = bceToVat(bceNumber);
      
      // Synchroniser les deux champs
      onSyncField('bceNumber', bceNumber);
      onSyncField('vatNumber', vatNumber);
    }
    
    hideModal();
    resetState();
    
    return formData;
  }, [state.data, hideModal, resetState]);

  const checkDuplicate = useCallback(async (value: string, lookupType?: LookupType): Promise<boolean> => {
    // Détection automatique du type si non spécifié
    const type = lookupType || detectLookupType(value);
    
    // Validation selon le type
    if (type === 'bce' && !validateBceNumber(value)) {
      return false;
    }
    
    if (type === 'vat' && !validateVatNumber(value)) {
      return false;
    }

    // Nettoyage du numéro selon le type
    const cleanedNumber = type === 'bce' ? cleanBceNumber(value) : cleanVatNumber(value);
    
    try {
      setState(prev => ({ ...prev, isCheckingDuplicate: true, error: null }));
      
      const exists = type === 'bce' 
        ? await companyService.checkBceNumberExists(cleanedNumber)
        : await companyService.checkVatNumberExists(`BE${cleanedNumber}`);
      
      setState(prev => ({ ...prev, isCheckingDuplicate: false }));
      
      if (exists) {
        setError('Cette entreprise existe déjà dans le système');
        return false;
      }
      
      return true; // Pas de doublon, on peut procéder au lookup
    } catch (error: any) {
      setState(prev => ({ ...prev, isCheckingDuplicate: false }));
      const errorInfo = getErrorMessage(error);
      setError(errorInfo.message);
      return false;
    }
  }, [setError]);

  const cancelLookup = useCallback(() => {
    hideModal();
    resetState();
  }, [hideModal, resetState]);

  return {
    // État
    isLoading: state.isLoading,
    isCheckingDuplicate: state.isCheckingDuplicate,
    isLookingUp: state.isLookingUp,
    error: state.error,
    data: state.data,
    showModal: state.showModal,
    
    // Actions
    lookupCompany,
    checkDuplicate,
    confirmData,
    cancelLookup,
    resetState,
    clearError: () => setError(''),
  };
}
