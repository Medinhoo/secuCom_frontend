// src/pages/PersonnelDetailsPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Edit,
  Save,
  X,
  FileText,
  Settings,
  Info,
  ChevronLeft,
  Trash2,
  Building,
  Calendar,
  Download,
  Plus,
  Mail,
  Phone,
  MapPin,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import { collaboratorService } from "@/services/api/collaboratorService";
import { companyService } from "@/services/api/companyService";
import {
  Collaborator,
  CollaboratorType,
  WorkDurationType,
} from "@/types/CollaboratorTypes";
import { CompanyDto } from "@/types/CompanyTypes";
import { toast } from "sonner";

// Temporary mock data for documents and calendar until API endpoints are available
import {
  demoEmployeeDocuments,
  demoCalendarData,
  statusLabels,
  statusColors,
  WorkStatus,
  CalendarDay,
} from "@/data/mockData";

// Calendar helper function
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Calendar Component
const PrestationsCalendar = ({ employeeId }: { employeeId: string }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());

  const calendarData = demoCalendarData[employeeId] || [];

  // Get employee calendar data for selected month/year
  const filteredData = calendarData.filter((day) => {
    const date = new Date(day.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  // Create a map for quick lookup
  const dateStatusMap = new Map<number, CalendarDay>();
  filteredData.forEach((day) => {
    const date = new Date(day.date);
    dateStatusMap.set(date.getDate(), day);
  });

  // Calculate statistics
  const statusCounts = filteredData.reduce<Record<WorkStatus, number>>(
    (acc, day) => {
      acc[day.status] = (acc[day.status] || 0) + 1;
      return acc;
    },
    {} as Record<WorkStatus, number>
  );

  // Generate days of the month
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = [];

  // Handle month navigation
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Add leading empty cells for the first week
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(
      <div key={`empty-${i}`} className="h-12 border border-slate-100"></div>
    );
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = dateStatusMap.get(day);
    const status = dayData?.status || WorkStatus.WORKING_DAY;
    const statusColorClass = statusColors[status];

    days.push(
      <TooltipProvider key={`day-${day}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`h-12 border border-slate-200 flex flex-col justify-between p-1 relative hover:border-blue-300 transition-colors ${statusColorClass}`}
            >
              <span className="text-xs font-semibold">{day}</span>
              {dayData?.hours && (
                <span className="text-xs text-slate-600">{dayData.hours}h</span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusLabels[status]}</p>
            {dayData?.hours && <p>{dayData.hours} heures</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  return (
    <Card className="border-0 shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-blue-700">
              Calendrier des prestations
            </CardTitle>
            <CardDescription>
              Suivi de la présence et des congés
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevMonth}
              className="border-slate-200 hover:bg-blue-50 hover:text-blue-700"
            >
              &lt;
            </Button>
            <div className="flex items-center space-x-2">
              <Select
                value={month.toString()}
                onValueChange={(value) => setMonth(parseInt(value))}
              >
                <SelectTrigger className="w-32 border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Mois" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={year.toString()}
                onValueChange={(value) => setYear(parseInt(value))}
              >
                <SelectTrigger className="w-24 border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => year - 2 + i).map(
                    (y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="border-slate-200 hover:bg-blue-50 hover:text-blue-700"
            >
              &gt;
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(WorkStatus).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <div
                className={`w-4 h-4 rounded mr-1 ${statusColors[value]}`}
              ></div>
              <span className="text-xs text-slate-700">
                {statusLabels[value]}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-7 gap-px">
            <div className="text-center font-medium text-xs p-1 text-blue-700">
              Lun
            </div>
            <div className="text-center font-medium text-xs p-1 text-blue-700">
              Mar
            </div>
            <div className="text-center font-medium text-xs p-1 text-blue-700">
              Mer
            </div>
            <div className="text-center font-medium text-xs p-1 text-blue-700">
              Jeu
            </div>
            <div className="text-center font-medium text-xs p-1 text-blue-700">
              Ven
            </div>
            <div className="text-center font-medium text-xs p-1 text-blue-700">
              Sam
            </div>
            <div className="text-center font-medium text-xs p-1 text-blue-700">
              Dim
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px">{days}</div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2 text-blue-700">
            Récapitulatif du mois
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-blue-600">
                  {statusLabels[status as WorkStatus]}
                </div>
                <div className="text-lg font-semibold text-slate-800">
                  {count} {count > 1 ? "jours" : "jour"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main component
export function CollaboratorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Collaborator | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("infos");

  const documents = id ? demoEmployeeDocuments[id] || [] : [];

  const fetchCompanyData = useCallback(async (companyId: string) => {
    try {
      const companyData = await companyService.getCompanyById(companyId);
      setCompany(companyData);
    } catch (error) {
      console.error("Failed to fetch company data:", error);
      toast.error("Échec du chargement des données de l'entreprise");
    }
  }, []);

  // Charger les données du collaborateur et de l'entreprise
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await collaboratorService.getCollaboratorById(id);
          if (!response) {
            throw new Error("Collaborateur non trouvé");
          }
          setCollaborator(response);
          setFormData(response);

          if (response.companyId) {
            await fetchCompanyData(response.companyId);
          }
        } catch (error) {
          toast.error("Échec du chargement du collaborateur");
          console.error(error);
          navigate("/personnel");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id, navigate, fetchCompanyData]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-slate-500">Chargement du collaborateur...</p>
        </div>
      </div>
    );
  }

  if (!collaborator || !formData) {
    return <div className="p-8 text-center">Collaborateur non trouvé</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async () => {
    if (formData) {
      try {
        const response = await collaboratorService.updateCollaborator(
          formData.id,
          formData
        );
        setCollaborator(response);
        setEditMode(false);
        toast.success("Collaborateur mis à jour avec succès");
      } catch (error) {
        toast.error("Échec de la mise à jour du collaborateur");
        console.error(error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await collaboratorService.deleteCollaborator(collaborator.id);
      toast.success("Collaborateur supprimé avec succès");
      setIsDeleteDialogOpen(false);
      navigate("/personnel");
    } catch (error) {
      toast.error("Échec de la suppression du collaborateur");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setFormData(collaborator);
    setEditMode(false);
  };

  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/collaborator")}
              className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-blue-700">
              {collaborator.firstName} {collaborator.lastName}
            </h1>
          </div>
          <div className="flex items-center">
            <Badge className="bg-blue-100 text-blue-700 mr-2">
              {collaborator.jobFunction || "Non spécifié"}
            </Badge>
            <Link
              to={`/companies/${collaborator.companyId}`}
              className="text-sm text-slate-500 hover:text-blue-600 flex items-center"
            >
              <Building className="h-3 w-3 mr-1" />
              {company?.name || collaborator.companyId}
            </Link>
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
            value="documents"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" /> Documents
            <Badge
              variant="secondary"
              className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              {documents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="prestations"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Calendar className="h-4 w-4 mr-2" /> Prestations
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
                    Informations collaborateur
                  </CardTitle>
                  <CardDescription>
                    Détails et coordonnées du collaborateur
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
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-blue-700">
                        Nom
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-blue-700">
                        Prénom
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-blue-700">
                        Type de collaborateur
                      </Label>
                      <Select
                        value={formData.type || ""}
                        onValueChange={(value) =>
                          setFormData((prev) =>
                            prev
                              ? { ...prev, type: value as CollaboratorType }
                              : null
                          )
                        }
                      >
                        <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(CollaboratorType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type === "EMPLOYEE"
                                ? "Employé"
                                : type === "WORKER"
                                ? "Ouvrier"
                                : type === "FREELANCE"
                                ? "Indépendant"
                                : type === "INTERN"
                                ? "Stagiaire"
                                : type === "STUDENT"
                                ? "Étudiant"
                                : type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobFunction" className="text-blue-700">
                        Fonction
                      </Label>
                      <Input
                        id="jobFunction"
                        name="jobFunction"
                        value={formData.jobFunction || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="serviceEntryDate"
                        className="text-blue-700"
                      >
                        Date d'entrée en service
                      </Label>
                      <Input
                        id="serviceEntryDate"
                        name="serviceEntryDate"
                        type="date"
                        value={formData.serviceEntryDate?.split("T")[0] || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality" className="text-blue-700">
                        Nationalité
                      </Label>
                      <Input
                        id="nationality"
                        name="nationality"
                        value={formData.nationality || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="text-blue-700">
                        Date de naissance
                      </Label>
                      <Input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate?.split("T")[0] || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthPlace" className="text-blue-700">
                        Lieu de naissance
                      </Label>
                      <Input
                        id="birthPlace"
                        name="birthPlace"
                        value={formData.birthPlace || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-blue-700">
                        Genre
                      </Label>
                      <Select
                        value={formData.gender || ""}
                        onValueChange={(value) =>
                          setFormData((prev) =>
                            prev ? { ...prev, gender: value } : null
                          )
                        }
                      >
                        <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                          <SelectValue placeholder="Sélectionner un genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculin</SelectItem>
                          <SelectItem value="F">Féminin</SelectItem>
                          <SelectItem value="O">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-blue-700">
                        Langue
                      </Label>
                      <Select
                        value={formData.language || ""}
                        onValueChange={(value) =>
                          setFormData((prev) =>
                            prev ? { ...prev, language: value } : null
                          )
                        }
                      >
                        <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                          <SelectValue placeholder="Sélectionner une langue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FR">Français</SelectItem>
                          <SelectItem value="NL">Néerlandais</SelectItem>
                          <SelectItem value="EN">Anglais</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="civilStatus" className="text-blue-700">
                        État civil
                      </Label>
                      <Select
                        value={formData.civilStatus || ""}
                        onValueChange={(value) =>
                          setFormData((prev) =>
                            prev ? { ...prev, civilStatus: value } : null
                          )
                        }
                      >
                        <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                          <SelectValue placeholder="Sélectionner un état civil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SINGLE">Célibataire</SelectItem>
                          <SelectItem value="MARRIED">Marié(e)</SelectItem>
                          <SelectItem value="DIVORCED">Divorcé(e)</SelectItem>
                          <SelectItem value="WIDOWED">Veuf/Veuve</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="civilStatusDate"
                        className="text-blue-700"
                      >
                        Date de l'état civil
                      </Label>
                      <Input
                        id="civilStatusDate"
                        name="civilStatusDate"
                        type="date"
                        value={formData.civilStatusDate?.split("T")[0] || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnerName" className="text-blue-700">
                        Nom du partenaire
                      </Label>
                      <Input
                        id="partnerName"
                        name="partnerName"
                        value={formData.partnerName || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="partnerBirthDate"
                        className="text-blue-700"
                      >
                        Date de naissance du partenaire
                      </Label>
                      <Input
                        id="partnerBirthDate"
                        name="partnerBirthDate"
                        type="date"
                        value={formData.partnerBirthDate?.split("T")[0] || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationalNumber" className="text-blue-700">
                        Numéro national
                      </Label>
                      <Input
                        id="nationalNumber"
                        name="nationalNumber"
                        value={formData.nationalNumber || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    {(formData.type === "EMPLOYEE" ||
                      formData.type === "WORKER") && (
                      <>
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
                            htmlFor="workDurationType"
                            className="text-blue-700"
                          >
                            Type de durée
                          </Label>
                          <Select
                            value={formData.workDurationType || ""}
                            onValueChange={(value) =>
                              setFormData((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      workDurationType:
                                        value as WorkDurationType,
                                    }
                                  : null
                              )
                            }
                          >
                            <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(WorkDurationType).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type === "FIXED" ? "Fixe" : "Variable"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    {formData.type === "FREELANCE" && (
                      <>
                        <div className="space-y-2">
                          <Label
                            htmlFor="contractType"
                            className="text-blue-700"
                          >
                            Type de contrat
                          </Label>
                          <Input
                            id="contractType"
                            name="contractType"
                            value={formData.contractType || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="taskDescription"
                            className="text-blue-700"
                          >
                            Description des tâches
                          </Label>
                          <Input
                            id="taskDescription"
                            name="taskDescription"
                            value={formData.taskDescription || ""}
                            onChange={handleInputChange}
                            className="border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="iban" className="text-blue-700">
                        IBAN
                      </Label>
                      <Input
                        id="iban"
                        name="iban"
                        value={formData.iban || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jointCommittee" className="text-blue-700">
                        Commission paritaire
                      </Label>
                      <Input
                        id="jointCommittee"
                        name="jointCommittee"
                        value={formData.jointCommittee || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor="extraLegalBenefits"
                        className="text-blue-700"
                      >
                        Avantages extra-légaux
                      </Label>
                      <Input
                        id="extraLegalBenefits"
                        name="extraLegalBenefits"
                        value={formData.extraLegalBenefits?.join(", ") || ""}
                        onChange={(e) =>
                          setFormData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  extraLegalBenefits: e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                }
                              : null
                          )
                        }
                        placeholder="Séparez les avantages par des virgules"
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address" className="text-blue-700">
                        Adresse personnelle
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Rue"
                          value={formData.address?.street || ""}
                          onChange={(e) =>
                            setFormData((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                address: {
                                  street: e.target.value,
                                  number: prev.address?.number || "",
                                  postalCode: prev.address?.postalCode || "",
                                  city: prev.address?.city || "",
                                  country: prev.address?.country || "",
                                },
                              };
                            })
                          }
                          className="border-slate-200 focus-visible:ring-blue-500"
                        />
                        <Input
                          placeholder="Numéro"
                          value={formData.address?.number || ""}
                          onChange={(e) =>
                            setFormData((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                address: {
                                  street: prev.address?.street || "",
                                  number: e.target.value,
                                  postalCode: prev.address?.postalCode || "",
                                  city: prev.address?.city || "",
                                  country: prev.address?.country || "",
                                },
                              };
                            })
                          }
                          className="border-slate-200 focus-visible:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Display info
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Nom
                      </h3>
                      <p className="text-lg text-slate-800">
                        {collaborator.lastName}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Prénom
                      </h3>
                      <p className="text-lg text-slate-800">
                        {collaborator.firstName}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Type
                      </h3>
                      <p className="text-lg text-slate-800">
                        <Badge
                          className={`${
                            collaborator.type === "EMPLOYEE"
                              ? "bg-green-100 text-green-700"
                              : collaborator.type === "WORKER"
                              ? "bg-blue-100 text-blue-700"
                              : collaborator.type === "FREELANCE"
                              ? "bg-purple-100 text-purple-700"
                              : collaborator.type === "INTERN"
                              ? "bg-orange-100 text-orange-700"
                              : collaborator.type === "STUDENT"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {collaborator.type || "Non spécifié"}
                        </Badge>
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Poste
                      </h3>
                      <p className="text-lg text-slate-800">
                        <Badge className="bg-blue-100 text-blue-700">
                          {collaborator.jobFunction || "Non spécifié"}
                        </Badge>
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Date d'embauche
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-lg">
                          {collaborator.serviceEntryDate?.split("T")[0] ||
                            "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Nationalité
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <span className="text-lg">
                          {collaborator.nationality || "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Date de naissance
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-lg">
                          {collaborator.birthDate?.split("T")[0] ||
                            "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Lieu de naissance
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <MapPin className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-lg">
                          {collaborator.birthPlace || "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Genre
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <span className="text-lg">
                          {collaborator.gender === "M"
                            ? "Masculin"
                            : collaborator.gender === "F"
                            ? "Féminin"
                            : collaborator.gender === "O"
                            ? "Autre"
                            : "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Langue
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <span className="text-lg">
                          {collaborator.language === "FR"
                            ? "Français"
                            : collaborator.language === "NL"
                            ? "Néerlandais"
                            : collaborator.language === "EN"
                            ? "Anglais"
                            : "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        État civil
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <span className="text-lg">
                          {collaborator.civilStatus === "SINGLE"
                            ? "Célibataire"
                            : collaborator.civilStatus === "MARRIED"
                            ? "Marié(e)"
                            : collaborator.civilStatus === "DIVORCED"
                            ? "Divorcé(e)"
                            : collaborator.civilStatus === "WIDOWED"
                            ? "Veuf/Veuve"
                            : "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Date de l'état civil
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-lg">
                          {collaborator.civilStatusDate?.split("T")[0] ||
                            "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Nom du partenaire
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <span className="text-lg">
                          {collaborator.partnerName || "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Date de naissance du partenaire
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-lg">
                          {collaborator.partnerBirthDate?.split("T")[0] ||
                            "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Numéro national
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <span className="text-lg">
                          {collaborator.nationalNumber || "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    {(collaborator.type === "EMPLOYEE" ||
                      collaborator.type === "WORKER") && (
                      <>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-600 mb-1">
                            Régime de travail
                          </h3>
                          <div className="flex items-center text-slate-800">
                            <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                            <span className="text-lg">
                              {collaborator.workRegime || "Non spécifié"}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-600 mb-1">
                            Type de durée
                          </h3>
                          <div className="flex items-center text-slate-800">
                            <Badge className="bg-blue-100 text-blue-700">
                              {collaborator.workDurationType === "FIXED"
                                ? "Fixe"
                                : collaborator.workDurationType === "VARIABLE"
                                ? "Variable"
                                : "Non spécifié"}
                            </Badge>
                          </div>
                        </div>
                      </>
                    )}
                    {collaborator.type === "FREELANCE" && (
                      <>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-600 mb-1">
                            Type de contrat
                          </h3>
                          <div className="flex items-center text-slate-800">
                            <FileText className="h-4 w-4 text-slate-400 mr-2" />
                            <span className="text-lg">
                              {collaborator.contractType || "Non spécifié"}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-600 mb-1">
                            Description des tâches
                          </h3>
                          <div className="flex items-center text-slate-800">
                            <span className="text-lg">
                              {collaborator.taskDescription || "Non spécifié"}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor="establishmentUnitAddress"
                        className="text-blue-700"
                      >
                        Adresse de l'unité d'établissement
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Rue"
                          value={
                            formData.establishmentUnitAddress?.street || ""
                          }
                          onChange={(e) =>
                            setFormData((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                establishmentUnitAddress: {
                                  ...(prev.establishmentUnitAddress || {}),
                                  street: e.target.value,
                                  number:
                                    prev.establishmentUnitAddress?.number || "",
                                  postalCode:
                                    prev.establishmentUnitAddress?.postalCode ||
                                    "",
                                  city:
                                    prev.establishmentUnitAddress?.city || "",
                                  country:
                                    prev.establishmentUnitAddress?.country ||
                                    "",
                                },
                              };
                            })
                          }
                          className="border-slate-200 focus-visible:ring-blue-500"
                        />
                        <Input
                          placeholder="Numéro"
                          value={
                            formData.establishmentUnitAddress?.number || ""
                          }
                          onChange={(e) =>
                            setFormData((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                establishmentUnitAddress: {
                                  ...(prev.establishmentUnitAddress || {}),
                                  street:
                                    prev.establishmentUnitAddress?.street || "",
                                  number: e.target.value,
                                  postalCode:
                                    prev.establishmentUnitAddress?.postalCode ||
                                    "",
                                  city:
                                    prev.establishmentUnitAddress?.city || "",
                                  country:
                                    prev.establishmentUnitAddress?.country ||
                                    "",
                                },
                              };
                            })
                          }
                          className="border-slate-200 focus-visible:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        IBAN
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <span className="text-lg">
                          {collaborator.iban || "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Commission paritaire
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <span className="text-lg">
                          {collaborator.jointCommittee || "Non spécifié"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg md:col-span-2">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Avantages extra-légaux
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {collaborator.extraLegalBenefits?.length ? (
                          collaborator.extraLegalBenefits.map(
                            (benefit, index) => (
                              <Badge
                                key={index}
                                className="bg-blue-100 text-blue-700"
                              >
                                {benefit}
                              </Badge>
                            )
                          )
                        ) : (
                          <span className="text-lg text-slate-800">
                            Non spécifié
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg md:col-span-2">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Adresse personnelle
                      </h3>
                      <div className="flex items-start text-slate-800">
                        <MapPin className="h-4 w-4 text-slate-400 mr-2 mt-1" />
                        <span className="text-lg">
                          {collaborator.address
                            ? `${collaborator.address.street} ${collaborator.address.number}, ${collaborator.address.postalCode} ${collaborator.address.city}`
                            : "Non spécifiée"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg md:col-span-2">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Adresse de l'unité d'établissement
                      </h3>
                      <div className="flex items-start text-slate-800">
                        <MapPin className="h-4 w-4 text-slate-400 mr-2 mt-1" />
                        <span className="text-lg">
                          {collaborator.establishmentUnitAddress
                            ? `${collaborator.establishmentUnitAddress.street} ${collaborator.establishmentUnitAddress.number}, ${collaborator.establishmentUnitAddress.postalCode} ${collaborator.establishmentUnitAddress.city}`
                            : "Non spécifiée"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg md:col-span-2">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Entreprise
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <Building className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-lg">
                          {company?.name || collaborator.companyId}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg flex items-center">
                      <Button
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      >
                        <Link to={`/companies/${collaborator.companyId}`}>
                          <Building className="h-4 w-4 mr-2" /> Voir
                          l'entreprise
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-blue-700">Documents</CardTitle>
                <CardDescription>
                  Documents associés à l'employé
                </CardDescription>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un document
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="text-blue-700 font-medium">
                      Nom
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      Type
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium hidden md:table-cell">
                      Date d'upload
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium hidden md:table-cell">
                      Taille
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-slate-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-10 w-10 text-slate-300 mb-2" />
                          <p>Aucun document trouvé</p>
                          <p className="text-sm text-slate-400 mt-1">
                            Commencez par ajouter un document pour ce
                            collaborateur
                          </p>
                          <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <Plus className="mr-2 h-4 w-4" /> Ajouter un
                            document
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents.map((document) => (
                      <TableRow
                        key={document.id}
                        className="hover:bg-slate-50 border-b border-slate-100 group"
                      >
                        <TableCell className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                          {document.nom}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-slate-50 text-slate-700"
                          >
                            {document.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-slate-400 mr-1" />
                            <span>{document.dateUpload}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-sm text-slate-600">
                          {document.taille}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                            >
                              Voir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prestations Tab */}
        <TabsContent value="prestations">
          {collaborator && <PrestationsCalendar employeeId={collaborator.id} />}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-blue-700">Paramètres</CardTitle>
              <CardDescription>
                Gérer les paramètres du collaborateur
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="border border-red-200 p-6 rounded-md bg-red-50">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    Zone de danger
                  </h3>
                  <p className="text-sm text-red-500 mb-4">
                    La suppression d'un collaborateur est irréversible et
                    supprimera toutes les données associées.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer le
                    collaborateur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-700">
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le collaborateur{" "}
              <strong>
                {collaborator.firstName} {collaborator.lastName}
              </strong>{" "}
              ? Cette action est irréversible et supprimera toutes les données
              associées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-white border-slate-200"
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
