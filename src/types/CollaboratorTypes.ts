export interface Address {
  street: string;
  number: string;
  box?: string;
  postalCode: string;
  city: string;
  country: string;
}

export enum CollaboratorType {
  EMPLOYEE = "EMPLOYEE",
  WORKER = "WORKER",
  FREELANCE = "FREELANCE",
  INTERN = "INTERN",
  STUDENT = "STUDENT",
}

export enum Day {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum WorkDurationType {
  FIXED = "FIXED",
  VARIABLE = "VARIABLE",
}

export interface Collaborator {
  id: string; // UUID
  lastName: string;
  firstName: string;
  nationality?: string;
  birthDate?: string; // ISO date string
  birthPlace?: string;
  gender?: string;
  language?: string;
  civilStatus?: string;
  civilStatusDate?: string; // ISO date string
  partnerName?: string;
  partnerBirthDate?: string; // ISO date string
  dependents?: string[];
  address?: Address;
  nationalNumber?: string;
  serviceEntryDate: string; // ISO date string
  type?: CollaboratorType;
  jobFunction?: string;
  contractType?: string;
  workRegime?: string;
  workDurationType?: WorkDurationType;
  typicalSchedule?: Record<Day, string>;
  salary?: number;
  jointCommittee?: string;
  taskDescription?: string;
  extraLegalBenefits?: string[];
  iban?: string;
  companyId: string; // UUID
  establishmentUnitAddress?: Address;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}
