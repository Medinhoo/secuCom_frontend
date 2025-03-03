// src/pages/EmployeeDetailsPage.tsx
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

// Types
interface Employee {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  email: string;
  dateEmbauche: string;
  telephone: string;
  adresse: string;
  entrepriseId: string;
}

interface Entreprise {
  id: string;
  nom: string;
}

interface Document {
  id: string;
  nom: string;
  type: string;
  dateUpload: string;
  taille: string;
}

// Sample data
const demoEmployees: Employee[] = [
  {
    id: "emp1",
    nom: "Dubois",
    prenom: "Jean",
    poste: "Développeur Senior",
    email: "jean.dubois@techsolutions.be",
    dateEmbauche: "15/03/2020",
    telephone: "+32 470 12 34 56",
    adresse: "10 Rue de la Paix, 1000 Bruxelles",
    entrepriseId: "123e4567-e89b-12d3-a456-426614174000",
  },
  {
    id: "emp2",
    nom: "Martin",
    prenom: "Sophie",
    poste: "Designer UX",
    email: "sophie.martin@techsolutions.be",
    dateEmbauche: "21/09/2021",
    telephone: "+32 471 23 45 67",
    adresse: "25 Avenue Louise, 1050 Bruxelles",
    entrepriseId: "123e4567-e89b-12d3-a456-426614174000",
  },
  {
    id: "emp3",
    nom: "Laurent",
    prenom: "Michel",
    poste: "Chef de chantier",
    email: "michel.laurent@construction-dupont.be",
    dateEmbauche: "03/05/2018",
    telephone: "+32 472 34 56 78",
    adresse: "5 Rue du Commerce, 1040 Bruxelles",
    entrepriseId: "223e4567-e89b-12d3-a456-426614174001",
  },
];

// Sample enterprises
const demoEntreprises: Entreprise[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    nom: "TechSolutions SPRL",
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    nom: "Construction Dupont SA",
  },
];

// Sample documents
const demoDocuments: Record<string, Document[]> = {
  emp1: [
    {
      id: "doc1",
      nom: "Contrat de travail",
      type: "PDF",
      dateUpload: "15/03/2020",
      taille: "750 KB",
    },
    {
      id: "doc2",
      nom: "CV",
      type: "PDF",
      dateUpload: "10/03/2020",
      taille: "1.2 MB",
    },
  ],
  emp2: [
    {
      id: "doc3",
      nom: "Contrat de travail",
      type: "PDF",
      dateUpload: "21/09/2021",
      taille: "720 KB",
    },
    {
      id: "doc4",
      nom: "Attestation de formation",
      type: "PDF",
      dateUpload: "05/11/2021",
      taille: "1.5 MB",
    },
  ],
  emp3: [
    {
      id: "doc5",
      nom: "Contrat de travail",
      type: "PDF",
      dateUpload: "03/05/2018",
      taille: "800 KB",
    },
  ],
};

export function PersonnelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("infos");

  const documents = id ? demoDocuments[id] || [] : [];

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
    const entreprise = demoEntreprises.find((e) => e.id === id);
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
        <TabsList className="grid w-full md:w-auto md:grid-cols-3 grid-cols-3 mb-4">
          <TabsTrigger value="infos">
            <Info className="h-4 w-4 mr-2" /> Infos
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" /> Documents
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
                        value={formData.telephone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adresse">Adresse</Label>
                      <Input
                        id="adresse"
                        name="adresse"
                        value={formData.adresse}
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
