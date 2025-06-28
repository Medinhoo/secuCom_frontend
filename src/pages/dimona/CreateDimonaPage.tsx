import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { PageHeader } from "@/components/layout/PageHeader";

import { dimonaService } from "@/services/api/dimonaService";
import { companyService } from "@/services/api/companyService";
import { collaboratorService } from "@/services/api/collaboratorService";
import { CreateDimonaRequest, DimonaType } from "@/types/DimonaTypes";
import type { CompanyDto } from "@/types/CompanyTypes";
import type { Collaborator } from "@/types/CollaboratorTypes";
import { ROUTES } from "@/config/routes.config";
import { useAuth } from "@/context/AuthContext";

export function CreateDimonaPage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [filteredCollaborators, setFilteredCollaborators] = useState<Collaborator[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  const [formData, setFormData] = useState<CreateDimonaRequest>({
    type: DimonaType.IN,
    entryDate: new Date(),
    exitDate: new Date(),
    collaboratorId: "",
    companyId: "",
  });

  // Pre-fill company if user is CompanyContact
  useEffect(() => {
    if (hasRole("ROLE_COMPANY") && user?.companyId && !formData.companyId) {
      setFormData(prev => ({ ...prev, companyId: user.companyId || "" }));
    }
  }, [user, hasRole, formData.companyId]);

  // Auto-fill company when collaborator is selected
  useEffect(() => {
    if (formData.collaboratorId && !hasRole("ROLE_COMPANY")) {
      const selectedCollaborator = collaborators.find(c => c.id === formData.collaboratorId);
      if (selectedCollaborator && selectedCollaborator.companyId !== formData.companyId) {
        setFormData(prev => ({ ...prev, companyId: selectedCollaborator.companyId }));
      }
    }
  }, [formData.collaboratorId, collaborators, hasRole, formData.companyId]);

  // Filter collaborators based on selected company
  useEffect(() => {
    if (formData.companyId) {
      const filtered = collaborators.filter(c => c.companyId === formData.companyId);
      setFilteredCollaborators(filtered);
    } else {
      setFilteredCollaborators(collaborators);
    }
  }, [collaborators, formData.companyId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesData, collaboratorsData] = await Promise.all([
          companyService.getAllCompanies(),
          collaboratorService.getAllCollaborators(),
        ]);
        setCompanies(companiesData);
        setCollaborators(collaboratorsData);
        
        // If user is CompanyContact, pre-select their company
        if (hasRole("ROLE_COMPANY") && user?.companyId) {
          setFormData(prev => ({ ...prev, companyId: user.companyId || "" }));
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user, hasRole]);

  const validateDates = (entryDate: Date, exitDate: Date) => {
    const errors: {[key: string]: string} = {};
    
    if (entryDate && exitDate) {
      if (exitDate <= entryDate) {
        errors.exitDate = "La date de sortie doit être ultérieure à la date d'entrée";
      }
    }
    
    setValidationErrors(prev => ({
      ...prev,
      ...errors
    }));
    
    return Object.keys(errors).length === 0;
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Validate required fields
    if (!formData.type) errors.type = "Le type de déclaration est requis";
    if (!formData.collaboratorId) errors.collaboratorId = "Le collaborateur est requis";
    if (!formData.companyId) errors.companyId = "L'entreprise est requise";
    if (!formData.entryDate) errors.entryDate = "La date d'entrée est requise";
    if (!formData.exitDate) errors.exitDate = "La date de sortie est requise";
    
    // Validate dates
    if (formData.entryDate && formData.exitDate) {
      if (formData.exitDate <= formData.entryDate) {
        errors.exitDate = "La date de sortie doit être ultérieure à la date d'entrée";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);

    try {
      await dimonaService.createDimona(formData);
      toast.success("Déclaration Dimona créée avec succès");
      navigate(ROUTES.DIMONA);
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors de la création de la déclaration");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateDimonaRequest,
    value: string | DimonaType | Date
  ) => {
    setFormData((prev) => {
      // If company changes, clear collaborator selection
      if (field === "companyId" && value !== prev.companyId) {
        return {
          ...prev,
          companyId: value as string,
          collaboratorId: "", // Clear collaborator when company changes
        };
      }
      
      return {
        ...prev,
        [field]: value,
      };
    });

    // Clear validation errors when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }

    // Validate dates in real-time
    if (field === 'entryDate' || field === 'exitDate') {
      const entryDate = field === 'entryDate' ? value as Date : formData.entryDate;
      const exitDate = field === 'exitDate' ? value as Date : formData.exitDate;
      validateDates(entryDate, exitDate);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer une déclaration Dimona"
        description="Processus de création d'une nouvelle déclaration Dimona pour un collaborateur"
      />

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations de la déclaration</CardTitle>
            <CardDescription>
              Remplissez les informations nécessaires pour la déclaration Dimona
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Contact Alert */}
            {hasRole("ROLE_COMPANY") && user?.companyName && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  La déclaration sera automatiquement créée pour votre entreprise : <strong>{user.companyName}</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* Type */}
            <div className="space-y-3">
              <Label htmlFor="type" className="block">Type de déclaration *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleInputChange("type", value as DimonaType)
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DimonaType.IN}>Entrée</SelectItem>
                  <SelectItem value={DimonaType.OUT}>Sortie</SelectItem>
                  <SelectItem value={DimonaType.UPDATE}>
                    Modification
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="entryDate" className="block">Date d'entrée *</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={
                    new Date(formData.entryDate).toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    handleInputChange("entryDate", new Date(e.target.value))
                  }
                  className={`bg-white ${validationErrors.entryDate ? 'border-red-500' : ''}`}
                  required
                />
                {validationErrors.entryDate && (
                  <p className="text-sm text-red-600">{validationErrors.entryDate}</p>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor="exitDate" className="block">Date de sortie *</Label>
                <Input
                  id="exitDate"
                  type="date"
                  value={
                    new Date(formData.exitDate).toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    handleInputChange("exitDate", new Date(e.target.value))
                  }
                  className={`bg-white ${validationErrors.exitDate ? 'border-red-500' : ''}`}
                  required
                />
                {validationErrors.exitDate && (
                  <p className="text-sm text-red-600">{validationErrors.exitDate}</p>
                )}
              </div>
            </div>

            {/* Exit Reason (only for OUT type) */}
            {formData.type === DimonaType.OUT && (
              <div className="space-y-3">
                <Label htmlFor="exitReason" className="block">Raison de sortie</Label>
                <Input
                  id="exitReason"
                  value={formData.exitReason || ""}
                  onChange={(e) =>
                    handleInputChange("exitReason", e.target.value)
                  }
                  className="bg-white"
                  placeholder="Raison de la sortie"
                />
              </div>
            )}

            {/* Collaborator and Company Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="companyId" className="block">
                  Entreprise *
                  {hasRole("ROLE_COMPANY") && (
                    <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
                  )}
                </Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) =>
                    handleInputChange("companyId", value)
                  }
                  disabled={hasRole("ROLE_COMPANY")}
                >
                  <SelectTrigger className={`${hasRole("ROLE_COMPANY") || formData.collaboratorId ? "bg-gray-50" : "bg-white"}`}>
                    <SelectValue placeholder="Sélectionnez une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasRole("ROLE_COMPANY") && (
                  <p className="text-sm text-blue-600">Entreprise automatiquement sélectionnée</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="collaboratorId" className="block">Collaborateur *</Label>
                <Select
                  value={formData.collaboratorId}
                  onValueChange={(value) =>
                    handleInputChange("collaboratorId", value)
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Sélectionnez un collaborateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCollaborators.map((collaborator) => (
                      <SelectItem key={collaborator.id} value={collaborator.id}>
                        {collaborator.firstName} {collaborator.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasRole("ROLE_COMPANY") && filteredCollaborators.length === 0 && formData.companyId && (
                  <p className="text-sm text-orange-600">Aucun collaborateur trouvé pour votre entreprise</p>
                )}
                {hasRole("ROLE_COMPANY") && filteredCollaborators.length > 0 && (
                  <p className="text-sm text-green-600">
                    {filteredCollaborators.length} collaborateur(s) disponible(s) dans votre entreprise
                  </p>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => navigate(ROUTES.DIMONA)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Annuler
          </Button>

          <Button 
            type="submit"
            disabled={loading || !formData.companyId || !formData.collaboratorId}
          >
            {loading ? "Création en cours..." : "Créer la déclaration"}
          </Button>
        </div>
      </form>
    </div>
  );
}
