// src/pages/EntrepriseDetailsPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
interface Entreprise {
  id: string;
  nom: string;
  adresse: string;
  numeroTVA: string;
  secteurActivite: string;
  utilisateurId: string;
}

interface Employee {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  email: string;
  dateEmbauche: string;
}

interface Document {
  id: string;
  nom: string;
  type: string;
  dateUpload: string;
  taille: string;
}

// Sample data
const demoEntreprises: Entreprise[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    nom: "TechSolutions SPRL",
    adresse: "15 Rue de la Loi, 1000 Bruxelles",
    numeroTVA: "BE0123456789",
    secteurActivite: "Informatique",
    utilisateurId: "987e6543-e21b-12d3-a456-426614174111",
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    nom: "Construction Dupont SA",
    adresse: "24 Avenue Louise, 1050 Bruxelles",
    numeroTVA: "BE0987654321",
    secteurActivite: "Construction",
    utilisateurId: "887e6543-e21b-12d3-a456-426614174112",
  },
  // ... other enterprises
];

// Sample employees
const demoEmployees: Record<string, Employee[]> = {
  "123e4567-e89b-12d3-a456-426614174000": [
    {
      id: "emp1",
      nom: "Dubois",
      prenom: "Jean",
      poste: "Développeur Senior",
      email: "jean.dubois@techsolutions.be",
      dateEmbauche: "15/03/2020",
    },
    {
      id: "emp2",
      nom: "Martin",
      prenom: "Sophie",
      poste: "Designer UX",
      email: "sophie.martin@techsolutions.be",
      dateEmbauche: "21/09/2021",
    },
  ],
  "223e4567-e89b-12d3-a456-426614174001": [
    {
      id: "emp3",
      nom: "Laurent",
      prenom: "Michel",
      poste: "Chef de chantier",
      email: "michel.laurent@construction-dupont.be",
      dateEmbauche: "03/05/2018",
    },
  ],
};

// Sample documents
const demoDocuments: Record<string, Document[]> = {
  "123e4567-e89b-12d3-a456-426614174000": [
    {
      id: "doc1",
      nom: "Contrat de service",
      type: "PDF",
      dateUpload: "10/01/2023",
      taille: "1.2 MB",
    },
    {
      id: "doc2",
      nom: "Facture Q1 2023",
      type: "PDF",
      dateUpload: "15/04/2023",
      taille: "850 KB",
    },
  ],
  "223e4567-e89b-12d3-a456-426614174001": [
    {
      id: "doc3",
      nom: "Plan de chantier",
      type: "PDF",
      dateUpload: "22/03/2023",
      taille: "3.5 MB",
    },
  ],
};

export function EntrepriseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Entreprise | null>(null);
  const [activeTab, setActiveTab] = useState("infos");

  const employees = id ? demoEmployees[id] || [] : [];
  const documents = id ? demoDocuments[id] || [] : [];

  // Fetch enterprise data
  useEffect(() => {
    if (id) {
      const foundEntreprise = demoEntreprises.find((e) => e.id === id);
      if (foundEntreprise) {
        setEntreprise(foundEntreprise);
        setFormData(foundEntreprise);
      } else {
        // Enterprise not found, redirect to list
        navigate("/clients");
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
    navigate("/clients");
  };

  const handleCancel = () => {
    setFormData(entreprise);
    setEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/clients")}
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{entreprise.nom}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto md:grid-cols-4 grid-cols-2 mb-4">
          <TabsTrigger value="infos">
            <Info className="h-4 w-4 mr-2" /> Infos
          </TabsTrigger>
          <TabsTrigger value="personnel">
            <Users className="h-4 w-4 mr-2" /> Personnel
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
                <CardTitle>Informations entreprise</CardTitle>
                <CardDescription>
                  Détails et coordonnées de l'entreprise
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
                      <Label htmlFor="nom">Nom de l'entreprise</Label>
                      <Input
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numeroTVA">Numéro TVA</Label>
                      <Input
                        id="numeroTVA"
                        name="numeroTVA"
                        value={formData.numeroTVA}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secteurActivite">
                        Secteur d'activité
                      </Label>
                      <Input
                        id="secteurActivite"
                        name="secteurActivite"
                        value={formData.secteurActivite}
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
                        Nom de l'entreprise
                      </h3>
                      <p className="text-lg">{entreprise.nom}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Numéro TVA
                      </h3>
                      <p className="text-lg">{entreprise.numeroTVA}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Secteur d'activité
                      </h3>
                      <p className="text-lg">{entreprise.secteurActivite}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        ID Utilisateur
                      </h3>
                      <p className="text-sm font-mono">
                        {entreprise.utilisateurId}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Adresse
                      </h3>
                      <p className="text-lg">{entreprise.adresse}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personnel Tab */}
        <TabsContent value="personnel">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Personnel</CardTitle>
              <CardDescription>
                Liste des employés de l'entreprise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Date d'embauche
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Aucun employé trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.nom}
                        </TableCell>
                        <TableCell>{employee.prenom}</TableCell>
                        <TableCell>{employee.poste}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {employee.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {employee.dateEmbauche}
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Documents associés à l'entreprise
              </CardDescription>
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
                Gérer les paramètres de l'entreprise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    Zone de danger
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    La suppression d'une entreprise est irréversible et
                    supprimera toutes les données associées.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
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
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'entreprise{" "}
              <strong>{entreprise.nom}</strong> ? Cette action est irréversible
              et supprimera toutes les données associées.
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
