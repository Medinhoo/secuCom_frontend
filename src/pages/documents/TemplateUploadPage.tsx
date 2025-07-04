import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, FileText, Settings, CheckCircle, Mail, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { templateService } from '@/services/api/templateService';
import { VariableMappingForm } from '@/components/features/documents/VariableMappingForm';
import type { 
  TemplateAnalysisResult, 
  EntityMetadata, 
  VariableMapping,
  CreateTemplateRequest 
} from '@/types/TemplateTypes';
import type { DocumentTemplate } from '@/types/DocumentTypes';

type Step = 'upload' | 'mapping' | 'email' | 'success';

export function TemplateUploadPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [isLoading, setIsLoading] = useState(false);
  
  // Upload step state
  const [templateName, setTemplateName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);
  
  // Analysis results
  const [analysisResult, setAnalysisResult] = useState<TemplateAnalysisResult | null>(null);
  const [entityMetadata, setEntityMetadata] = useState<EntityMetadata | null>(null);
  const [variableMappings, setVariableMappings] = useState<VariableMapping[]>([]);
  
  // Email configuration state
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [defaultEmailSubject, setDefaultEmailSubject] = useState('');
  const [defaultEmailBody, setDefaultEmailBody] = useState('');
  const [defaultRecipients, setDefaultRecipients] = useState<string[]>([]);
  const [defaultCcRecipients, setDefaultCcRecipients] = useState<string[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [currentCcRecipient, setCurrentCcRecipient] = useState('');
  
  // Success state
  const [createdTemplate, setCreatedTemplate] = useState<DocumentTemplate | null>(null);

  // Initialize default email values when moving to email step
  useEffect(() => {
    if (currentStep === 'email' && displayName) {
      setDefaultEmailSubject(`Document généré - ${displayName}`);
      setDefaultEmailBody('Bonjour,\n\nVeuillez trouver ci-joint le document généré.\n\nCordialement');
    }
  }, [currentStep, displayName]);

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const addRecipient = () => {
    if (currentRecipient && isValidEmail(currentRecipient) && !defaultRecipients.includes(currentRecipient)) {
      setDefaultRecipients(prev => [...prev, currentRecipient]);
      setCurrentRecipient('');
    } else if (!isValidEmail(currentRecipient)) {
      toast.error('Veuillez entrer une adresse email valide');
    } else if (defaultRecipients.includes(currentRecipient)) {
      toast.error('Cette adresse email est déjà dans la liste');
    }
  };

  const removeRecipient = (email: string) => {
    setDefaultRecipients(prev => prev.filter(r => r !== email));
  };

  const addCcRecipient = () => {
    if (currentCcRecipient && isValidEmail(currentCcRecipient) && !defaultCcRecipients.includes(currentCcRecipient)) {
      setDefaultCcRecipients(prev => [...prev, currentCcRecipient]);
      setCurrentCcRecipient('');
    } else if (!isValidEmail(currentCcRecipient)) {
      toast.error('Veuillez entrer une adresse email valide');
    } else if (defaultCcRecipients.includes(currentCcRecipient)) {
      toast.error('Cette adresse email est déjà dans la liste');
    }
  };

  const removeCcRecipient = (email: string) => {
    setDefaultCcRecipients(prev => prev.filter(r => r !== email));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  // Check template name availability
  useEffect(() => {
    if (templateName.trim().length < 2) {
      setNameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingName(true);
      try {
        const result = await templateService.checkTemplateName(templateName.trim());
        setNameAvailable(result.available);
      } catch (error) {
        console.error('Erreur lors de la vérification du nom:', error);
        setNameAvailable(null);
      } finally {
        setCheckingName(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [templateName]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.docx')) {
        toast.error('Format de fichier invalide', {
          description: 'Veuillez sélectionner un fichier DOCX.',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAnalyzeTemplate = async () => {
    if (!selectedFile || !templateName.trim() || !displayName.trim() || nameAvailable === false) {
      return;
    }

    setIsLoading(true);
    try {
      // Analyser le template et récupérer les métadonnées en parallèle
      const [analysis, metadata] = await Promise.all([
        templateService.analyzeTemplate(selectedFile),
        templateService.getEntityMetadata(),
      ]);

      setAnalysisResult(analysis);
      setEntityMetadata(metadata);

      // Initialiser les mappings avec des valeurs par défaut
      const initialMappings: VariableMapping[] = analysis.variables.map(variable => ({
        variableName: variable,
        displayName: variable.charAt(0).toUpperCase() + variable.slice(1).replace(/_/g, ' '),
        entity: 'manual',
        type: 'string',
        required: false,
        description: '',
      }));

      setVariableMappings(initialMappings);
      setCurrentStep('mapping');

      toast.success('Analyse terminée', {
        description: `${analysis.variables.length} variable(s) trouvée(s) dans le template.`,
      });

    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast.error('Erreur lors de l\'analyse', {
        description: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!selectedFile || !analysisResult) return;

    setIsLoading(true);
    try {
      const request: CreateTemplateRequest = {
        templateName: templateName.trim(),
        displayName: displayName.trim(),
        description: description.trim() || undefined,
        docxFile: selectedFile,
        mappings: variableMappings,
        emailEnabled: emailEnabled,
        defaultEmailSubject: emailEnabled ? defaultEmailSubject : undefined,
        defaultEmailBody: emailEnabled ? defaultEmailBody : undefined,
        defaultRecipients: emailEnabled && defaultRecipients.length > 0 ? JSON.stringify(defaultRecipients) : undefined,
        defaultCcRecipients: emailEnabled && defaultCcRecipients.length > 0 ? JSON.stringify(defaultCcRecipients) : undefined,
      };

      const createdTemplate = await templateService.createTemplate(request);
      setCreatedTemplate(createdTemplate);
      setCurrentStep('success');

      toast.success('Template créé avec succès !', {
        description: `Le template "${createdTemplate.displayName}" est maintenant disponible.`,
      });

    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création', {
        description: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToMapping = selectedFile && 
    templateName.trim().length >= 2 && 
    displayName.trim().length >= 2 && 
    nameAvailable === true;

  const renderUploadStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Informations du template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Nom du template *</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="ex: contrat_stage"
              className={nameAvailable === false ? 'border-red-500' : nameAvailable === true ? 'border-green-500' : ''}
            />
            {checkingName && (
              <p className="text-sm text-gray-500">Vérification...</p>
            )}
            {nameAvailable === false && (
              <p className="text-sm text-red-500">Ce nom est déjà utilisé</p>
            )}
            {nameAvailable === true && (
              <p className="text-sm text-green-500">Nom disponible</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Nom d'affichage *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ex: Contrat de stage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description optionnelle du template"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Fichier DOCX *</Label>
            <Input
              id="file"
              type="file"
              accept=".docx"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                {selectedFile.name}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/documents')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        
        <Button
          onClick={handleAnalyzeTemplate}
          disabled={!canProceedToMapping || isLoading}
        >
          {isLoading ? 'Analyse en cours...' : 'Analyser le template'}
        </Button>
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration des variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysisResult && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Variables trouvées dans le fichier <strong>{analysisResult.originalFileName}</strong> :
              </p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.variables.map((variable) => (
                  <Badge key={variable} variant="secondary">
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Separator className="my-4" />
          
          {entityMetadata && (
            <VariableMappingForm
              variables={analysisResult?.variables || []}
              entityMetadata={entityMetadata}
              mappings={variableMappings}
              onMappingsChange={setVariableMappings}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('upload')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <Button
          onClick={() => setCurrentStep('email')}
          disabled={isLoading}
        >
          Suivant
        </Button>
      </div>
    </div>
  );

  const renderEmailStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuration des emails par défaut
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email enabled checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailEnabled"
              checked={emailEnabled}
              onCheckedChange={(checked) => setEmailEnabled(checked as boolean)}
            />
            <Label htmlFor="emailEnabled" className="text-sm font-medium">
              Activer l'envoi par email pour ce template
            </Label>
          </div>

          {emailEnabled && (
            <>
              {/* Default subject */}
              <div className="space-y-2">
                <Label htmlFor="defaultEmailSubject">Objet par défaut</Label>
                <Input
                  id="defaultEmailSubject"
                  value={defaultEmailSubject}
                  onChange={(e) => setDefaultEmailSubject(e.target.value)}
                  placeholder="ex: Document généré - {templateDisplayName}"
                />
                <p className="text-xs text-gray-500">
                  Variables disponibles : {'{templateDisplayName}'}, {'{companyName}'}, {'{collaboratorName}'}
                </p>
              </div>

              {/* Default body */}
              <div className="space-y-2">
                <Label htmlFor="defaultEmailBody">Message par défaut</Label>
                <Textarea
                  id="defaultEmailBody"
                  value={defaultEmailBody}
                  onChange={(e) => setDefaultEmailBody(e.target.value)}
                  placeholder="Bonjour,&#10;&#10;Veuillez trouver ci-joint le document généré.&#10;&#10;Cordialement"
                  rows={4}
                />
              </div>

              {/* Default recipients */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Destinataires par défaut
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Ajouter une adresse email..."
                    value={currentRecipient}
                    onChange={(e) => setCurrentRecipient(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addRecipient)}
                    className="flex-1"
                  />
                  <Button onClick={addRecipient} size="sm" type="button">
                    Ajouter
                  </Button>
                </div>
                {defaultRecipients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {defaultRecipients.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1">
                        {email}
                        <button
                          onClick={() => removeRecipient(email)}
                          className="ml-1 hover:text-red-600"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Default CC recipients */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Destinataires en copie (CC) par défaut
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Ajouter une adresse email en copie..."
                    value={currentCcRecipient}
                    onChange={(e) => setCurrentCcRecipient(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addCcRecipient)}
                    className="flex-1"
                  />
                  <Button onClick={addCcRecipient} size="sm" variant="outline" type="button">
                    Ajouter
                  </Button>
                </div>
                {defaultCcRecipients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {defaultCcRecipients.map((email) => (
                      <Badge key={email} variant="outline" className="flex items-center gap-1">
                        {email}
                        <button
                          onClick={() => removeCcRecipient(email)}
                          className="ml-1 hover:text-red-600"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('mapping')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <Button
          onClick={handleCreateTemplate}
          disabled={isLoading}
        >
          {isLoading ? 'Création en cours...' : 'Créer le template'}
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-6 w-6" />
          Template créé avec succès !
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {createdTemplate && (
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-3">Détails du template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nom :</span>
                <span className="ml-2 font-medium">{createdTemplate.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Nom d'affichage :</span>
                <span className="ml-2 font-medium">{createdTemplate.displayName}</span>
              </div>
              <div>
                <span className="text-gray-600">Fichier :</span>
                <span className="ml-2 font-medium">{createdTemplate.fileName}</span>
              </div>
              <div>
                <span className="text-gray-600">Variables :</span>
                <span className="ml-2 font-medium">{createdTemplate.variables?.length || 0}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/documents')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Retour aux documents
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              setCurrentStep('upload');
              setSelectedFile(null);
              setTemplateName('');
              setDisplayName('');
              setDescription('');
              setAnalysisResult(null);
              setVariableMappings([]);
              setCreatedTemplate(null);
            }}
            className="border-green-200 text-green-600 hover:bg-green-50"
          >
            Créer un autre template
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
            Créer un template personnalisé
          </h1>
          <p className="text-slate-500 mt-1">
            Uploadez un fichier DOCX et configurez les variables
          </p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-2">
          <div className={`flex items-center ${currentStep === 'upload' ? 'text-blue-600' : (currentStep === 'mapping' || currentStep === 'email' || currentStep === 'success') ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'upload' ? 'bg-blue-100 text-blue-600' : (currentStep === 'mapping' || currentStep === 'email' || currentStep === 'success') ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Upload</span>
          </div>
          
          <div className={`w-6 h-0.5 ${(currentStep === 'mapping' || currentStep === 'email' || currentStep === 'success') ? 'bg-green-600' : 'bg-gray-200'}`} />
          
          <div className={`flex items-center ${currentStep === 'mapping' ? 'text-blue-600' : (currentStep === 'email' || currentStep === 'success') ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'mapping' ? 'bg-blue-100 text-blue-600' : (currentStep === 'email' || currentStep === 'success') ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Variables</span>
          </div>
          
          <div className={`w-6 h-0.5 ${(currentStep === 'email' || currentStep === 'success') ? 'bg-green-600' : 'bg-gray-200'}`} />
          
          <div className={`flex items-center ${currentStep === 'email' ? 'text-blue-600' : currentStep === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'email' ? 'bg-blue-100 text-blue-600' : currentStep === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Email</span>
          </div>
          
          <div className={`w-6 h-0.5 ${currentStep === 'success' ? 'bg-green-600' : 'bg-gray-200'}`} />
          
          <div className={`flex items-center ${currentStep === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              4
            </div>
            <span className="ml-2 text-sm font-medium">Terminé</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {currentStep === 'upload' && renderUploadStep()}
      {currentStep === 'mapping' && renderMappingStep()}
      {currentStep === 'email' && renderEmailStep()}
      {currentStep === 'success' && renderSuccessStep()}
    </div>
  );
}
