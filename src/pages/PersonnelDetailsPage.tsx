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
      <div key={`empty-${i}`} className="h-12 border border-gray-100"></div>
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
              className={`h-12 border border-gray-200 flex flex-col justify-between p-1 relative ${statusColorClass}`}
            >
              <span className="text-xs font-semibold">{day}</span>
              {dayData?.hours && (
                <span className="text-xs text-gray-600">{dayData.hours}h</span>
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Calendrier des prestations</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              &lt;
            </Button>
            <div className="flex items-center space-x-2">
              <Select
                value={month.toString()}
                onValueChange={(value) => setMonth(parseInt(value))}
              >
                <SelectTrigger className="w-32">
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
                <SelectTrigger className="w-24">
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
            <Button variant="outline" size="sm" onClick={nextMonth}>
              &gt;
            </Button>
          </div>
        </div>
        <CardDescription>Suivi de la présence et des congés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(WorkStatus).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <div
                className={`w-4 h-4 rounded mr-1 ${statusColors[value]}`}
              ></div>
              <span className="text-xs">{statusLabels[value]}</span>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-7 gap-px">
            <div className="text-center font-medium text-xs p-1">Lun</div>
            <div className="text-center font-medium text-xs p-1">Mar</div>
            <div className="text-center font-medium text-xs p-1">Mer</div>
            <div className="text-center font-medium text-xs p-1">Jeu</div>
            <div className="text-center font-medium text-xs p-1">Ven</div>
            <div className="text-center font-medium text-xs p-1">Sam</div>
            <div className="text-center font-medium text-xs p-1">Dim</div>
          </div>
          <div className="grid grid-cols-7 gap-px">{days}</div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Récapitulatif du mois</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="border rounded p-2">
                <div className="text-xs text-gray-500">
                  {statusLabels[status as WorkStatus]}
                </div>
                <div className="text-lg font-semibold">
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
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/personnel")}
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {employee.prenom} {employee.nom}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto md:grid-cols-4 grid-cols-4 mb-4">
          <TabsTrigger value="infos">
            <Info className="h-4 w-4 mr-2" /> Infos
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" /> Documents
          </TabsTrigger>
          <TabsTrigger value="prestations">
            <Calendar className="h-4 w-4 mr-2" /> Prestations
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" /> Paramètres
          </TabsTrigger>
        </TabsList>

        {/* Infos Tab */}
        <TabsContent value="infos">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                <CardTitle>Informations employé</CardTitle>
                <CardDescription>
                  Détails et coordonnées de l'employé
                </CardDescription>
              </div>
              {!editMode ? (
                <Button onClick={() => setEditMode(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" /> Modifier
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} size="sm" variant="default">
                    <Save className="h-4 w-4 mr-2" /> Enregistrer
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="outline">
                    <X className="h-4 w-4 mr-2" /> Annuler
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {editMode ? (
                  // Edit form
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <Input
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="poste">Poste</Label>
                      <Input
                        id="poste"
                        name="poste"
                        value={formData.poste}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateEmbauche">Date d'embauche</Label>
                      <Input
                        id="dateEmbauche"
                        name="dateEmbauche"
                        value={formData.dateEmbauche}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input
                        id="telephone"
                        name="telephone"
                        value={formData.telephone || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adresse">Adresse</Label>
                      <Input
                        id="adresse"
                        name="adresse"
                        value={formData.adresse || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                ) : (
                  // Display info
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Nom
                      </h3>
                      <p className="text-lg">{employee.nom}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Prénom
                      </h3>
                      <p className="text-lg">{employee.prenom}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Poste
                      </h3>
                      <p className="text-lg">{employee.poste}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Date d'embauche
                      </h3>
                      <p className="text-lg">{employee.dateEmbauche}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Email
                      </h3>
                      <p className="text-lg">{employee.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Téléphone
                      </h3>
                      <p className="text-lg">{employee.telephone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Adresse
                      </h3>
                      <p className="text-lg">{employee.adresse}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Entreprise
                      </h3>
                      <p className="text-lg">
                        {getEntrepriseName(employee.entrepriseId)}
                      </p>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="mt-2"
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Documents</CardTitle>
              <CardDescription>Documents associés à l'employé</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Date d'upload
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Taille
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Aucun document trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell className="font-medium">
                          {document.nom}
                        </TableCell>
                        <TableCell>{document.type}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {document.dateUpload}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {document.taille}
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Paramètres</CardTitle>
              <CardDescription>
                Gérer les paramètres de l'employé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    Zone de danger
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    La suppression d'un employé est irréversible et supprimera
                    toutes les données associées.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
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
            <DialogTitle>Confirmer la suppression</DialogTitle>
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
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
