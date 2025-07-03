import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { FileText, AlertCircle } from 'lucide-react';
import { documentService } from '@/services/api/documentService';
import type { DocumentTemplate } from '@/types/DocumentTypes';
import { toast } from 'sonner';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateSelectionModal({ isOpen, onClose }: TemplateSelectionModalProps) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Charger les templates quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const templatesData = await documentService.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleContinue = () => {
    if (!selectedTemplateId) {
      toast.error('Veuillez sélectionner un template');
      return;
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) {
      toast.error('Template non trouvé');
      return;
    }

    setIsLoading(true);
    
    // Rediriger vers la page de génération avec le nom du template
    navigate(`/documents/generate/${selectedTemplate.name}`);
    
    // Fermer la modal
    onClose();
    setIsLoading(false);
  };

  const handleClose = () => {
    setSelectedTemplateId('');
    onClose();
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Générer un document
          </DialogTitle>
          <DialogDescription>
            Sélectionnez le type de document que vous souhaitez générer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2 text-sm text-slate-600">
                Chargement des templates...
              </span>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Aucun template disponible</span>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="template-select" className="text-sm font-medium">
                  Type de document
                </label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger id="template-select">
                    <SelectValue placeholder="Sélectionnez un type de document" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="font-medium">{template.displayName}</div>
                            {template.description && (
                              <div className="text-xs text-slate-500">
                                {template.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {selectedTemplate.displayName}
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    {selectedTemplate.description}
                  </p>
                  <div className="text-xs text-blue-600">
                    <strong>Fichier:</strong> {selectedTemplate.fileName}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleContinue} 
            disabled={!selectedTemplateId || isLoading || isLoadingTemplates}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Chargement...
              </>
            ) : (
              'Continuer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
