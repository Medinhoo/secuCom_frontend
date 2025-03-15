export interface SocialSecretariat {
  id: string;
  name: string;
  companyNumber: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface SocialSecretariatFormData {
  name: string;
  companyNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface ValidationErrors {
  name?: string;
  companyNumber?: string;
  email?: string;
}
