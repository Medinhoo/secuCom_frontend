// Types pour le système de génération de documents

export interface DocumentTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  fileName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  displayName: string;
  entity: string;
  field: string | null;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
  options?: string[];
}

export interface DocumentGenerationRequest {
  templateId: string;
  companyId?: string;
  collaboratorId?: string;
  manualFields: Record<string, string>;
}

export interface DocumentGeneration {
  id: string;
  templateName: string;
  templateDisplayName: string;
  companyName?: string;
  collaboratorName?: string;
  generatedByName: string;
  generatedFileName: string;
  pdfFileName?: string;
  status: DocumentGenerationStatus;
  errorMessage?: string;
  createdAt: string;
  formData: Record<string, string>;
}

export type DocumentGenerationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface DocumentGenerationFormData {
  templateId: string;
  companyId: string;
  collaboratorId: string;
  manualFields: Record<string, string>;
}

// Types pour l'intégration avec les documents existants
export interface GeneratedDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  dateUpload: string;
  size: string;
  enterprise?: string;
  employee?: string;
  status: 'active' | 'archive' | 'pending';
  isGenerated: boolean;
  generationId?: string;
}
