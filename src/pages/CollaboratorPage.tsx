// src/pages/PersonnelPage.tsx
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Mail,
  Briefcase,
  Building,
  Download,
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
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { collaboratorService } from "@/services/api/collaboratorService";
import { companyService } from "@/services/api/companyService";
import { Collaborator } from "@/types/CollaboratorTypes";
import { CompanyDto } from "@/types/CompanyTypes";
import { toast } from "sonner";

export function CollaboratorPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [companies, setCompanies] = useState<Record<string, CompanyDto>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collaboratorsResponse, companiesResponse] = await Promise.all([
          collaboratorService.getAllCollaborators(),
          companyService.getAllCompanies(),
        ]);

        setCollaborators(collaboratorsResponse || []);

        // Create a map of company id to company data
        const companyMap = (companiesResponse || []).reduce((acc, company) => {
          acc[company.id] = company;
          return acc;
        }, {} as Record<string, CompanyDto>);
        setCompanies(companyMap);
      } catch (error) {
        toast.error("Échec du chargement des collaborateurs");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les collaborateurs selon le terme de recherche
  const filteredCollaborators = collaborators.filter(
    (collaborator) =>
      collaborator.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.jobFunction
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      collaborator.nationalNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Grouper les collaborateurs par fonction pour les statistiques
  const positionCounts = collaborators.reduce((acc, collaborator) => {
    const position = collaborator.jobFunction || "Non spécifié";
    acc[position] = (acc[position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Collaborateurs
          </h1>
          <p className="text-slate-500">
            Gérez les collaborateurs enregistrés dans le secrétariat social
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
          >
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Ajouter un collaborateur
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher un collaborateur, un poste, une entreprise..."
            className="pl-9 py-2 border-slate-200 rounded-md bg-white shadow-sm focus-visible:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Personnel Table */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="text-blue-700 font-medium">Nom</TableHead>
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
                  Entreprise
                </TableHead>
                <TableHead className="text-blue-700 font-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-4"></div>
                      <p className="text-slate-500">
                        Chargement des collaborateurs...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCollaborators.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-slate-300 mb-2" />
                      <p>Aucun collaborateur trouvé</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Essayez de modifier vos critères de recherche
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCollaborators.map((collaborator) => (
                  <TableRow
                    key={collaborator.id}
                    className="hover:bg-slate-50 border-b border-slate-100 group"
                  >
                    <TableCell className="py-4">
                      <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                        {collaborator.lastName}
                      </div>
                    </TableCell>
                    <TableCell>{collaborator.firstName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
                          {collaborator.type === "EMPLOYEE"
                            ? "Employé"
                            : collaborator.type === "WORKER"
                            ? "Ouvrier"
                            : collaborator.type === "FREELANCE"
                            ? "Indépendant"
                            : collaborator.type === "INTERN"
                            ? "Stagiaire"
                            : collaborator.type === "STUDENT"
                            ? "Étudiant"
                            : "Non spécifié"}
                        </Badge>
                        <div className="flex items-center">
                          <Briefcase className="h-3 w-3 text-slate-400 mr-1" />
                          <span>
                            {collaborator.jobFunction || "Non spécifié"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 text-slate-400 mr-1" />
                        <span className="text-slate-600">
                          {collaborator.nationalNumber || "Non spécifié"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        <Building className="h-3 w-3 text-slate-400 mr-1" />
                        <Link
                          to={`/companies/${collaborator.companyId}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {companies[collaborator.companyId]?.name ||
                            collaborator.companyId}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                      >
                        <Link to={`/collaborator/${collaborator.id}`}>
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
    </div>
  );
}
