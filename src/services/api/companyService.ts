import { apiClient } from "./baseApi";
import { COMPANY_ENDPOINTS } from "@/config/api.config";
import type { CompanyDto } from "@/types/CompanyTypes";
import type { CompanyLookupDto } from "@/types/CompanyLookupTypes";

export const companyService = {
  getAllCompanies: () =>
    apiClient.get<CompanyDto[]>(COMPANY_ENDPOINTS.GET_ALL, {
      requiresAuth: true,
    }),

  getCompanyById: (id: string) =>
    apiClient.get<CompanyDto>(COMPANY_ENDPOINTS.GET_BY_ID(id), {
      requiresAuth: true,
    }),

  createCompany: (company: Omit<CompanyDto, "id">) =>
    apiClient.post<CompanyDto>(COMPANY_ENDPOINTS.CREATE, company, {
      requiresAuth: true,
    }),

  updateCompany: (id: string, company: CompanyDto) =>
    apiClient.put<CompanyDto>(COMPANY_ENDPOINTS.UPDATE(id), company, {
      requiresAuth: true,
    }),

  deleteCompany: (id: string) =>
    apiClient.delete(COMPANY_ENDPOINTS.DELETE(id), { requiresAuth: true }),

  checkBceNumberExists: (bceNumber: string) =>
    apiClient.get<boolean>(COMPANY_ENDPOINTS.CHECK_BCE(bceNumber), {
      requiresAuth: true,
    }),

  checkOnssNumberExists: (onssNumber: string) =>
    apiClient.get<boolean>(COMPANY_ENDPOINTS.CHECK_ONSS(onssNumber), {
      requiresAuth: true,
    }),

  checkVatNumberExists: (vatNumber: string) =>
    apiClient.get<boolean>(COMPANY_ENDPOINTS.CHECK_VAT(vatNumber), {
      requiresAuth: true,
    }),

  lookupCompanyByBce: (bceNumber: string) =>
    apiClient.get<CompanyLookupDto>(COMPANY_ENDPOINTS.LOOKUP_BCE(bceNumber), {
      requiresAuth: true,
    }),

  lookupCompanyByVat: (vatNumber: string) =>
    apiClient.get<CompanyLookupDto>(COMPANY_ENDPOINTS.LOOKUP_VAT(vatNumber), {
      requiresAuth: true,
    }),
};
