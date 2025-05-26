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
  TO_CONFIRM = "TO_CONFIRM",
  TO_SEND = "TO_SEND",
  IN_PROGRESS = "IN_PROGRESS",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
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

export interface StatusHistoryDto {
  id: string;
  dimonaId: string;
  previousStatus: string | null;
  newStatus: string;
  changeReason: string;
  changedByUserId: string;
  changedByUserName: string;
  changedAt: string; // ISO date
  changeDescription: string;
  isStatusCreation: boolean;
}
