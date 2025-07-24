import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, AlertTriangle, FileText } from 'lucide-react';
import { documentService } from '@/services/api/documentService';
import { DocumentGeneration } from '@/types/DocumentTypes';
import { toast } from 'sonner';

interface OtherDocumentsListProps {
  collaboratorId: string;
}

export function OtherDocumentsList({ collaboratorId }: OtherDocumentsListProps) {
  const [documents, setDocuments] = useState<DocumentGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const allDocuments = await documentService.getDocuments();
        // Filtrer les documents pour ce collaborateur (exclure les contrats)
        const filteredDocuments = allDocuments.filter(
          (doc: DocumentGeneration) => 
            doc.collaboratorName?.includes(collaboratorId) && // Approximation - à améliorer avec un vrai champ collaboratorId
            doc.documentType !== 'Contrat'
        );
        setDocuments(filteredDocuments);
      } catch (err) {
        setError('Erreur lors du chargement des documents');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [collaboratorId]);

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      const blob = await documentService.downloadDocumentPdf(documentId);
      documentService.downloadFile(blob, filename);
      toast.success('Téléchargement démarré');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Terminé
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            En cours
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Échec
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">Erreur lors du chargement des documents</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="flex flex-col items-center justify-center">
          <FileText className="h-10 w-10 text-gray-300 mb-2" />
          <p className="text-gray-500">Aucun autre document trouvé</p>
          <p className="text-sm text-gray-400 mt-1">
            Ce collaborateur n'a pas d'autres documents générés
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card key={document.id} className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-slate-900">
                    {document.templateDisplayName || document.templateName}
                  </h4>
                  {getStatusBadge(document.status)}
                </div>
                
                <p className="text-sm text-slate-500 mb-2">
                  Créé le {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                  {document.generatedByName && (
                    <> • Par {document.generatedByName}</>
                  )}
                </p>
                
                {document.errorMessage && (
                  <p className="text-sm text-red-600 mb-2">
                    Erreur: {document.errorMessage}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 ml-4">
                {document.status === 'COMPLETED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(document.id, document.generatedFileName)}
                    className="border-slate-200 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
