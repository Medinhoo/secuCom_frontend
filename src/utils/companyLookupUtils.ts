import type { CompanyLookupDto, CompanyFormData, LookupType } from "@/types/CompanyLookupTypes";

/**
 * Validates a BCE number format
 * @param bceNumber - The BCE number to validate
 * @returns true if valid, false otherwise
 */
export function validateBceNumber(bceNumber: string): boolean {
  if (!bceNumber) return false;
  
  // Remove any formatting (dots, spaces)
  const cleaned = bceNumber.replace(/[\s.-]/g, '');
  
  // Should be exactly 10 digits
  return /^\d{10}$/.test(cleaned);
}

/**
 * Validates a VAT number format (BE + 10 digits)
 * @param vatNumber - The VAT number to validate
 * @returns true if valid, false otherwise
 */
export function validateVatNumber(vatNumber: string): boolean {
  if (!vatNumber) return false;
  
  // Remove any formatting (dots, spaces)
  const cleaned = vatNumber.replace(/[\s.-]/g, '').toUpperCase();
  
  // Should be BE followed by exactly 10 digits
  return /^BE\d{10}$/.test(cleaned);
}

/**
 * Formats a BCE number with dots
 * 1234567890 -> 1234.567.890
 */
export function formatBceNumber(bceNumber: string): string {
  const cleanNumber = bceNumber.replace(/[.\s]/g, '');
  if (cleanNumber.length !== 10) return bceNumber;
  
  return `${cleanNumber.slice(0, 4)}.${cleanNumber.slice(4, 7)}.${cleanNumber.slice(7)}`;
}

/**
 * Formats a VAT number with BE prefix and dots
 * 1234567890 -> BE1234.567.890
 */
export function formatVatNumber(vatNumber: string): string {
  const cleaned = vatNumber.replace(/[\s.-]/g, '').toUpperCase();
  
  // If it already starts with BE, format the number part
  if (cleaned.startsWith('BE') && cleaned.length === 12) {
    const numberPart = cleaned.slice(2);
    return `BE${numberPart.slice(0, 4)}.${numberPart.slice(4, 7)}.${numberPart.slice(7)}`;
  }
  
  // If it's just 10 digits, add BE prefix and format
  if (/^\d{10}$/.test(cleaned)) {
    return `BE${cleaned.slice(0, 4)}.${cleaned.slice(4, 7)}.${cleaned.slice(7)}`;
  }
  
  return vatNumber;
}

/**
 * Cleans a BCE number (removes dots and spaces)
 */
export function cleanBceNumber(bceNumber: string): string {
  return bceNumber.replace(/[.\s]/g, '');
}

/**
 * Cleans a VAT number (removes BE prefix, dots and spaces)
 */
export function cleanVatNumber(vatNumber: string): string {
  return vatNumber.replace(/[\s.-]/g, '').toUpperCase().replace(/^BE/, '');
}

/**
 * Converts BCE number to VAT number
 * 1234567890 -> BE1234567890
 */
export function bceToVat(bceNumber: string): string {
  const cleaned = cleanBceNumber(bceNumber);
  return `BE${cleaned}`;
}

/**
 * Converts VAT number to BCE number
 * BE1234567890 -> 1234567890
 */
export function vatToBce(vatNumber: string): string {
  return cleanVatNumber(vatNumber);
}

/**
 * Detects the lookup type based on the input value
 */
export function detectLookupType(value: string): LookupType {
  const cleaned = value.replace(/[\s.-]/g, '').toUpperCase();
  
  if (cleaned.startsWith('BE') && cleaned.length === 12) {
    return 'vat';
  }
  
  if (/^\d{10}$/.test(cleaned)) {
    return 'bce';
  }
  
  // Default to BCE if unclear
  return 'bce';
}

/**
 * Validates that BCE and VAT numbers are consistent
 */
export function validateBceVatConsistency(bceNumber: string, vatNumber: string): boolean {
  if (!bceNumber || !vatNumber) return true; // Allow empty values
  
  const cleanedBce = cleanBceNumber(bceNumber);
  const cleanedVat = cleanVatNumber(vatNumber);
  
  return cleanedBce === cleanedVat;
}

/**
 * Maps lookup data to form data
 */
