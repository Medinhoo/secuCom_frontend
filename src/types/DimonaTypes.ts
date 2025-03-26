import { Collaborator } from "./CollaboratorTypes";
import { CompanyDto } from "./CompanyTypes";

export interface Dimona {
  id: string;
  type: DimonaType;
  entryDate: Date;
  exitDate: Date;
  exitReason?: string;
  status: DimonaStatus;
  onssReference: string;
  errorMessage?: string;
  collaborator: Collaborator;
  company: CompanyDto;
}

export enum DimonaType {
  IN = "IN",
  OUT = "OUT",
  UPDATE = "UPDATE",
}

export enum DimonaStatus {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  PENDING = "PENDING",
}

export interface CreateDimonaRequest {
  type: DimonaType;
  entryDate: Date;
  exitDate: Date;
  exitReason?: string;
  collaboratorId: string;
  companyId: string;
}

export interface DimonaDto extends Omit<Dimona, "collaborator" | "company"> {
  collaboratorId: string;
  companyId: string;
}
