import { User } from "@/context/AuthContext";

// Extended user interface for admin management
export interface AdminUser extends User {
  companyName?: string;
  secretariatName?: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING';
}

// Request interface for creating company contacts
export interface CreateCompanyContactRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  fonction?: string;
  permissions?: string;
  roles: string[];
}

// Request interface for creating companies (minimal required fields)
export interface CreateCompanyRequest {
  name: string;
  bceNumber: string;
  onssNumber: string;
}

// Response interface for company creation
export interface CreateCompanyResponse {
  id: string;
  name: string;
  bceNumber: string;
  onssNumber: string;
}

// User update request interface
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  accountStatus?: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING';
  fonction?: string;
  permissions?: string;
  position?: string;
  specialization?: string;
}

// User role types
export type UserRole = 'ROLE_ADMIN' | 'ROLE_COMPANY' | 'ROLE_SECRETARIAT';

// Account status types
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING';

// Filter options for users list
export interface UserFilters {
  search?: string;
  role?: UserRole | 'ALL';
  status?: AccountStatus | 'ALL';
}
