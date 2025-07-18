// src/pages/CompanyDetailsPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { collaboratorService } from "@/services/api/collaboratorService";
import type { Collaborator } from "@/types/CollaboratorTypes";
import { DataTable, Column } from "@/components/layout/DataTable";
import {
  Edit,
  Save,
  X,
  Users,
  FileText,
  Settings,
  Info,
  ChevronLeft,
  Trash2,
  Plus,
  Building2,
  Phone,
  FileCheck,
  Factory,
  Users2,
  Loader2,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { companyService } from "@/services/api/companyService";
import type { CompanyDto, CompanyUpdateResponse } from "@/types/CompanyTypes";
import { ROUTES } from "@/config/routes.config";
import { useAuth } from "@/context/AuthContext";
import { useCompanyValidation } from "@/hooks/useCompanyValidation";
import { ValidationError } from "@/components/common/forms";
import { CompanyLookupField } from "@/components/features/company-lookup";
import type { CompanyFormData } from "@/types/CompanyLookupTypes";
import { CompanyConfirmationBadge } from "@/components/features/company/CompanyConfirmationBadge";
import { CompanyConfirmationModal } from "@/components/features/company/CompanyConfirmationModal";
import { CompanyConfirmationHistory } from "@/components/features/company/CompanyConfirmationHistory";
import { useCompanyConfirmation } from "@/hooks/useCompanyConfirmation";

// Options for select fields
const LEGAL_FORMS = [
  "SPRL", "SA", "SRL", "SNC", "SCS", "SCRL", "ASBL", "Fondation", "GIE", "EEIG", "Autre"
];

const CATEGORIES = [
  "Micro-entreprise", "Petite entreprise", "Moyenne entreprise", "Grande entreprise"
];

const ACTIVITY_SECTORS = [
  "Construction", "Transport", "Horeca", "Commerce", "Services"
];

const JOINT_COMMITTEES = [
  "100", "102", "106", "111", "112", "116", "118", "120", "124", "140", "200", "201", "202", "209", "210", "218", "220", "224", "226"
];

const WORK_REGIMES = [
  "Temps plein", "Temps partiel", "Horaire flexible", "Télétravail", "Mixte"
];

const DECLARATION_FREQUENCIES = [
  "Mensuelle", "Trimestrielle", "Annuelle"
];

const SUBSCRIPTION_FORMULAS = [
  "Basique", "Standard", "Premium", "Enterprise"
];

// Helper function to get sector color
const getSectorLightColor = (sector: string | undefined) => {
  if (!sector) return "bg-slate-100 text-slate-700";

  const sectorColors: Record<string, string> = {
    Construction: "bg-blue-100 text-blue-700",
    Transport: "bg-green-100 text-green-700",
    Horeca: "bg-yellow-100 text-yellow-700",
    Commerce: "bg-purple-100 text-purple-700",
    Services: "bg-pink-100 text-pink-700",
  };

  return sectorColors[sector] || "bg-slate-100 text-slate-700";
};


export function CompanyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, fetchUserDetails, notifyCompanySaved } = useAuth();
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CompanyDto | null>(null);
  const [activeTab, setActiveTab] = useState("infos");
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  
  // État pour tracker les champs préremplis
  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());
  
  // État pour tracker les champs synchronisés depuis l'autre champ
  const [syncedFields, setSyncedFields] = useState<Set<string>>(new Set());
  
  // Validation hook
  const validation = useCompanyValidation(formData, company);
  
  // Company confirmation hook
  const {
    confirmCompanyData,
    loadConfirmationHistory,
    isConfirming,
    isLoadingHistory,
    confirmationHistory
  } = useCompanyConfirmation();
  
  // State for confirmation modal
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  
  // Define columns for the collaborators table
  const collaboratorColumns: Column<Collaborator>[] = [
    {
      header: "Nom",
      accessor: (collaborator) => (
        <span className="font-medium">
          {collaborator.lastName} {collaborator.firstName}
        </span>
      ),
    },
    {
      header: "Fonction",
      accessor: (collaborator) => collaborator.jobFunction || "N/A",
    },
    {
      header: "Type",
      accessor: (collaborator) => 
        collaborator.type ? (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
            {collaborator.type}
          </Badge>
        ) : (
          "N/A"
        ),
    },
    {
      header: "Date d'entrée",
      accessor: (collaborator) => 
        collaborator.serviceEntryDate
          ? new Date(collaborator.serviceEntryDate).toLocaleDateString()
          : "N/A",
    },
  ];

  // Fetch company data
  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;

      try {
        const data = await companyService.getCompanyById(id);
        setCompany(data);
        setFormData(data);
      } catch (error) {
        toast.error("Erreur lors du chargement de l'entreprise", {
          description: "Veuillez réessayer plus tard",
        });
        navigate(ROUTES.COMPANIES);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, navigate]);

  // Fetch collaborators data
  useEffect(() => {
    const fetchCollaborators = async () => {
      if (!id) return;
      
      setLoadingCollaborators(true);
      try {
        const companyCollaborators = await collaboratorService.getCollaboratorsByCompany(id);
        setCollaborators(companyCollaborators);
      } catch (error) {
        toast.error("Erreur lors du chargement des collaborateurs", {
          description: "Veuillez réessayer plus tard",
        });
      } finally {
        setLoadingCollaborators(false);
      }
    };

    fetchCollaborators();
  }, [id]);

  // Load confirmation history when confirmation-history tab is active
  useEffect(() => {
    if (activeTab === 'confirmation-history' && id) {
      loadConfirmationHistory(id);
    }
  }, [activeTab, id, loadConfirmationHistory]);

  // Handle company confirmation
  const handleCompanyConfirmed = async (updatedCompany: CompanyDto) => {
    setCompany(updatedCompany);
    
    // Force refresh of user details to update account restrictions
    if (user?.id) {
      await fetchUserDetails(user.id);
    }
    
    toast.success("Données d'entreprise confirmées avec succès");
  };

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin text-blue-600">
          <Loader2 className="h-8 w-8" />
        </div>
      </div>
    );
  }

  if (!company || !formData) {
    return <div className="p-8 text-center">Entreprise non trouvée</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => 
      prev ? {
        ...prev,
        address: {
          street: prev.address?.street || "",
          number: prev.address?.number || "",
          box: prev.address?.box || "",
          postalCode: prev.address?.postalCode || "",
          city: prev.address?.city || "",
          country: prev.address?.country || "",
          ...prev.address,
          [name]: value
        }
      } : null
    );
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async () => {
    if (formData && id) {
      // Vérifier s'il y a des erreurs de validation (format, unicité, etc.)
      const hasValidationErrors = Object.keys(validation.errors).length > 0 || 
                                  Object.values(validation.validating).some(Boolean);
      
      if (hasValidationErrors) {
        toast.error("Erreurs de validation détectées", {
          description: "Veuillez corriger les erreurs avant de sauvegarder"
        });
        return;
      }
      
      // Pour les utilisateurs ROLE_COMPANY : vérifier si les champs obligatoires sont complétés
      if (user?.roles?.includes("ROLE_COMPANY")) {
        const { isComplete } = validation.checkMandatoryFields(formData);
        
        if (isComplete) {
          // Si tous les champs obligatoires sont complétés, afficher la modal de confirmation
          setIsConfirmationModalOpen(true);
          return;
        } else {
          // Si des champs obligatoires manquent, sauvegarder directement sans modal
          await performSave();
          return;
        }
      }
      
      // Pour les autres rôles : sauvegarde directe
      await performSave();
    }
  };

  const performSave = async () => {
    if (formData && id) {
      try {
        // Notify AuthContext to suppress the company data required modal temporarily
        notifyCompanySaved();
        
        const response = await companyService.updateCompany(id, formData);
        
        // Au lieu de faire confiance à la réponse, récupérer les données fraîches
        // pour s'assurer que l'état local reflète l'état réel de la base de données
        const freshCompanyData = await companyService.getCompanyById(id);
        setCompany(freshCompanyData);
        setFormData(freshCompanyData);
        setEditMode(false);
        
        // Réinitialiser les champs préremplis après la sauvegarde
        setPrefilledFields(new Set());
        
        toast.success("Entreprise mise à jour avec succès");
        
        // Re-fetch user details if this is the user's company to detect status changes
        if (user?.companyId === id && user?.id) {
          await fetchUserDetails(user.id);
        }
      } catch (error) {
        toast.error("Erreur lors de la mise à jour de l'entreprise", {
          description: "Veuillez réessayer plus tard",
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await companyService.deleteCompany(id);
      toast.success("Entreprise supprimée avec succès");
      navigate(ROUTES.COMPANIES);
    } catch (error) {
      toast.error("Échec de la suppression de l'entreprise");
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCancel = () => {
    setFormData(company);
    setEditMode(false);
  };

  const handleCompanyLookupConfirmed = (lookupData: CompanyFormData) => {
    if (!formData) return;

    // Tracker les champs préremplis
    const newPrefilledFields = new Set<string>();
    const newSyncedFields = new Set<string>();
    
    // Ajouter les champs qui seront préremplis
    if (lookupData.name) newPrefilledFields.add('name');
    if (lookupData.companyName) newPrefilledFields.add('companyName');
    if (lookupData.legalForm) newPrefilledFields.add('legalForm');
    if (lookupData.bceNumber) {
      newPrefilledFields.add('bceNumber');
      // Le numéro TVA est automatiquement généré à partir du BCE
      newPrefilledFields.add('vatNumber');
      // Marquer le champ TVA comme synchronisé depuis BCE
      newSyncedFields.add('vatNumber');
    }
    if (lookupData.email) newPrefilledFields.add('email');
    if (lookupData.phoneNumber) newPrefilledFields.add('phoneNumber');
    if (lookupData.street) newPrefilledFields.add('street');
    if (lookupData.number) newPrefilledFields.add('number');
    if (lookupData.postalCode) newPrefilledFields.add('postalCode');
    if (lookupData.city) newPrefilledFields.add('city');
    if (lookupData.creationDate) newPrefilledFields.add('creationDate');

    setPrefilledFields(newPrefilledFields);
    setSyncedFields(newSyncedFields);

    // Pré-remplir les champs avec les données du lookup
    setFormData(prev => prev ? {
      ...prev,
      name: lookupData.name,
      companyName: lookupData.companyName,
      legalForm: lookupData.legalForm,
      bceNumber: lookupData.bceNumber,
      vatNumber: lookupData.bceNumber ? `BE${lookupData.bceNumber}` : prev.vatNumber,
      email: lookupData.email || prev.email,
      phoneNumber: lookupData.phoneNumber || prev.phoneNumber,
      address: {
        street: lookupData.street,
        number: lookupData.number,
        box: prev.address?.box || "",
        postalCode: lookupData.postalCode,
        city: lookupData.city,
        country: prev.address?.country || "Belgique",
      },
      creationDate: lookupData.creationDate ? new Date(lookupData.creationDate) : prev.creationDate,
    } : null);

    toast.success("Données pré-remplies avec succès", {
      description: "Les informations de l'entreprise ont été mises à jour"
    });
  };

  const handleSyncField = (field: string, value: string) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleRemoveFromPrefilled = (field: string) => {
    setPrefilledFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  };

  // Fonction utilitaire pour déterminer si un champ est prérempli
  const getInputClassName = (fieldName: string) => {
    const baseClasses = "border-slate-200 focus-visible:ring-blue-500";
    const prefilledClasses = "bg-green-50 border-green-300 focus-visible:ring-green-500";
    
    return prefilledFields.has(fieldName) 
      ? `${baseClasses} ${prefilledClasses}` 
      : baseClasses;
  };

  // Fonction utilitaire pour les Select préremplis
  const getSelectClassName = (fieldName: string) => {
    const baseClasses = "border-slate-200 focus:ring-blue-500";
    const prefilledClasses = "bg-green-50 border-green-300 focus:ring-green-500";
    
    return prefilledFields.has(fieldName) 
      ? `${baseClasses} ${prefilledClasses}` 
      : baseClasses;
  };

  return (
    <>
      <div className="w-full">
        {/* Header section */}
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(ROUTES.COMPANIES)}
                className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight text-blue-700">
                {company.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`${getSectorLightColor(
                  company.activitySector
                )} mr-2`}
              >
                {company.activitySector || "N/A"}
              </Badge>
              <CompanyConfirmationBadge 
                company={company}
                className="text-xs"
              />
              <span className="text-sm text-slate-500">
                BCE: {company.bceNumber}
              </span>
              {company.vatNumber && (
                <span className="text-sm text-slate-500">
                  TVA: {company.vatNumber}
                </span>
              )}
            </div>
          </div>

          {/* Bouton de confirmation pour les utilisateurs COMPANY */}
          {user?.roles?.includes("ROLE_COMPANY") && 
           user?.companyId === company.id && 
           !company.companyConfirmed && 
           validation.checkMandatoryFields(company).isComplete && (
            <div className="flex items-center">
              <Button
                onClick={() => setIsConfirmationModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Confirmation...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Confirmer les données
                  </div>
                )}
              </Button>
            </div>
          )}

        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white p-1 rounded-lg mb-4 shadow-sm">
          <TabsTrigger
            value="infos"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Info className="h-4 w-4 mr-2" /> Informations
          </TabsTrigger>
          <TabsTrigger
            value="personnel"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Users className="h-4 w-4 mr-2" /> Personnel
            <Badge
              variant="secondary"
              className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              {collaborators.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" /> Documents
            <Badge
              variant="secondary"
              className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              0
            </Badge>
          </TabsTrigger>
          {/* Historique de confirmation tab - Only for SECRETARIAT/ADMIN */}
          {(user?.roles?.includes('ROLE_SECRETARIAT') || user?.roles?.includes('ROLE_ADMIN')) && (
            <TabsTrigger
              value="confirmation-history"
              className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <FileCheck className="h-4 w-4 mr-2" /> Historique de confirmation
            </TabsTrigger>
          )}
          <TabsTrigger
            value="settings"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Settings className="h-4 w-4 mr-2" /> Paramètres
          </TabsTrigger>
        </TabsList>

        {/* Infos Tab */}
        <TabsContent value="infos">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-blue-700">
                    Informations de l'entreprise
                  </CardTitle>
                  <CardDescription>
                    Détails et coordonnées de l'entreprise
                  </CardDescription>
                </div>
                {!editMode ? (
                  <Button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    <Edit className="mr-2 h-4 w-4" /> Modifier
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      disabled={Object.values(validation.validating).some(Boolean)}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="mr-2 h-4 w-4" /> Enregistrer
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="bg-white text-red-600 border-red-200 hover:bg-red-50 shadow-sm"
                    >
                      <X className="mr-2 h-4 w-4" /> Annuler
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {editMode ? (
                  // Edit form
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {/* Basic Information */}
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <Building2 className="h-5 w-5" /> Informations de base
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-blue-700">
                            Nom de l'entrepries
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={getInputClassName("name")}
                          />
                          <ValidationError error={validation.errors.name} />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="companyName"
                            className="text-blue-700"
                          >
                            Dénomination sociale
                          </Label>
                          <Input
                            id="companyName"
                            name="companyName"
                            value={formData.companyName || ""}
                            onChange={handleInputChange}
                            className={getInputClassName("companyName")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="legalForm" className="text-blue-700">
                            Forme juridique
                          </Label>
                          <Select
                            value={formData.legalForm || ""}
                            onValueChange={(value) => handleSelectChange("legalForm", value)}
                          >
                            <SelectTrigger className={getSelectClassName("legalForm")}>
                              <SelectValue placeholder="Sélectionnez une forme juridique" />
                            </SelectTrigger>
                            <SelectContent>
                              {LEGAL_FORMS.map((form) => (
                                <SelectItem key={form} value={form}>
                                  {form}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <ValidationError error={validation.errors.legalForm} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-blue-700">
                            Catégorie
                          </Label>
                          <Select
                            value={formData.category || ""}
                            onValueChange={(value) => handleSelectChange("category", value)}
                          >
                            <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="activitySector"
                            className="text-blue-700"
                          >
                            Secteur d'activité
                          </Label>
                          <Select
                            value={formData.activitySector || ""}
                            onValueChange={(value) => handleSelectChange("activitySector", value)}
                          >
                            <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                              <SelectValue placeholder="Sélectionnez un secteur d'activité" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACTIVITY_SECTORS.map((sector) => (
                                <SelectItem key={sector} value={sector}>
                                  {sector}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <ValidationError error={validation.errors.activitySector} />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="jointCommittees"
                            className="text-blue-700"
                          >
                            Commissions paritaires
                          </Label>
                          <Select
                            value={formData.jointCommittees?.[0] || ""}
                            onValueChange={(value) => {
                              setFormData((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      jointCommittees: value ? [value] : [],
                                    }
                                  : null
                              );
                            }}
                          >
                            <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                              <SelectValue placeholder="Sélectionnez une commission paritaire" />
                            </SelectTrigger>
                            <SelectContent>
                              {JOINT_COMMITTEES.map((committee) => (
                                <SelectItem key={committee} value={committee}>
                                  {committee}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <ValidationError error={validation.errors.jointCommittees} />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="creationDate"
                            className="text-blue-700"
                          >
                            Date de création
                          </Label>
                          <Input
                            id="creationDate"
                            name="creationDate"
                            type="date"
                            value={
                              formData.creationDate
                                ? new Date(formData.creationDate)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                            onChange={handleInputChange}
                            className={getInputClassName("creationDate")}
                          />
                          <ValidationError error={validation.errors.creationDate} />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="collaborationStartDate"
                            className="text-blue-700"
                          >
                            Date de début de collaboration
                          </Label>
                          <Input
                            id="collaborationStartDate"
                            name="collaborationStartDate"
                            type="date"
                            value={
                              formData.collaborationStartDate
                                ? new Date(formData.collaborationStartDate)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                          <ValidationError error={validation.errors.collaborationStartDate} />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <Phone className="h-5 w-5" /> Coordonnées
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-blue-700">
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={handleInputChange}
                            className={getInputClassName("email")}
                          />
                          <ValidationError error={validation.errors.email} />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="phoneNumber"
                            className="text-blue-700"
                          >
                            Numéro de téléphone
                          </Label>
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber || ""}
                            onChange={handleInputChange}
                            className={getInputClassName("phoneNumber")}
                          />
                          <ValidationError error={validation.errors.phoneNumber} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="IBAN" className="text-blue-700">
                            IBAN
                          </Label>
                          <Input
                            id="IBAN"
                            name="iban"
                            value={formData.iban || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                          <ValidationError error={validation.errors.iban} />
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> Adresse
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="street" className="text-blue-700">
                            Rue
                          </Label>
                          <Input
                            id="street"
                            name="street"
                            value={formData.address?.street || ""}
                            onChange={handleAddressChange}
                            className={getInputClassName("street")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="number" className="text-blue-700">
                            Numéro
                          </Label>
                          <Input
                            id="number"
                            name="number"
                            value={formData.address?.number || ""}
                            onChange={handleAddressChange}
                            className={getInputClassName("number")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="box" className="text-blue-700">
                            Boîte (optionnel)
                          </Label>
                          <Input
                            id="box"
                            name="box"
                            value={formData.address?.box || ""}
                            onChange={handleAddressChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode" className="text-blue-700">
                            Code postal
                          </Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            value={formData.address?.postalCode || ""}
                            onChange={handleAddressChange}
                            className={getInputClassName("postalCode")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-blue-700">
                            Ville
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.address?.city || ""}
                            onChange={handleAddressChange}
                            className={getInputClassName("city")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-blue-700">
                            Pays
                          </Label>
                          <Input
                            id="country"
                            name="country"
                            value={formData.address?.country || ""}
                            onChange={handleAddressChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Registration Numbers */}
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <FileCheck className="h-5 w-5" /> Numéros
                        d'enregistrement
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <div className="space-y-2">
                          <CompanyLookupField
                            type="bce"
                            value={formData.bceNumber}
                            onChange={(value) => setFormData(prev => prev ? { ...prev, bceNumber: value } : null)}
                            onDataConfirmed={handleCompanyLookupConfirmed}
                            onSyncField={handleSyncField}
                            onRemoveFromPrefilled={handleRemoveFromPrefilled}
                            isSyncedFromOtherField={syncedFields.has('bceNumber')}
                            placeholder="Ex: 0751.606.280"
                            isPrefilledField={prefilledFields.has('bceNumber')}
                          />
                          <ValidationError 
                            error={validation.errors.bceNumber} 
                            isValidating={validation.validating.bceNumber}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="onssNumber" className="text-blue-700">
                            Numéro ONSS
                          </Label>
                          <Input
                            id="onssNumber"
                            name="onssNumber"
                            value={formData.onssNumber}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                          <ValidationError 
                            error={validation.errors.onssNumber} 
                            isValidating={validation.validating.onssNumber}
                          />
                        </div>
                        <div className="space-y-2">
                          <CompanyLookupField
                            type="vat"
                            value={formData.vatNumber || ""}
                            onChange={(value) => setFormData(prev => prev ? { ...prev, vatNumber: value } : null)}
                            onDataConfirmed={handleCompanyLookupConfirmed}
                            onSyncField={handleSyncField}
                            onRemoveFromPrefilled={handleRemoveFromPrefilled}
                            isSyncedFromOtherField={syncedFields.has('vatNumber')}
                            placeholder="Ex: BE0751.606.280"
                            isPrefilledField={prefilledFields.has('vatNumber')}
                          />
                          <ValidationError 
                            error={validation.errors.vatNumber} 
                            isValidating={validation.validating.vatNumber}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Business Operations */}
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <Factory className="h-5 w-5" /> Opérations commerciales
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="securityFund"
                            className="text-blue-700"
                          >
                            Fonds de sécurité
                          </Label>
                          <Input
                            id="securityFund"
                            name="securityFund"
                            value={formData.securityFund || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="workAccidentInsurance"
                            className="text-blue-700"
                          >
                            Assurance accidents du travail
                          </Label>
                          <Input
                            id="workAccidentInsurance"
                            name="workAccidentInsurance"
                            value={formData.workAccidentInsurance || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workRegime" className="text-blue-700">
                            Régime de travail
                          </Label>
                          <Select
                            value={formData.workRegime || ""}
                            onValueChange={(value) => handleSelectChange("workRegime", value)}
                          >
                            <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                              <SelectValue placeholder="Sélectionnez un régime de travail" />
                            </SelectTrigger>
                            <SelectContent>
                              {WORK_REGIMES.map((regime) => (
                                <SelectItem key={regime} value={regime}>
                                  {regime}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="workCalendar"
                            className="text-blue-700"
                          >
                            Calendrier de travail
                          </Label>
                          <Input
                            id="workCalendar"
                            name="workCalendar"
                            value={formData.workCalendar || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Collaboration Details */}
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <Users2 className="h-5 w-5" /> Détails de collaboration
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="subscriptionFormula"
                            className="text-blue-700"
                          >
                            Formule d'abonnement
                          </Label>
                          <Select
                            value={formData.subscriptionFormula || ""}
                            onValueChange={(value) => handleSelectChange("subscriptionFormula", value)}
                          >
                            <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                              <SelectValue placeholder="Sélectionnez une formule d'abonnement" />
                            </SelectTrigger>
                            <SelectContent>
                              {SUBSCRIPTION_FORMULAS.map((formula) => (
                                <SelectItem key={formula} value={formula}>
                                  {formula}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="declarationFrequency"
                            className="text-blue-700"
                          >
                            Fréquence de déclaration
                          </Label>
                          <Select
                            value={formData.declarationFrequency || ""}
                            onValueChange={(value) => handleSelectChange("declarationFrequency", value)}
                          >
                            <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                              <SelectValue placeholder="Sélectionnez une fréquence de déclaration" />
                            </SelectTrigger>
                            <SelectContent>
                              {DECLARATION_FREQUENCIES.map((frequency) => (
                                <SelectItem key={frequency} value={frequency}>
                                  {frequency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="salaryReduction"
                            className="text-blue-700"
                          >
                            Réduction salariale
                          </Label>
                          <Input
                            id="salaryReduction"
                            name="salaryReduction"
                            value={formData.salaryReduction || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Display info
                  <div className="space-y-8">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <Building2 className="h-5 w-5" /> Informations de base
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Nom de l'entreprise
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.name}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Dénomination sociale
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.companyName || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Forme juridique
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.legalForm || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Catégorie
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.category || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Secteur d'activité
                          </h4>
                          <p className="text-lg text-slate-800">
                            <Badge
                              className={`${getSectorLightColor(
                                company.activitySector
                              )}`}
                            >
                              {company.activitySector || "N/A"}
                            </Badge>
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Commissions paritaires
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.jointCommittees?.join(", ") || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Date de création
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.creationDate
                              ? new Date(
                                  company.creationDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Date de début de collaboration
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.collaborationStartDate
                              ? new Date(
                                  company.collaborationStartDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <Phone className="h-5 w-5" /> Coordonnées
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Email
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.email || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Numéro de téléphone
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.phoneNumber || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            IBAN
                          </h4>
                          <p className="text-lg font-mono text-slate-800">
                            {company.iban || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> Adresse
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-1">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Adresse complète
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.address ? (
                              <>
                                {company.address.number} {company.address.street}
                                {company.address.box && `, Boîte ${company.address.box}`}
                                <br />
                                {company.address.postalCode} {company.address.city}
                                <br />
                                {company.address.country}
                              </>
                            ) : (
                              "N/A"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Registration Numbers */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <FileCheck className="h-5 w-5" /> Numéros
                        d'enregistrement
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Numéro BCE
                          </h4>
                          <p className="text-lg font-mono text-slate-800">
                            {company.bceNumber}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Numéro ONSS
                          </h4>
                          <p className="text-lg font-mono text-slate-800">
                            {company.onssNumber || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Numéro TVA
                          </h4>
                          <p className="text-lg font-mono text-slate-800">
                            {company.vatNumber || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Business Operations */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <Factory className="h-5 w-5" /> Opérations commerciales
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Fonds de sécurité
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.securityFund || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Assurance accidents du travail
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.workAccidentInsurance || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Régime de travail
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.workRegime || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Calendrier de travail
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.workCalendar || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Collaboration Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <Users2 className="h-5 w-5" /> Détails de collaboration
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Formule d'abonnement
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.subscriptionFormula || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Fréquence de déclaration
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.declarationFrequency || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 mb-1">
                            Réduction salariale
                          </h4>
                          <p className="text-lg text-slate-800">
                            {company.salaryReduction || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personnel Tab */}
        <TabsContent value="personnel">
          <Card className="pb-0 border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className=" border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-blue-700">Personnel</CardTitle>
                  <CardDescription>
                    Liste du personnel de l'entreprise
                  </CardDescription>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  asChild
                >
                  <Link to={ROUTES.COLLABORATOR_CREATE}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter un collaborateur
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <DataTable
                data={collaborators}
                columns={collaboratorColumns}
                loading={loadingCollaborators}
                detailsRoute={(collaboratorId) => ROUTES.COLLABORATOR_DETAILS(collaboratorId)}
                emptyStateMessage={{
                  title: "Aucun personnel enregistré",
                  description: "Ajoutez des collaborateurs à cette entreprise"
                }}
                detailsButtonLabel="Voir détails"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-blue-700">Documents</CardTitle>
                  <CardDescription>Documents de l'entreprise</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-500"
                    >
                      Aucun document
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confirmation History Tab - Only for SECRETARIAT/ADMIN */}
        {(user?.roles?.includes('ROLE_SECRETARIAT') || user?.roles?.includes('ROLE_ADMIN')) && (
          <TabsContent value="confirmation-history">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div>
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Historique des confirmations
                  </CardTitle>
                  <CardDescription>
                    Historique complet des confirmations de données d'entreprise
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CompanyConfirmationHistory 
                  companyId={id || ''}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            {/* Danger Zone */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div>
                  <CardTitle className="text-red-700">Zone de danger</CardTitle>
                  <CardDescription>
                    Actions irréversibles sur l'entreprise
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer l'entreprise
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'entreprie</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette entreprie ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Confirmation Modal */}
      <CompanyConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirmed={handleCompanyConfirmed}
        company={company}
        onSaveAndConfirm={editMode ? performSave : undefined}
        formData={formData}
      />
    </>
  );
}
