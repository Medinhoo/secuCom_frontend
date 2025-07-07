export interface CompanyLookupDto {
  bceNumber: string;
  bceNumberFormatted: string;
  name: string;
  companyName: string;
  legalForm: string;
  legalFormShort: string;
  status: string;
  email: string | null;
  phoneNumber: string | null;
  website: string | null;
  address: {
    street: string;
    number: string;
    box: string;
    postalCode: string;
    city: string;
  };
  startDate: string; // ISO date string
}

export interface CompanyLookupState {
  isLoading: boolean;
  isCheckingDuplicate: boolean;
  isLookingUp: boolean;
  error: string | null;
  data: CompanyLookupDto | null;
  showModal: boolean;
}

export interface CompanyLookupError {
  type: 'duplicate' | 'not_found' | 'unauthorized' | 'server_error' | 'network_error';
  message: string;
}

export interface CompanyFormData {
  name: string;
  companyName: string;
  legalForm: string;
  bceNumber: string;
  email: string | null;
  phoneNumber: string | null;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  creationDate: string | null;
}

export type LookupType = 'bce' | 'vat';

export interface CompanyLookupFieldProps {
  type: LookupType;
  value: string;
  onChange: (value: string) => void;
  onDataConfirmed: (data: CompanyFormData) => void;
  onSyncField?: (field: string, value: string) => void;
  onRemoveFromPrefilled?: (field: string) => void;
  isSyncedFromOtherField?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}
