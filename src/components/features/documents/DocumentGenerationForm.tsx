import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Building, User, FileText } from 'lucide-react';
import { companyService } from '@/services/api/companyService';
import { collaboratorService } from '@/services/api/collaboratorService';
import { documentService } from '@/services/api/documentService';
import type { CompanyDto } from '@/types/CompanyTypes';
import type { Collaborator } from '@/types/CollaboratorTypes';
import type { TemplateVariable, DocumentGenerationFormData } from '@/types/DocumentTypes';
import { toast } from 'sonner';

interface DocumentGenerationFormProps {
  templateName: string;
  onSubmit: (formData: DocumentGenerationFormData) => void;
  isLoading: boolean;
}

export function DocumentGenerationForm({ templateName, onSubmit, isLoading }: DocumentGenerationFormProps) {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [filteredCollaborators, setFilteredCollaborators] = useState<Collaborator[]>([]);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [formData, setFormData] = useState<DocumentGenerationFormData>({
    templateId: '',
    companyId: '',
    collaboratorId: '',
    manualFields: {},
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [templateName]);

  useEffect(() => {
    // Filtrer les collaborateurs par entreprise sélectionnée
    if (formData.companyId) {
      const filtered = collaborators.filter(c => c.companyId === formData.companyId);
      setFilteredCollaborators(filtered);
      // Reset collaborator selection if current selection is not in the filtered list
      if (formData.collaboratorId && !filtered.find(c => c.id === formData.collaboratorId)) {
        setFormData(prev => ({ ...prev, collaboratorId: '' }));
      }
    } else {
      setFilteredCollaborators([]);
      setFormData(prev => ({ ...prev, collaboratorId: '' }));
    }
  }, [formData.companyId, collaborators]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      const [companiesData, collaboratorsData, variablesData] = await Promise.all([
        companyService.getAllCompanies(),
        collaboratorService.getAllCollaborators(),
        documentService.getTemplateVariablesByName(templateName),
      ]);

      setCompanies(companiesData);
      setCollaborators(collaboratorsData);
      setVariables(variablesData);

      // Find template ID from variables (assuming it's available in the response)
      // For now, we'll use the template name as ID since we don't have the template ID
      setFormData(prev => ({ ...prev, templateId: templateName }));

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setFormData(prev => ({
      ...prev,
      companyId,
      collaboratorId: '', // Reset collaborator when company changes
    }));
  };

  const handleCollaboratorChange = (collaboratorId: string) => {
    setFormData(prev => ({ ...prev, collaboratorId }));
  };

  const handleManualFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      manualFields: {
        ...prev.manualFields,
        [fieldName]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.companyId) {
      toast.error('Veuillez sélectionner une entreprise');
      return;
    }

    if (!formData.collaboratorId) {
      toast.error('Veuillez sélectionner un collaborateur');
      return;
    }

    // Check required manual fields
    const requiredManualFields = variables.filter(v => v.entity === 'manual' && v.required);
    const missingFields = requiredManualFields.filter(field => 
      !formData.manualFields[field.name] || formData.manualFields[field.name].trim() === ''
    );

    if (missingFields.length > 0) {
      toast.error(`Veuillez remplir les champs obligatoires: ${missingFields.map(f => f.displayName).join(', ')}`);
      return;
    }

    onSubmit(formData);
  };

  const getManualFields = () => variables.filter(v => v.entity === 'manual');
  const getCompanyFields = () => variables.filter(v => v.entity === 'Company');
  const getCollaboratorFields = () => variables.filter(v => v.entity === 'Collaborator');

  const selectedCompany = companies.find(c => c.id === formData.companyId);
  const selectedCollaborator = filteredCollaborators.find(c => c.id === formData.collaboratorId);

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Sélection de l'entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-select">Entreprise *</Label>
            <Select value={formData.companyId} onValueChange={handleCompanyChange}>
              <SelectTrigger id="company-select">
                <SelectValue placeholder="Sélectionnez une entreprise" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-xs text-slate-500">
                        BCE: {company.bceNumber}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompany && getCompanyFields().length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Données de l'entreprise qui seront utilisées :</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {getCompanyFields().map((field) => (
                  <div key={field.name}>
                    <span className="text-blue-700 font-medium">{field.displayName}:</span>
                    <span className="ml-1 text-blue-600">
                      {field.field === 'name' ? selectedCompany.name :
                       field.field === 'companyName' ? selectedCompany.companyName :
                       field.field === 'bceNumber' ? selectedCompany.bceNumber :
                       field.field === 'onssNumber' ? selectedCompany.onssNumber :
                       field.field === 'vatNumber' ? selectedCompany.vatNumber :
                       'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collaborator Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Sélection du collaborateur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="collaborator-select">Collaborateur *</Label>
            <Select 
              value={formData.collaboratorId} 
              onValueChange={handleCollaboratorChange}
              disabled={!formData.companyId}
            >
              <SelectTrigger id="collaborator-select">
                <SelectValue placeholder={
                  !formData.companyId 
                    ? "Sélectionnez d'abord une entreprise" 
                    : "Sélectionnez un collaborateur"
                } />
              </SelectTrigger>
              <SelectContent>
                {filteredCollaborators.map((collaborator) => (
                  <SelectItem key={collaborator.id} value={collaborator.id}>
                    <div>
                      <div className="font-medium">
                        {collaborator.firstName} {collaborator.lastName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {collaborator.jobFunction} | {collaborator.nationalNumber}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCollaborator && getCollaboratorFields().length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Données du collaborateur qui seront utilisées :</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {getCollaboratorFields().map((field) => (
                  <div key={field.name}>
                    <span className="text-green-700 font-medium">{field.displayName}:</span>
                    <span className="ml-1 text-green-600">
                      {field.field === 'firstName' ? selectedCollaborator.firstName :
                       field.field === 'lastName' ? selectedCollaborator.lastName :
                       field.field === 'jobFunction' ? selectedCollaborator.jobFunction :
                       field.field === 'nationalNumber' ? selectedCollaborator.nationalNumber :
                       field.field === 'nationality' ? selectedCollaborator.nationality :
                       field.field === 'birthDate' ? selectedCollaborator.birthDate :
                       field.field === 'birthPlace' ? selectedCollaborator.birthPlace :
                       field.field === 'salary' ? selectedCollaborator.salary :
                       field.field === 'address.street' ? selectedCollaborator.address?.street :
                       field.field === 'address.number' ? selectedCollaborator.address?.number :
                       field.field === 'address.postalCode' ? selectedCollaborator.address?.postalCode :
                       field.field === 'address.city' ? selectedCollaborator.address?.city :
                       'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Fields */}
      {getManualFields().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Informations complémentaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getManualFields().map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>
                    {field.displayName}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type === 'date' ? 'date' : 'text'}
                    placeholder={field.description || `Entrez ${field.displayName.toLowerCase()}`}
                    value={formData.manualFields[field.name] || ''}
                    onChange={(e) => handleManualFieldChange(field.name, e.target.value)}
                    required={field.required}
                  />
                  {field.description && (
                    <p className="text-xs text-slate-500 mt-1">{field.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Générer le document
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
