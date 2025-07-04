// src/pages/DocumentsPage.tsx
import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  FolderOpen,
  Search,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TemplateSelectionModal } from "@/components/features/documents/TemplateSelectionModal";
import { documentService } from "@/services/api/documentService";

// Types et données fictives pour les catégories de documents
interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

export function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [contractsCount, setContractsCount] = useState(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const navigate = useNavigate();

  // Données des catégories de documents avec compteurs dynamiques
  const documentCategories: DocumentCategory[] = [
    {
      id: "contracts",
      title: "Contrats",
      description: "Contrats de travail, avenants et documents contractuels",
      count: contractsCount,
      icon: <FileText className="h-8 w-8" />,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "administratif",
      title: "Documents administratifs",
      description: "Formulaires administratifs et documents officiels",
      count: 0,
      icon: <File className="h-8 w-8" />,
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: "salary",
      title: "Fiches de paie",
      description: "Fiches de salaire mensuelles et annuelles",
      count: 0,
      icon: <FileSpreadsheet className="h-8 w-8" />,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      id: "employee",
      title: "Dossiers employés",
      description: "Documents personnels des employés",
      count: 0,
      icon: <FolderOpen className="h-8 w-8" />,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "certificates",
      title: "Certificats",
      description: "Certificats médicaux et attestations diverses",
      count: 0,
      icon: <FileArchive className="h-8 w-8" />,
      color: "bg-red-50 text-red-700 border-red-200",
    },
    {
      id: "templates",
      title: "Modèles de documents",
      description: "Templates et modèles réutilisables",
      count: 0,
      icon: <FileImage className="h-8 w-8" />,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
  ];

  // Filtrer les catégories en fonction du terme de recherche
  const filteredCategories = documentCategories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Charger le nombre de contrats depuis l'API
  useEffect(() => {
    const loadContractsCount = async () => {
      setIsLoadingCounts(true);
      try {
        const generations = await documentService.getGenerations();
        setContractsCount(generations.length);
      } catch (error) {
        console.error('Erreur lors du chargement du nombre de contrats:', error);
        // En cas d'erreur, on garde le compteur à 0
      } finally {
        setIsLoadingCounts(false);
      }
    };

    loadContractsCount();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/documents/${categoryId}`);
  };

  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Documents
          </h1>
          <p className="text-slate-500">
            Gérez tous vos documents par catégorie
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
          >
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => setIsTemplateModalOpen(true)}
          >
            <FilePlus className="mr-2 h-4 w-4" /> Générer un document
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher une catégorie de documents..."
            className="pl-9 py-2 border-slate-200 rounded-md bg-white shadow-sm focus-visible:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            {documentCategories.reduce((acc, cat) => acc + cat.count, 0)}{" "}
            documents au total
          </Badge>
        </div>
      </div>

      {/* Document Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredCategories.length === 0 ? (
          <div className="col-span-3 py-12 flex flex-col items-center justify-center text-slate-500">
            <Search className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg">Aucune catégorie trouvée</p>
            <p className="text-sm text-slate-400 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <Card
              key={category.id}
              className={`border hover:border-blue-300 transition-colors cursor-pointer shadow-sm hover:shadow ${category.color}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {category.description}
                    </CardDescription>
                  </div>
                  {category.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mt-4">
                  <Badge variant="outline" className="bg-white bg-opacity-60">
                    {category.count} documents
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-700 hover:bg-white hover:bg-opacity-60"
                >
                  Voir tous →
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </div>
  );
}
