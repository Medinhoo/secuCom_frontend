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
  Download,
  Plus,
  Building2,
  Phone,
  FileCheck,
  Factory,
  Users2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { CompanyDto } from "@/types/CompanyTypes";
import { ROUTES } from "@/config/routes.config";

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
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CompanyDto | null>(null);
  const [activeTab, setActiveTab] = useState("infos");
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  
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

  const handleSave = async () => {
    if (formData && id) {
      try {
        const updatedCompany = await companyService.updateCompany(id, formData);
        setCompany(updatedCompany);
        setEditMode(false);
        toast.success("Entreprise mise à jour avec succès");
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

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
            >
              <Download className="mr-2 h-4 w-4" /> Exporter
            </Button>
          </div>
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
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
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
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="legalForm" className="text-blue-700">
                            Forme juridique
                          </Label>
                          <Input
                            id="legalForm"
                            name="legalForm"
                            value={formData.legalForm || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-blue-700">
                            Catégorie
                          </Label>
                          <Input
                            id="category"
                            name="category"
                            value={formData.category || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="activitySector"
                            className="text-blue-700"
                          >
                            Secteur d'activité
                          </Label>
                          <Input
                            id="activitySector"
                            name="activitySector"
                            value={formData.activitySector || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="jointCommittees"
                            className="text-blue-700"
                          >
                            Commissions paritaires
                          </Label>
                          <Input
                            id="jointCommittees"
                            name="jointCommittees"
                            value={formData.jointCommittees?.join(", ") || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      jointCommittees: value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                    }
                                  : null
                              );
                            }}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
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
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
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
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
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
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
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
                          <Label htmlFor="bceNumber" className="text-blue-700">
                            Numéro BCE
                          </Label>
                          <Input
                            id="bceNumber"
                            name="bceNumber"
                            value={formData.bceNumber}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
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
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vatNumber" className="text-blue-700">
                            Numéro TVA
                          </Label>
                          <Input
                            id="vatNumber"
                            name="vatNumber"
                            value={formData.vatNumber || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
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
                          <Input
                            id="workRegime"
                            name="workRegime"
                            value={formData.workRegime || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
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
                          <Input
                            id="subscriptionFormula"
                            name="subscriptionFormula"
                            value={formData.subscriptionFormula || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="declarationFrequency"
                            className="text-blue-700"
                          >
                            Fréquence de déclaration
                          </Label>
                          <Input
                            id="declarationFrequency"
                            name="declarationFrequency"
                            value={formData.declarationFrequency || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
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
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
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
            <CardContent className="p-0">
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

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-blue-700">Paramètres</CardTitle>
                  <CardDescription>Paramètres de l'entreprie</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer l'entreprie
                </Button>
              </div>
            </CardContent>
          </Card>
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
    </>
  );
}
