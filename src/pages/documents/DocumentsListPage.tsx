// src/pages/DocumentsListPage.tsx
import { useState, useEffect } from "react";
import {
  Download,
  Search,
  ChevronLeft,
  Plus,
  Calendar,
  FileText,
  File,
  FileSpreadsheet,
  FolderOpen,
  FileArchive,
  FileImage,
  ArrowDownUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes.config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { documentService } from "@/services/api/documentService";
import type { DocumentGeneration } from "@/types/DocumentTypes";
import { toast } from "sonner";

// Types fictifs pour les documents
interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  dateUpload: string;
  size: string;
  enterprise?: string;
  employee?: string;
  status?: "active" | "archive" | "pending";
}

// Données des catégories pour obtenir le titre et les couleurs
interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  iconComponent: React.ReactNode;
}

// Données fictives pour les catégories de documents
const documentCategories: DocumentCategory[] = [
  {
    id: "contracts",
    title: "Contrats",
    description: "Contrats de travail, avenants et documents contractuels",
    count: 24,
    icon: <FileText className="h-8 w-8" />,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    iconComponent: <FileText className="h-4 w-4 text-blue-500" />,
  },
  {
    id: "administratif",
    title: "Documents administratifs",
    description: "Formulaires administratifs et documents officiels",
    count: 15,
    icon: <File className="h-8 w-8" />,
    color: "bg-green-50 text-green-700 border-green-200",
    iconComponent: <File className="h-4 w-4 text-green-500" />,
  },
  {
    id: "salary",
    title: "Fiches de paie",
    description: "Fiches de salaire mensuelles et annuelles",
    count: 33,
    icon: <FileSpreadsheet className="h-8 w-8" />,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    iconComponent: <FileSpreadsheet className="h-4 w-4 text-purple-500" />,
  },
  {
    id: "employee",
    title: "Dossiers employés",
    description: "Documents personnels des employés",
    count: 28,
    icon: <FolderOpen className="h-8 w-8" />,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    iconComponent: <FolderOpen className="h-4 w-4 text-amber-500" />,
  },
  {
    id: "certificates",
    title: "Certificats",
    description: "Certificats médicaux et attestations diverses",
    count: 12,
    icon: <FileArchive className="h-8 w-8" />,
    color: "bg-red-50 text-red-700 border-red-200",
    iconComponent: <FileArchive className="h-4 w-4 text-red-500" />,
  },
  {
    id: "templates",
    title: "Modèles de documents",
    description: "Templates et modèles réutilisables",
    count: 8,
    icon: <FileImage className="h-8 w-8" />,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconComponent: <FileImage className="h-4 w-4 text-indigo-500" />,
  },
];

// Fonction utilitaire pour convertir DocumentGeneration en Document
const convertGenerationToDocument = (generation: DocumentGeneration): Document => {
  return {
    id: generation.id,
    name: generation.templateDisplayName + (generation.collaboratorName ? ` - ${generation.collaboratorName}` : ''),
    type: "PDF",
    category: "contracts",
    dateUpload: new Date(generation.createdAt).toLocaleDateString('fr-FR'),
    size: "N/A", // Taille non disponible dans l'API
    enterprise: generation.companyName,
    employee: generation.collaboratorName,
    status: generation.status === 'COMPLETED' ? 'active' : 
             generation.status === 'FAILED' ? 'archive' : 'pending',
  };
};

