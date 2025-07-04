import { apiClient } from './baseApi';
import { DOCUMENT_ENDPOINTS } from '@/config/api.config';
import type {
  DocumentTemplate,
  TemplateVariable,
  DocumentGenerationRequest,
  DocumentGeneration,
  EmailTemplate,
  SendEmailRequest,
  SendEmailResponse,
} from '@/types/DocumentTypes';

export const documentService = {
  // Récupérer tous les templates actifs
  getTemplates: () =>
    apiClient.get<DocumentTemplate[]>(DOCUMENT_ENDPOINTS.GET_TEMPLATES, {
      requiresAuth: true,
    }),

  // Récupérer un template par ID
  getTemplateById: (templateId: string) =>
    apiClient.get<DocumentTemplate>(DOCUMENT_ENDPOINTS.GET_TEMPLATE_BY_ID(templateId), {
      requiresAuth: true,
    }),

  // Récupérer les variables d'un template
  getTemplateVariables: (templateId: string) =>
    apiClient.get<TemplateVariable[]>(DOCUMENT_ENDPOINTS.GET_TEMPLATE_VARIABLES(templateId), {
      requiresAuth: true,
    }),

  // Récupérer les variables d'un template par nom
  getTemplateVariablesByName: (templateName: string) =>
    apiClient.get<TemplateVariable[]>(DOCUMENT_ENDPOINTS.GET_TEMPLATE_VARIABLES_BY_NAME(templateName), {
      requiresAuth: true,
    }),

  // Générer un document
  generateDocument: (request: DocumentGenerationRequest) =>
    apiClient.post<DocumentGeneration>(DOCUMENT_ENDPOINTS.GENERATE_DOCUMENT, request, {
      requiresAuth: true,
    }),

  // Récupérer l'historique des générations
  getGenerations: () =>
    apiClient.get<DocumentGeneration[]>(DOCUMENT_ENDPOINTS.GET_GENERATIONS, {
      requiresAuth: true,
    }),

  // Récupérer une génération par ID
  getGenerationById: (generationId: string) =>
    apiClient.get<DocumentGeneration>(DOCUMENT_ENDPOINTS.GET_GENERATION_BY_ID(generationId), {
      requiresAuth: true,
    }),

  // Télécharger un document généré (nécessite une gestion spéciale pour les blobs)
  async downloadDocument(generationId: string): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_SECUCOM_API}${DOCUMENT_ENDPOINTS.DOWNLOAD_DOCUMENT(generationId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement du document');
    }

    return response.blob();
  },

  // Télécharger un document PDF (quand disponible)
  async downloadDocumentPdf(generationId: string): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_SECUCOM_API}${DOCUMENT_ENDPOINTS.DOWNLOAD_DOCUMENT_PDF(generationId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`,
      },
    });

    if (!response.ok) {
      if (response.status === 501) {
        throw new Error('La conversion PDF n\'est pas encore disponible');
      }
      throw new Error('Erreur lors du téléchargement du PDF');
    }

    return response.blob();
  },

  // Utilitaire pour déclencher le téléchargement d'un fichier
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // ===== MÉTHODES EMAIL =====

  // Récupérer le template d'email pour une génération
  getEmailTemplate: (generationId: string) =>
    apiClient.get<EmailTemplate>(DOCUMENT_ENDPOINTS.GET_EMAIL_TEMPLATE(generationId), {
      requiresAuth: true,
    }),

  // Envoyer un document par email
  sendEmail: (request: SendEmailRequest) =>
    apiClient.post<SendEmailResponse>(DOCUMENT_ENDPOINTS.SEND_EMAIL, request, {
      requiresAuth: true,
    }),
};
