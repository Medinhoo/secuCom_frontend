import { apiClient } from './baseApi';
import { DOCUMENT_ENDPOINTS } from '@/config/api.config';
import type { 
  TemplateAnalysisResult, 
  EntityMetadata, 
  CreateTemplateRequest 
} from '@/types/TemplateTypes';
import type { DocumentTemplate } from '@/types/DocumentTypes';

export const templateService = {
  // Récupérer les métadonnées des entités (Company, Collaborator)
  getEntityMetadata: () =>
    apiClient.get<EntityMetadata>(DOCUMENT_ENDPOINTS.GET_ENTITY_METADATA, {
      requiresAuth: true,
    }),

  // Vérifier la disponibilité d'un nom de template
  checkTemplateName: (name: string) =>
    apiClient.get<{ available: boolean }>(DOCUMENT_ENDPOINTS.CHECK_TEMPLATE_NAME(name), {
      requiresAuth: true,
    }),

  // Analyser un fichier DOCX pour extraire les variables (nécessite FormData)
  async analyzeTemplate(file: File): Promise<TemplateAnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${import.meta.env.VITE_SECUCOM_API}${DOCUMENT_ENDPOINTS.ANALYZE_TEMPLATE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de l\'analyse du template');
    }

    return response.json();
  },

  // Créer un nouveau template (nécessite FormData)
  async createTemplate(request: CreateTemplateRequest): Promise<DocumentTemplate> {
    const formData = new FormData();
    formData.append('templateName', request.templateName);
    formData.append('displayName', request.displayName);
    if (request.description) {
      formData.append('description', request.description);
    }
    formData.append('docxFile', request.docxFile);
    formData.append('mappings', JSON.stringify(request.mappings));

    const response = await fetch(`${import.meta.env.VITE_SECUCOM_API}${DOCUMENT_ENDPOINTS.CREATE_TEMPLATE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de la création du template');
    }

    return response.json();
  },
};
