import { useState, useEffect, useCallback } from 'react';
import { companyService } from '@/services/api/companyService';
import type { CompanyDto } from '@/types/CompanyTypes';

interface ValidationErrors {
  name?: string;
  bceNumber?: string;
  onssNumber?: string;
  vatNumber?: string;
  email?: string;
  phoneNumber?: string;
  iban?: string;
  creationDate?: string;
  collaborationStartDate?: string;
  activitySector?: string;
  legalForm?: string;
  jointCommittees?: string;
}

interface ValidationState {
  errors: ValidationErrors;
  validating: {
    bceNumber: boolean;
    onssNumber: boolean;
    vatNumber: boolean;
  };
  isValid: boolean;
}

const VALID_SECTORS = ['Construction', 'Transport', 'Horeca', 'Commerce', 'Services'];
const VALID_LEGAL_FORMS = ['SPRL', 'SA', 'SNC', 'SCS', 'SCRL', 'ASBL', 'Fondation', 'GIE', 'EEIG', 'Autre'];

// Debounce utility
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useCompanyValidation = (formData: CompanyDto | null, originalData?: CompanyDto | null) => {
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    validating: {
      bceNumber: false,
      onssNumber: false,
      vatNumber: false,
    },
    isValid: false,
  });

  // Debounced values for API calls
  const debouncedBceNumber = useDebounce(formData?.bceNumber || '', 500);
  const debouncedOnssNumber = useDebounce(formData?.onssNumber || '', 500);
  const debouncedVatNumber = useDebounce(formData?.vatNumber || '', 500);

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Format d\'email invalide';
    }
    return undefined;
  };

  const validatePhoneNumber = (phone: string): string | undefined => {
    if (!phone) return undefined;
    const phoneRegex = /^(\+32|0)[1-9]\d{7,8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Format de téléphone belge invalide (ex: +32XXXXXXXXX ou 0XXXXXXXXX)';
    }
    return undefined;
  };

  const validateIban = (iban: string): string | undefined => {
    if (!iban) return undefined;
    const ibanRegex = /^BE\d{14}$/;
    if (!ibanRegex.test(iban.replace(/\s/g, ''))) {
      return 'Format IBAN belge invalide (ex: BE12 3456 7890 1234)';
    }
    return undefined;
  };

  const validateBceNumber = (bce: string): string | undefined => {
    if (!bce) return 'Le numéro BCE est obligatoire';
    const bceRegex = /^\d{4}\.\d{3}\.\d{3}$|^\d{10}$/;
    if (!bceRegex.test(bce)) {
      return 'Format BCE invalide (ex: 0123.456.789 ou 0123456789)';
    }
    return undefined;
  };

  const validateOnssNumber = (onss: string): string | undefined => {
    if (!onss) return 'Le numéro ONSS est obligatoire';
    const onssRegex = /^\d{7}$/;
    if (!onssRegex.test(onss)) {
      return 'Le numéro ONSS doit contenir exactement 7 chiffres';
    }
    return undefined;
  };

  const validateVatNumber = (vat: string): string | undefined => {
    if (!vat) return undefined;
    const vatRegex = /^BE\d{10}$/;
    if (!vatRegex.test(vat.replace(/\s/g, ''))) {
      return 'Format TVA belge invalide (ex: BE0123456789)';
    }
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    if (!name || name.trim().length === 0) {
      return 'Le nom de l\'entreprise est obligatoire';
    }
    if (name.trim().length < 2) {
      return 'Le nom doit contenir au moins 2 caractères';
    }
    return undefined;
  };

  const validateDate = (date: Date | string | undefined, fieldName: string): string | undefined => {
    if (!date) return undefined;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (dateObj > today) {
      return `La ${fieldName} ne peut pas être dans le futur`;
    }
    return undefined;
  };

  const validateActivitySector = (sector: string): string | undefined => {
    if (!sector) return undefined;
    if (!VALID_SECTORS.includes(sector)) {
      return `Secteur invalide. Choisissez parmi: ${VALID_SECTORS.join(', ')}`;
    }
    return undefined;
  };

  const validateLegalForm = (form: string): string | undefined => {
    if (!form) return undefined;
    if (!VALID_LEGAL_FORMS.includes(form)) {
      return `Forme juridique invalide. Choisissez parmi: ${VALID_LEGAL_FORMS.join(', ')}`;
    }
    return undefined;
  };

  const validateJointCommittees = (committees: string[] | string): string | undefined => {
    if (!committees) return undefined;
    
    let committeesArray: string[];
    if (typeof committees === 'string') {
      committeesArray = committees.split(',').map(c => c.trim()).filter(Boolean);
    } else {
      committeesArray = committees;
    }

    for (const committee of committeesArray) {
      if (!/^\d+$/.test(committee)) {
        return 'Les commissions paritaires doivent être des numéros séparés par des virgules (ex: 100, 124, 200)';
      }
    }
    return undefined;
  };

  // API validation functions
  const checkBceUniqueness = useCallback(async (bceNumber: string): Promise<string | undefined> => {
    if (!bceNumber || (originalData && bceNumber === originalData.bceNumber)) {
      return undefined;
    }

    try {
      setValidationState(prev => ({
        ...prev,
        validating: { ...prev.validating, bceNumber: true }
      }));

      const exists = await companyService.checkBceNumberExists(bceNumber);
      if (exists) {
        return 'Ce numéro BCE existe déjà';
      }
      return undefined;
    } catch (error) {
      console.error('Erreur lors de la vérification du BCE:', error);
      return 'Erreur lors de la vérification du numéro BCE';
    } finally {
      setValidationState(prev => ({
        ...prev,
        validating: { ...prev.validating, bceNumber: false }
      }));
    }
  }, [originalData]);

  const checkOnssUniqueness = useCallback(async (onssNumber: string): Promise<string | undefined> => {
    if (!onssNumber || (originalData && onssNumber === originalData.onssNumber)) {
      return undefined;
    }

    try {
      setValidationState(prev => ({
        ...prev,
        validating: { ...prev.validating, onssNumber: true }
      }));

      const exists = await companyService.checkOnssNumberExists(onssNumber);
      if (exists) {
        return 'Ce numéro ONSS existe déjà';
      }
      return undefined;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'ONSS:', error);
      return 'Erreur lors de la vérification du numéro ONSS';
    } finally {
      setValidationState(prev => ({
        ...prev,
        validating: { ...prev.validating, onssNumber: false }
      }));
    }
  }, [originalData]);

  const checkVatUniqueness = useCallback(async (vatNumber: string): Promise<string | undefined> => {
    if (!vatNumber || (originalData && vatNumber === originalData.vatNumber)) {
      return undefined;
    }

    try {
      setValidationState(prev => ({
        ...prev,
        validating: { ...prev.validating, vatNumber: true }
      }));

      const exists = await companyService.checkVatNumberExists(vatNumber);
      if (exists) {
        return 'Ce numéro TVA existe déjà';
      }
      return undefined;
    } catch (error) {
      console.error('Erreur lors de la vérification de la TVA:', error);
      return 'Erreur lors de la vérification du numéro TVA';
    } finally {
      setValidationState(prev => ({
        ...prev,
        validating: { ...prev.validating, vatNumber: false }
      }));
    }
  }, [originalData]);

  // Main validation effect
  useEffect(() => {
    const validateForm = async () => {
      if (!formData) return;

      const errors: ValidationErrors = {};

      // Basic validations
      errors.name = validateName(formData.name);
      errors.bceNumber = validateBceNumber(formData.bceNumber);
      errors.onssNumber = validateOnssNumber(formData.onssNumber);
      errors.vatNumber = validateVatNumber(formData.vatNumber || '');
      errors.email = validateEmail(formData.email || '');
      errors.phoneNumber = validatePhoneNumber(formData.phoneNumber || '');
      errors.iban = validateIban(formData.iban || '');
      errors.creationDate = validateDate(formData.creationDate, 'date de création');
      errors.collaborationStartDate = validateDate(formData.collaborationStartDate, 'date de début de collaboration');
      errors.activitySector = validateActivitySector(formData.activitySector || '');
      errors.legalForm = validateLegalForm(formData.legalForm || '');
      errors.jointCommittees = validateJointCommittees(formData.jointCommittees || []);

      // Remove undefined errors
      Object.keys(errors).forEach(key => {
        if (errors[key as keyof ValidationErrors] === undefined) {
          delete errors[key as keyof ValidationErrors];
        }
      });

      setValidationState(prev => ({
        ...prev,
        errors,
        isValid: Object.keys(errors).length === 0 && !Object.values(prev.validating).some(Boolean)
      }));
    };

    validateForm();
  }, [formData]);

  // API validations with debounce
  useEffect(() => {
    if (debouncedBceNumber && !validateBceNumber(debouncedBceNumber)) {
      checkBceUniqueness(debouncedBceNumber).then(error => {
        setValidationState(prev => ({
          ...prev,
          errors: { ...prev.errors, bceNumber: error || validateBceNumber(debouncedBceNumber) },
          isValid: !error && Object.keys({ ...prev.errors, bceNumber: error }).filter(k => prev.errors[k as keyof ValidationErrors]).length === 0 && !Object.values(prev.validating).some(Boolean)
        }));
      });
    }
  }, [debouncedBceNumber, checkBceUniqueness]);

  useEffect(() => {
    if (debouncedOnssNumber && !validateOnssNumber(debouncedOnssNumber)) {
      checkOnssUniqueness(debouncedOnssNumber).then(error => {
        setValidationState(prev => ({
          ...prev,
          errors: { ...prev.errors, onssNumber: error || validateOnssNumber(debouncedOnssNumber) },
          isValid: !error && Object.keys({ ...prev.errors, onssNumber: error }).filter(k => prev.errors[k as keyof ValidationErrors]).length === 0 && !Object.values(prev.validating).some(Boolean)
        }));
      });
    }
  }, [debouncedOnssNumber, checkOnssUniqueness]);

  useEffect(() => {
    if (debouncedVatNumber && !validateVatNumber(debouncedVatNumber)) {
      checkVatUniqueness(debouncedVatNumber).then(error => {
        setValidationState(prev => ({
          ...prev,
          errors: { ...prev.errors, vatNumber: error },
          isValid: !error && Object.keys({ ...prev.errors, vatNumber: error }).filter(k => prev.errors[k as keyof ValidationErrors]).length === 0 && !Object.values(prev.validating).some(Boolean)
        }));
      });
    }
  }, [debouncedVatNumber, checkVatUniqueness]);

  return validationState;
};
