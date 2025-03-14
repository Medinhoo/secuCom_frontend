// src/pages/EntrepriseDetailsPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Calendar,
  Mail,
  Briefcase,
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

// Import data from mockData file
import {
  demoEntreprises,
  getEmployeesByCompany,
  demoCompanyDocuments,
  Entreprise,
  getSectorLightColor,
} from "@/data/mockData";

export function EntrepriseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Entreprise | null>(null);
  const [activeTab, setActiveTab] = useState("infos");

  // Get employees and documents for this company
  const employees = id ? getEmployeesByCompany(id) : [];
  const documents = id ? demoCompanyDocuments[id] || [] : [];

  // Fetch enterprise data
  useEffect(() => {
    if (id) {
      const foundEntreprise = demoEntreprises.find((e) => e.id === id);
      if (foundEntreprise) {
        setEntreprise(foundEntreprise);
        setFormData(foundEntreprise);
      } else {
        // Enterprise not found, redirect to list
        navigate("/entreprises");
      }
    }
  }, [id, navigate]);

  if (!entreprise || !formData) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = () => {
    if (formData) {
      setEntreprise(formData);
      setEditMode(false);
      // Here you would typically save to your backend
      console.log("Saving enterprise:", formData);
    }
  };

  const handleDelete = () => {
    // Here you would delete from your backend
    console.log("Deleting enterprise:", entreprise.id);
    setIsDeleteDialogOpen(false);
    navigate("/entreprises");
  };

  const handleCancel = () => {
    setFormData(entreprise);
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
                onClick={() => navigate("/entreprises")}
                className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight text-blue-700">
                {entreprise.nom}
              </h1>
            </div>
            <div className="flex items-center">
              <Badge
                className={`${getSectorLightColor(
                  entreprise.secteurActivite
                )} mr-2`}
              >
                {entreprise.secteurActivite}
              </Badge>
              <span className="text-sm text-slate-500">
                {entreprise.numeroTVA}
              </span>
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
              {employees.length}
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
              {documents.length}
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
                    Informations entreprise
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
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-blue-700">
                        Nom de l'entreprise
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
                      <Label htmlFor="numeroTVA" className="text-blue-700">
                        Numéro TVA
                      </Label>
                      <Input
                        id="numeroTVA"
                        name="numeroTVA"
                        value={formData.numeroTVA}
                        onChange={handleInputChange}
                        className="border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="secteurActivite"
                        className="text-blue-700"
                      >
                        Secteur d'activité
                      </Label>
                      <Input
                        id="secteurActivite"
                        name="secteurActivite"
                        value={formData.secteurActivite}
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
                        value={formData.adresse}
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
                        Nom de l'entreprise
                      </h3>
                      <p className="text-lg text-slate-800">{entreprise.nom}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Numéro TVA
                      </h3>
                      <p className="text-lg font-mono text-slate-800">
                        {entreprise.numeroTVA}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Secteur d'activité
                      </h3>
                      <p className="text-lg text-slate-800">
                        <Badge
                          className={`${getSectorLightColor(
                            entreprise.secteurActivite
                          )}`}
                        >
                          {entreprise.secteurActivite}
                        </Badge>
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Nombre d'employés
                      </h3>
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium">
                          {entreprise.employesCount || employees.length}
                        </div>
                        <div className="ml-2 w-16 bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                ((entreprise.employesCount || 0) / 30) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg md:col-span-2">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">
                        Adresse
                      </h3>
                      <p className="text-lg text-slate-800">
                        {entreprise.adresse}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personnel Tab */}
        <TabsContent value="personnel">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-blue-700">Personnel</CardTitle>
                <CardDescription>
                  Liste des employés de l'entreprise
                </CardDescription>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un employé
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
                      Prénom
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      Poste
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium hidden md:table-cell">
                      Date d'embauche
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-slate-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Users className="h-10 w-10 text-slate-300 mb-2" />
                          <p>Aucun employé trouvé</p>
                          <p className="text-sm text-slate-400 mt-1">
                            Commencez par ajouter un employé à cette entreprise
                          </p>
                          <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <Plus className="mr-2 h-4 w-4" /> Ajouter un employé
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow
                        key={employee.id}
                        className="hover:bg-slate-50 border-b border-slate-100 group"
                      >
                        <TableCell className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                          {employee.nom}
                        </TableCell>
                        <TableCell>{employee.prenom}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Briefcase className="h-3 w-3 text-slate-400 mr-1" />
                            <span>{employee.poste}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 text-slate-400 mr-1" />
                            <span>{employee.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-slate-400 mr-1" />
                            <span>{employee.dateEmbauche}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                          >
                            <Link to={`/personnel/${employee.id}`}>
                              Voir détails
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
                  Documents associés à l'entreprise
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
                            Commencez par ajouter un document à cette entreprise
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

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-blue-700">Paramètres</CardTitle>
              <CardDescription>
                Gérer les paramètres de l'entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="border border-red-200 p-6 rounded-md bg-red-50">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    Zone de danger
                  </h3>
                  <p className="text-sm text-red-500 mb-4">
                    La suppression d'une entreprise est irréversible et
                    supprimera toutes les données associées.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer l'entreprise
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
              Êtes-vous sûr de vouloir supprimer l'entreprise{" "}
              <strong>{entreprise.nom}</strong> ? Cette action est irréversible
              et supprimera toutes les données associées.
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
    </>
  );
}