export function mapLookupDataToFormData(lookupData: CompanyLookupDto): CompanyFormData {
  return {
    name: lookupData.name,
    companyName: lookupData.companyName,
    legalForm: lookupData.legalFormShort,
    bceNumber: lookupData.bceNumber,
    email: lookupData.email,
    phoneNumber: lookupData.phoneNumber,
    street: lookupData.address.street,
    number: lookupData.address.number,
    postalCode: lookupData.address.postalCode,
    city: lookupData.address.city,
    creationDate: lookupData.startDate,
  };
}

/**
 * Formats a date string for display
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "Non renseigné";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats a complete address
 */
export function formatAddress(address: CompanyLookupDto['address']): string {
  const parts = [
    address.street,
    address.number,
    address.box && `boîte ${address.box}`,
    `${address.postalCode} ${address.city}`
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Handles display of null/undefined values
 */
export function displayValue(value: string | null | undefined, fallback = "Non renseigné"): string {
  return value || fallback;
}

/**
 * Formats BCE number in real-time (like national number formatting)
 * Format: 1234.567.890
 */
export function formatBceRealTime(value: string, cursorPosition: number): { formattedValue: string; newCursorPosition: number } {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Apply formatting: 1234.567.890
  let formatted = '';
  if (digits.length <= 4) {
    formatted = digits;
  } else if (digits.length <= 7) {
    formatted = `${digits.slice(0, 4)}.${digits.slice(4)}`;
  } else {
    formatted = `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7, 10)}`;
  }
  
  return { formattedValue: formatted, newCursorPosition: 0 };
}

/**
 * Formats VAT number in real-time with BE prefix (like national number formatting)
 * Format: BE1234.567.890
 */
export function formatVatRealTime(value: string, cursorPosition: number): { formattedValue: string; newCursorPosition: number } {
  // Ensure it starts with BE
  let workingValue = value;
  if (!workingValue.startsWith('BE')) {
    // Remove any existing BE and add it at the start
    const withoutBE = workingValue.replace(/^BE/i, '');
    workingValue = 'BE' + withoutBE;
  }
  
  // Extract numeric part after BE
  const numericPart = workingValue.slice(2).replace(/\D/g, '');
  
  // Apply formatting to numeric part: 1234.567.890
  let formattedNumeric = '';
  if (numericPart.length <= 4) {
    formattedNumeric = numericPart;
  } else if (numericPart.length <= 7) {
    formattedNumeric = `${numericPart.slice(0, 4)}.${numericPart.slice(4)}`;
  } else {
    formattedNumeric = `${numericPart.slice(0, 4)}.${numericPart.slice(4, 7)}.${numericPart.slice(7, 10)}`;
  }
  
  const formatted = 'BE' + formattedNumeric;
  
  return { formattedValue: formatted, newCursorPosition: 0 };
}

/**
 * Checks if a value has a valid format for the given type
 */
export function isValidFormat(value: string, type: LookupType): boolean {
  if (!value) return false;
  
  if (type === 'bce') {
    return validateBceNumber(value);
  } else {
    return validateVatNumber(value);
  }
}

/**
 * Error messages based on error type
 */
export function getErrorMessage(error: any): { type: string; message: string } {
  if (!error) {
    return { type: 'network_error', message: 'Une erreur inattendue s\'est produite' };
  }

  const status = error.status;
  
  switch (status) {
    case 404:
      // Check if it's specifically a CBE lookup error
      if (error.message?.includes('CBE database') || error.message?.includes('Company not found')) {
        return { 
          type: 'not_found', 
          message: 'Entreprise non trouvée dans la base de données CBE' 
        };
      }
      return { 
        type: 'not_found', 
        message: 'Ressource non trouvée' 
      };
    case 401:
      return { 
        type: 'unauthorized', 
        message: 'Session expirée. Veuillez vous reconnecter.' 
      };
    case 409:
      return { 
        type: 'duplicate', 
        message: 'Cette entreprise existe déjà dans le système' 
      };
    case 502:
    case 503:
      return { 
        type: 'server_error', 
        message: 'Service temporairement indisponible. Réessayez plus tard.' 
      };
    case 500:
      return { 
        type: 'server_error', 
        message: 'Erreur interne du serveur' 
      };
    case 400:
      // Bad request - often validation errors
      return {
        type: 'validation_error',
        message: error.message || 'Données invalides. Vérifiez le format du numéro saisi.'
      };
    default:
      // For other HTTP errors, try to use the server message if available
      const serverMessage = error.message;
      if (serverMessage) {
        return { 
          type: 'server_error', 
          message: serverMessage 
        };
      }
      return { 
        type: 'network_error', 
        message: `Erreur ${status}: Erreur inconnue` 
      };
  }
}