export function DocumentsListPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtenir les informations de la catégorie actuelle
  const currentCategory = documentCategories.find(
    (category) => category.id === categoryId
  );

  // Charger les documents depuis l'API
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let generations: any[] = [];
        
        if (categoryId === 'contracts') {
          // Charger seulement les contrats
          generations = await documentService.getDocuments('CONTRAT');
        } else if (categoryId === 'administratif' || categoryId === 'certificates') {
          // Charger tous les documents non-contrats
          const allDocuments = await documentService.getDocuments();
          generations = allDocuments.filter((doc: any) => doc.documentType !== 'Contrat');
        } else {
          // Pour les autres catégories, pas de documents pour l'instant
          generations = [];
        }
        
        const convertedDocuments = generations.map(convertGenerationToDocument);
        setDocuments(convertedDocuments);
      } catch (err) {
        console.error('Erreur lors du chargement des documents:', err);
        setError('Erreur lors du chargement des documents');
        toast.error('Erreur lors du chargement des documents');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [categoryId]);

  // Effet pour rediriger si la catégorie n'existe pas
  useEffect(() => {
    if (!currentCategory && categoryId) {
      navigate(ROUTES.DOCUMENTS);
    }
  }, [navigate, currentCategory, categoryId]);

  // Si pas de catégorie valide et toujours en cours de redirection
  if (!currentCategory) {
    return <div>Chargement des documents...</div>;
  }

  // Filtrer les documents en fonction de la recherche et des filtres
  const filteredDocuments = documents.filter((document: Document) => {
    // Filtrer par recherche
    const matchesSearch =
      document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (document.employee &&
        document.employee.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (document.enterprise &&
        document.enterprise.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtrer par statut
    const matchesStatus =
      statusFilter === "all" || document.status === statusFilter;

    // Filtrer par type
    const matchesType =
      typeFilter === "all" ||
      document.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  // Obtenir les types de documents uniques pour le filtre
  const documentTypes = Array.from(
    new Set(
      documents.map((doc: Document) => doc.type)
    )
  );

  // Fonction pour télécharger un document
  const handleDownloadDocument = async (documentId: string) => {
    try {
      const blob = await documentService.downloadDocumentPdf(documentId);
      // Trouver le document pour obtenir son nom
      const document = documents.find(doc => doc.id === documentId);
      const fileName = document ? `${document.name}.pdf` : `document_${documentId}.pdf`;
      documentService.downloadFile(blob, fileName);
      toast.success('Téléchargement démarré');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du document');
    }
  };

  // Fonction pour voir les détails d'un document
  const handleViewDocument = (documentId: string) => {
    navigate(ROUTES.DOCUMENT_VIEW(documentId));
  };

  // Icône de statut
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Actif</Badge>;
      case "archive":
        return <Badge className="bg-slate-100 text-slate-700">Archivé</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>
        );
      default:
        return null;
    }
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
              onClick={() => navigate(ROUTES.DOCUMENTS)}
              className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-blue-700">
              {currentCategory.title}
            </h1>
          </div>
          <div className="flex items-center">
            <Badge className={currentCategory.color.replace("border-", "")}>
              {isLoading ? '...' : documents.length} documents
            </Badge>
            <span className="ml-2 text-sm text-slate-500">
              {currentCategory.description}
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
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Ajouter un document
          </Button>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher un document, un employé..."
            className="pl-9 py-2 border-slate-200 rounded-md bg-white shadow-sm focus-visible:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] border-slate-200 focus:ring-blue-500 bg-white">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="archive">Archivé</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>

          {documentTypes.length > 0 && (
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] border-slate-200 focus:ring-blue-500 bg-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="icon"
            className="border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Documents Table */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="text-blue-700 font-medium">Nom</TableHead>
                <TableHead className="text-blue-700 font-medium">
                  Type
                </TableHead>
                {categoryId !== "templates" && (
                  <>
                    <TableHead className="text-blue-700 font-medium hidden md:table-cell">
                      Entreprise
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium hidden md:table-cell">
                      Employé
                    </TableHead>
                  </>
                )}
                <TableHead className="text-blue-700 font-medium hidden md:table-cell">
                  Date d'upload
                </TableHead>
                <TableHead className="text-blue-700 font-medium hidden md:table-cell">
                  Taille
                </TableHead>
                <TableHead className="text-blue-700 font-medium">
                  Statut
                </TableHead>
                <TableHead className="text-blue-700 font-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={categoryId !== "templates" ? 8 : 6}
                    className="text-center py-10 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                      <p>Chargement des documents...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={categoryId !== "templates" ? 8 : 6}
                    className="text-center py-10 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-slate-300 mb-2" />
                      <p>
                        {categoryId === 'contracts' 
                          ? 'Aucun contrat trouvé' 
                          : 'Cette catégorie ne contient pas encore de documents'
                        }
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {categoryId === 'contracts' 
                          ? 'Essayez de modifier vos critères de recherche ou générez votre premier contrat'
                          : 'Les documents de cette catégorie seront disponibles prochainement'
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((document) => (
                  <TableRow
                    key={document.id}
                    className="hover:bg-slate-50 border-b border-slate-100 group"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-start">
                        <div className="mr-2 mt-1">
                          {currentCategory.iconComponent}
                        </div>
                        <div>
                          <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                            {document.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-700"
                      >
                        {document.type}
                      </Badge>
                    </TableCell>
                    {categoryId !== "templates" && (
                      <>
                        <TableCell className="hidden md:table-cell">
                          {document.enterprise && (
                            <Link
                              to="#"
                              className="text-slate-600 hover:text-blue-600"
                            >
                              {document.enterprise}
                            </Link>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {document.employee && (
                            <Link
                              to="#"
                              className="text-slate-600 hover:text-blue-600"
                            >
                              {document.employee}
                            </Link>
                          )}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center text-slate-600">
                        <Calendar className="h-3 w-3 text-slate-400 mr-1" />
                        <span>{document.dateUpload}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm text-slate-600">
                      {document.size}
                    </TableCell>
                    <TableCell>{getStatusBadge(document.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                          onClick={() => handleDownloadDocument(document.id)}
                          disabled={document.status === 'pending'}
                          title="Télécharger le PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                          onClick={() => handleViewDocument(document.id)}
                          disabled={document.status === 'pending'}
                          title="Voir le document"
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
    </div>
  );
}
