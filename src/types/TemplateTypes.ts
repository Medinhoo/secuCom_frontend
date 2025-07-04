export interface TemplateAnalysisResult {
  variables: string[];
  originalFileName: string;
}

export interface EntityFieldInfo {
  fieldPath: string;
  displayName: string;
  type: string;
}

export interface VariableMapping {
  variableName: string;
  displayName: string;
  entity: 'Company' | 'Collaborator' | 'manual';
  field?: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface CreateTemplateRequest {
  templateName: string;
  displayName: string;
  description?: string;
  docxFile: File;
  mappings: VariableMapping[];
}

export interface EntityMetadata {
  Company: EntityFieldInfo[];
  Collaborator: EntityFieldInfo[];
}

export const MANUAL_FIELD_TYPES = [
  { value: 'string', label: 'Texte' },
  { value: 'text', label: 'Texte long' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Nombre' },
  { value: 'decimal', label: 'Décimal' },
  { value: 'boolean', label: 'Oui/Non' },
] as const;

export type ManualFieldType = typeof MANUAL_FIELD_TYPES[number]['value'];
