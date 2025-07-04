import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Eye, Calendar, Building, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { documentService } from '@/services/api/documentService';
import type { DocumentGeneration } from '@/types/DocumentTypes';
import { toast } from 'sonner';

export function DocumentViewPage() {
  const { generationId } = useParams<{ generationId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<DocumentGeneration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      if (!generationId) {
        navigate('/documents');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const documentData = await documentService.getGenerationById(generationId);
        setDocument(documentData);
      } catch (err) {
        console.error('Erreur lors du chargement du document:', err);
        setError('Document non trouvé');
        toast.error('Erreur lors du chargement du document');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [generationId, navigate]);

  const handleDownloadPdf = async () => {
    if (!document) return;

    try {
      const blob = await documentService.downloadDocumentPdf(document.id);
      const fileName = document.pdfFileName || document.generatedFileName.replace('.docx', '.pdf');
      documentService.downloadFile(blob, fileName);
      
      toast.success('Téléchargement PDF démarré');
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  const handleDownloadDocx = async () => {
    if (!document) return;

    try {
      const blob = await documentService.downloadDocument(document.id);
      documentService.downloadFile(blob, document.generatedFileName);
      
      toast.success('Téléchargement DOCX démarré');
    } catch (error) {
      console.error('Erreur lors du téléchargement DOCX:', error);
      toast.error('Erreur lors du téléchargement du DOCX');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-700">Terminé</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-700">Échec</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-700">En cours</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Chargement du document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Document non trouvé'}</p>
          <Button onClick={() => navigate('/documents/contracts')}>
            Retour à la liste des contrats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/documents/contracts')}
          className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Détails du document
          </h1>
          <p className="text-slate-500 mt-1">
            {document.templateDisplayName}
          </p>
        </div>
      </div>

      {/* Document Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="h-5 w-5" />
            Informations du document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Type de document</label>
                <p className="text-slate-900 font-medium">{document.templateDisplayName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600">Nom du fichier</label>
                <p className="text-slate-900 font-medium">{document.generatedFileName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Statut</label>
                <div className="mt-1">
                  {getStatusBadge(document.status)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Généré par</label>
                <p className="text-slate-900 font-medium">{document.generatedByName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Date de génération</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <p className="text-slate-900">
                    {new Date(document.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              {document.errorMessage && (
                <div>
                  <label className="text-sm font-medium text-red-600">Message d'erreur</label>
                  <p className="text-red-700 bg-red-50 p-2 rounded text-sm mt-1">
                    {document.errorMessage}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Company and Employee Info */}
          {(document.companyName || document.collaboratorName) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Informations associées</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {document.companyName && (
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-slate-600">Entreprise</label>
                      <p className="text-slate-900 font-medium">{document.companyName}</p>
                    </div>
                  </div>
                )}

                {document.collaboratorName && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-slate-600">Collaborateur</label>
                      <p className="text-slate-900 font-medium">{document.collaboratorName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Data */}
          {document.formData && Object.keys(document.formData).length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Données du formulaire</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(document.formData).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-slate-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <p className="text-slate-900">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {document.status === 'COMPLETED' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800">Actions</CardTitle>
          </CardHeader>
          <CardContent>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
