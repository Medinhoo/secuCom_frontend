import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Download, Eye, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentGenerationForm } from '@/components/features/documents/DocumentGenerationForm';
import { EmailModal } from '@/components/features/documents/EmailModal';
import { documentService } from '@/services/api/documentService';
import type { DocumentGenerationFormData, DocumentGeneration } from '@/types/DocumentTypes';
import { toast } from 'sonner';

export function DocumentGenerationPage() {
  const { templateName } = useParams<{ templateName: string }>();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<DocumentGeneration | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!templateName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Template non spécifié</p>
          <Button onClick={() => navigate('/documents')} className="mt-4">
            Retour aux documents
          </Button>
        </div>
      </div>
    );
  }

  const handleFormSubmit = async (formData: DocumentGenerationFormData) => {
    setIsGenerating(true);
    try {
      // Nous devons d'abord récupérer l'ID du template à partir de son nom
      const templates = await documentService.getTemplates();
      const template = templates.find(t => t.name === templateName);
      
      if (!template) {
        throw new Error('Template non trouvé');
      }

      const requestData = {
        ...formData,
        templateId: template.id,
      };

      const result = await documentService.generateDocument(requestData);
      setGeneratedDocument(result);
      
      toast.success('Document généré avec succès !', {
        description: `Le document "${result.templateDisplayName}" a été créé.`,
      });

    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast.error('Erreur lors de la génération du document', {
        description: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!generatedDocument) return;

    try {
      const blob = await documentService.downloadDocumentPdf(generatedDocument.id);
      const fileName = generatedDocument.pdfFileName || generatedDocument.generatedFileName.replace('.docx', '.pdf');
      documentService.downloadFile(blob, fileName);
      
      toast.success('Téléchargement PDF démarré');
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  const handleDownloadDocx = async () => {
    if (!generatedDocument) return;

    try {
      const blob = await documentService.downloadDocument(generatedDocument.id);
      documentService.downloadFile(blob, generatedDocument.generatedFileName);
      
      toast.success('Téléchargement DOCX démarré');
    } catch (error) {
      console.error('Erreur lors du téléchargement DOCX:', error);
      toast.error('Erreur lors du téléchargement du DOCX');
    }
  };

  const handleViewInContracts = () => {
    navigate('/documents/contracts');
  };

  const getTemplateDisplayName = () => {
    switch (templateName) {
      case 'CNT_Employe':
        return 'Contrat de travail employé';
      default:
        return templateName;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/documents')}
          className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Générer un document
          </h1>
          <p className="text-slate-500 mt-1">
            {getTemplateDisplayName()}
          </p>
        </div>
      </div>

      {!generatedDocument ? (
        /* Formulaire de génération */
        <DocumentGenerationForm
          templateName={templateName}
          onSubmit={handleFormSubmit}
          isLoading={isGenerating}
        />
      ) : (
        /* Résultat de la génération */
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-6 w-6" />
              Document généré avec succès !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations du document */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3">Détails du document</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Type de document :</span>
                  <span className="ml-2 font-medium">{generatedDocument.templateDisplayName}</span>
                </div>
                <div>
                  <span className="text-slate-600">Nom du fichier :</span>
                  <span className="ml-2 font-medium">{generatedDocument.generatedFileName}</span>
                </div>
                {generatedDocument.companyName && (
                  <div>
                    <span className="text-slate-600">Entreprise :</span>
                    <span className="ml-2 font-medium">{generatedDocument.companyName}</span>
                  </div>
                )}
                {generatedDocument.collaboratorName && (
                  <div>
                    <span className="text-slate-600">Collaborateur :</span>
                    <span className="ml-2 font-medium">{generatedDocument.collaboratorName}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-600">Généré le :</span>
                  <span className="ml-2 font-medium">
                    {new Date(generatedDocument.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Statut :</span>
                  <Badge className="ml-2 bg-green-100 text-green-700">
                    {generatedDocument.status === 'COMPLETED' ? 'Terminé' : generatedDocument.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleDownloadPdf}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger le PDF
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownloadDocx}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger le DOCX
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsEmailModalOpen(true)}
                className="border-green-200 text-green-600 hover:bg-green-50"
              >
                <Mail className="mr-2 h-4 w-4" />
                Envoyer par email
              </Button>
              
              <Button
                variant="outline"
                onClick={handleViewInContracts}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir dans la liste des contrats
              </Button>
            </div>

            {/* Nouvelle génération */}
            <div className="pt-4 border-t border-green-200">
              <p className="text-sm text-slate-600 mb-3">
                Souhaitez-vous générer un autre document ?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGeneratedDocument(null);
                  }}
                  className="border-slate-300"
                >
                  Générer le même type
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/documents')}
                  className="border-slate-300"
                >
                  Choisir un autre type
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Modal */}
      {generatedDocument && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          documentGenerationId={generatedDocument.id}
          documentName={generatedDocument.generatedFileName}
          templateDisplayName={generatedDocument.templateDisplayName}
        />
      )}
    </div>
  );
}
