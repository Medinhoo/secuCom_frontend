// src/pages/PersonnelDetailsPage.tsx
import { useState, useEffect } from "react";
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

// Import data from mockData
import {
  demoEmployees,
  demoEmployeeDocuments,
  demoCalendarData,
  statusLabels,
  statusColors,
  getCompanyById,
  WorkStatus,
  Employee,
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
export function PersonnelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("infos");

  const documents = id ? demoEmployeeDocuments[id] || [] : [];

  // Fetch employee data
  useEffect(() => {
    if (id) {
      const foundEmployee = demoEmployees.find((e) => e.id === id);
      if (foundEmployee) {
        setEmployee(foundEmployee);
        setFormData(foundEmployee);
      } else {
        // Employee not found, redirect to list
        navigate("/personnel");
      }
    }
  }, [id, navigate]);

  if (!employee || !formData) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  const getEntrepriseName = (id: string) => {
    const entreprise = getCompanyById(id);
    return entreprise ? entreprise.nom : "Inconnu";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = () => {
    if (formData) {
      setEmployee(formData);
      setEditMode(false);
      // Here you would typically save to your backend
      console.log("Saving employee:", formData);
    }
  };

  const handleDelete = () => {
    // Here you would delete from your backend
    console.log("Deleting employee:", employee.id);
    setIsDeleteDialogOpen(false);
    navigate("/personnel");
  };

  const handleCancel = () => {
    setFormData(employee);
    setEditMode(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/personnel")}
              className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-blue-700">
              {employee.prenom} {employee.nom}
            </h1>
          </div>
          <div className="flex items-center">
            <Badge className="bg-blue-100 text-blue-700 mr-2">
              {employee.poste}
            </Badge>
            <Link
              to={`/clients/${employee.entrepriseId}`}
              className="text-sm text-slate-500 hover:text-blue-600 flex items-center"
            >
              <Building className="h-3 w-3 mr-1" />
              {getEntrepriseName(employee.entrepriseId)}
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
                    Informations employé
                  </CardTitle>
                  <CardDescription>
                    Détails et coordonnées de l'employé
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
                      <Label htmlFor="nom" className="text-blue-700">
                        Nom
                      </Label>
                      <Input
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prenom" className="text-blue-700">
                        Prénom
                      </Label>
                      <Input
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="poste" className="text-blue-700">
                        Poste
                      </Label>
                      <Input
                        id="poste"
                        name="poste"
                        value={formData.poste}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateEmbauche" className="text-blue-700">
                        Date d'embauche
                      </Label>
                      <Input
                        id="dateEmbauche"
                        name="dateEmbauche"
                        value={formData.dateEmbauche}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-blue-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephone" className="text-blue-700">
                        Téléphone
                      </Label>
                      <Input
                        id="telephone"
                        name="telephone"
                        value={formData.telephone || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adresse" className="text-blue-700">
                        Adresse
                      </Label>
                      <Input
                        id="adresse"
                        name="adresse"
                        value={formData.adresse || ""}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  // Display info
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Nom
                      </h3>
                      <p className="text-lg text-slate-800">{employee.nom}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Prénom
                      </h3>
                      <p className="text-lg text-slate-800">
                        {employee.prenom}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Poste
                      </h3>
                      <p className="text-lg text-slate-800">
                        <Badge className="bg-blue-100 text-blue-700">
                          {employee.poste}
                        </Badge>
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Date d'embauche
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-lg">{employee.dateEmbauche}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Email
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <Mail className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-lg">{employee.email}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Téléphone
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <Phone className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-lg">
                          {employee.telephone || "Non renseigné"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg md:col-span-2">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Adresse
                      </h3>
                      <div className="flex items-start text-slate-800">
                        <MapPin className="h-4 w-4 text-slate-400 mr-2 mt-1" />
                        <span className="text-lg">
                          {employee.adresse || "Non renseignée"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Entreprise
                      </h3>
                      <div className="flex items-center text-slate-800">
                        <Building className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-lg">
                          {getEntrepriseName(employee.entrepriseId)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg flex items-center">
                      <Button
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      >
                        <Link to={`/clients/${employee.entrepriseId}`}>
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
                            Commencez par ajouter un document pour cet employé
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
          {employee && <PrestationsCalendar employeeId={employee.id} />}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-blue-700">Paramètres</CardTitle>
              <CardDescription>
                Gérer les paramètres de l'employé
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="border border-red-200 p-6 rounded-md bg-red-50">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    Zone de danger
                  </h3>
                  <p className="text-sm text-red-500 mb-4">
                    La suppression d'un employé est irréversible et supprimera
                    toutes les données associées.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer l'employé
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
              Êtes-vous sûr de vouloir supprimer l'employé{" "}
              <strong>
                {employee.prenom} {employee.nom}
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
