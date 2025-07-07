import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CompanyLookupModal } from './CompanyLookupModal';
import { useCompanyLookup } from '@/hooks/useCompanyLookup';
import { 
  formatBceRealTime,
  formatVatRealTime,
  isValidFormat,
  validateBceVatConsistency 
} from '@/utils/companyLookupUtils';
import type { CompanyLookupFieldProps } from '@/types/CompanyLookupTypes';
import { AlertCircle, Search, CheckCircle, Loader2 } from 'lucide-react';

export function CompanyLookupField({
  type,
  value,
  onChange,
  onDataConfirmed,
  onSyncField,
  onRemoveFromPrefilled,
  isSyncedFromOtherField = false,
  disabled = false,
  placeholder,
  className = "",
  isPrefilledField = false,
}: CompanyLookupFieldProps & { isPrefilledField?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [hasBlurred, setHasBlurred] = useState(false);
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [canLookup, setCanLookup] = useState(false);
  const [lastSearchedValue, setLastSearchedValue] = useState('');
  const [hasSearchFailed, setHasSearchFailed] = useState(false);
  const [hasSearchSucceeded, setHasSearchSucceeded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchroniser displayValue avec la prop value quand elle change
  React.useEffect(() => {
    if (value) {
      // Formater la valeur initiale selon le type
      let formattedValue = '';
      if (type === 'bce') {
        formattedValue = formatBceRealTime(value, 0).formattedValue;
      } else {
        formattedValue = formatVatRealTime(value, 0).formattedValue;
      }
      setDisplayValue(formattedValue);
    } else {
      setDisplayValue(value);
    }
  }, [value, type]);

  const {
    isLoading,
    isCheckingDuplicate,
    isLookingUp,
    error,
    data,
    showModal,
    lookupCompany,
    checkDuplicate,
    confirmData,
    cancelLookup,
    clearError,
  } = useCompanyLookup();

  // Détecter quand une erreur survient pour marquer la recherche comme ayant échoué
  React.useEffect(() => {
    if (error && lastSearchedValue) {
      setHasSearchFailed(true);
      
      // Retirer ce champ des champs pré-remplis quand une erreur survient
      if (onRemoveFromPrefilled) {
        const fieldName = type === 'bce' ? 'bceNumber' : 'vatNumber';
        onRemoveFromPrefilled(fieldName);
      }
    }
  }, [error, lastSearchedValue, onRemoveFromPrefilled, type]);

  // Détecter quand une recherche a réussi (modal s'ouvre avec des données)
  React.useEffect(() => {
    if (showModal && data && lastSearchedValue) {
      setHasSearchSucceeded(true);
    }
  }, [showModal, data, lastSearchedValue]);

  // Placeholder par défaut selon le type
  const defaultPlaceholder = type === 'bce' 
    ? "Ex: 1234.567.890" 
    : "Ex: BE1234.567.890";

  // Label selon le type
  const fieldLabel = type === 'bce' ? "Numéro BCE" : "Numéro TVA";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Formatage en temps réel selon le type (comme le numéro national)
    let formattedValue = '';
    let cleanValue = '';
    
    if (type === 'bce') {
      formattedValue = formatBceRealTime(rawValue, 0).formattedValue;
      cleanValue = formattedValue.replace(/\./g, '');
    } else {
      formattedValue = formatVatRealTime(rawValue, 0).formattedValue;
      cleanValue = formattedValue.replace(/[.\s]/g, '');
    }
    
    setDisplayValue(formattedValue);
    onChange(cleanValue);
    
    // Reset des états de vérification quand l'utilisateur tape
    setDuplicateChecked(false);
    setCanLookup(false);
    setHasSearchFailed(false);
    setHasSearchSucceeded(false);
    
    // Effacer l'erreur quand l'utilisateur tape
    if (error) {
      clearError();
    }
  };

  const handleFocus = () => {
    // Pour le champ TVA, ajouter automatiquement "BE" si vide
    if (type === 'vat' && (!displayValue || displayValue === '')) {
      setDisplayValue('BE');
      onChange('BE');
      // Positionner le curseur après "BE"
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(2, 2);
        }
      }, 0);
    }
    
    if (error) {
      clearError();
    }
  };

  const handleLookupClick = async () => {
    if (!isValidFormat(displayValue, type) || isLoading) {
      return;
    }
    
    // Empêcher de rechercher la même valeur qui a déjà échoué ou réussi
    if ((hasSearchFailed || hasSearchSucceeded) && displayValue === lastSearchedValue) {
      return;
    }
    
    // Si la vérification de doublon n'a pas encore été faite
    if (!duplicateChecked) {
      const noDuplicate = await checkDuplicate(displayValue, type);
      setDuplicateChecked(true);
      setCanLookup(noDuplicate);
      
      // Si pas de doublon, on peut procéder au lookup
      if (noDuplicate) {
        setLastSearchedValue(displayValue);
        setHasBlurred(true);
        lookupCompany(displayValue, type);
      }
    } else if (canLookup) {
      // Si déjà vérifié et pas de doublon, procéder au lookup
      setLastSearchedValue(displayValue);
      setHasBlurred(true);
      lookupCompany(displayValue, type);
    }
  };

  const handleConfirm = () => {
    const formData = confirmData(onSyncField);
    if (formData) {
      onDataConfirmed(formData);
      
      // Synchronisation visuelle immédiate des champs
      if (onSyncField && data) {
        const bceNumber = data.bceNumber;
        const vatNumber = `BE${bceNumber}`;
        
        // Mettre à jour les deux champs visuellement
        if (type === 'bce') {
          onSyncField('vatNumber', vatNumber);
        } else {
          onSyncField('bceNumber', bceNumber);
        }
      }
    }
  };

  const getLoadingText = () => {
    if (isCheckingDuplicate) {
      return "Vérification des doublons...";
    }
    if (isLookingUp) {
      return type === 'bce' 
        ? "Recherche via numéro BCE..." 
        : "Recherche via numéro TVA...";
    }
    return "Recherche en cours...";
  };

  const getInputIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (hasBlurred && !error && displayValue) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Search className="h-4 w-4 text-gray-400" />;
  };

  const getHelpText = () => {
    if (!isLoading && !error) {
      return type === 'bce'
        ? "Saisissez un numéro BCE valide puis cliquez sur la loupe pour rechercher l'entreprise"
        : "Le préfixe BE est ajouté automatiquement. Saisissez les 10 chiffres puis cliquez sur la loupe";
    }
    return null;
  };

  const getLookupButtonState = () => {
    if (isLoading) {
      return {
        disabled: true,
        className: "bg-blue-100 text-blue-400 cursor-not-allowed",
        icon: <Loader2 className="h-4 w-4 animate-spin" />
      };
    }
    
    if (error) {
      return {
        disabled: true,
        className: "bg-red-100 text-red-400 cursor-not-allowed",
        icon: <AlertCircle className="h-4 w-4" />
      };
    }
    
    // Si le champ a été synchronisé depuis l'autre champ, désactiver le bouton
    if (isSyncedFromOtherField && isValidFormat(displayValue, type)) {
      return {
        disabled: true,
        className: "bg-green-100 text-green-400 cursor-not-allowed",
        icon: <CheckCircle className="h-4 w-4" />
      };
    }
    
    // Si la recherche a échoué pour cette valeur, désactiver le bouton
    if (hasSearchFailed && displayValue === lastSearchedValue) {
      return {
        disabled: true,
        className: "bg-red-100 text-red-400 cursor-not-allowed",
        icon: <AlertCircle className="h-4 w-4" />
      };
    }
    
    // Si la recherche a réussi pour cette valeur, désactiver le bouton
    if (hasSearchSucceeded && displayValue === lastSearchedValue) {
      return {
        disabled: true,
        className: "bg-green-100 text-green-400 cursor-not-allowed",
        icon: <CheckCircle className="h-4 w-4" />
      };
    }
    
    // Si lookup réussi
    if (hasBlurred && !error && displayValue && isValidFormat(displayValue, type)) {
      return {
        disabled: false,
        className: "bg-green-100 text-green-600 hover:bg-green-200",
        icon: <CheckCircle className="h-4 w-4" />
      };
    }
    
    // Si doublon vérifié et pas de doublon (peut faire le lookup externe)
    if (duplicateChecked && canLookup && isValidFormat(displayValue, type)) {
      return {
        disabled: false,
        className: "bg-green-100 text-green-600 hover:bg-green-200",
        icon: <Search className="h-4 w-4" />
      };
    }
    
    // Si format valide mais pas encore vérifié les doublons
    if (isValidFormat(displayValue, type)) {
      return {
        disabled: false,
        className: "bg-blue-100 text-blue-600 hover:bg-blue-200",
        icon: <Search className="h-4 w-4" />
      };
    }
    
    return {
      disabled: true,
      className: "bg-gray-100 text-gray-400 cursor-not-allowed",
      icon: <Search className="h-4 w-4" />
    };
  };

  const buttonState = getLookupButtonState();

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={`${type}-lookup`} className="text-blue-700">
        {fieldLabel} *
      </Label>
      
      <div className="relative flex">
        <Input
          ref={inputRef}
          id={`${type}-lookup`}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder || defaultPlaceholder}
          disabled={disabled || isLoading}
          className={`flex-1 pr-3 border-slate-200 focus-visible:ring-blue-500 ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : isPrefilledField
              ? 'bg-green-50 border-green-300 focus-visible:ring-green-500'
              : isValidFormat(displayValue, type)
              ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
              : ''
          }`}
          required
        />
        
        <Button
          type="button"
          onClick={handleLookupClick}
          disabled={buttonState.disabled}
          className={`ml-2 px-3 py-2 rounded-md border transition-colors ${buttonState.className}`}
          title={
            isLoading 
              ? "Recherche en cours..." 
              : isValidFormat(displayValue, type)
              ? "Cliquer pour rechercher l'entreprise"
              : "Saisissez un numéro valide pour activer la recherche"
          }
        >
          {buttonState.icon}
        </Button>
      </div>

      {/* Messages d'état */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{getLoadingText()}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Aide contextuelle */}
      {getHelpText() && (
        <p className="text-xs text-slate-500">
          {getHelpText()}
        </p>
      )}

      {/* Modal de confirmation */}
      <CompanyLookupModal
        isOpen={showModal}
        onClose={cancelLookup}
        onConfirm={handleConfirm}
        data={data}
      />
    </div>
  );
}
