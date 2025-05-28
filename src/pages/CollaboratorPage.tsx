import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Mail, Briefcase, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { collaboratorService } from "@/services/api/collaboratorService";
import { companyService } from "@/services/api/companyService";
import { Collaborator } from "@/types/CollaboratorTypes";
import { CompanyDto } from "@/types/CompanyTypes";
import { ROUTES } from "@/config/routes.config";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import { DataTable, Column } from "@/components/layout/DataTable";

const getCollaboratorTypeBadgeStyle = (type: string | undefined) => {
  switch (type) {
    case "EMPLOYEE":
      return "bg-green-100 text-green-700";
    case "WORKER":
      return "bg-blue-100 text-blue-700";
    case "FREELANCE":
      return "bg-purple-100 text-purple-700";
    case "INTERN":
      return "bg-orange-100 text-orange-700";
    case "STUDENT":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getCollaboratorTypeLabel = (type: string | undefined) => {
  switch (type) {
    case "EMPLOYEE":
      return "Employé";
    case "WORKER":
      return "Ouvrier";
    case "FREELANCE":
      return "Indépendant";
    case "INTERN":
      return "Stagiaire";
    case "STUDENT":
      return "Étudiant";
    default:
      return "Non spécifié";
  }
};

export function CollaboratorPage() {
  const { user, hasRole } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [companies, setCompanies] = useState<Record<string, CompanyDto>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let collaboratorsResponse;
        
        // If user has ROLE_COMPANY, fetch only their company's collaborators
        if (hasRole("ROLE_COMPANY") && user?.companyId) {
          collaboratorsResponse = await collaboratorService.getCollaboratorsByCompany(user.companyId);
        } else {
          // For other roles, fetch all collaborators
          collaboratorsResponse = await collaboratorService.getAllCollaborators();
        }
        
        setCollaborators(collaboratorsResponse || []);

        // Create a map of company id to company data
        const companiesResponse = await companyService.getAllCompanies();
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
  }, [user, hasRole]);

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

  const columns: Column<Collaborator>[] = [
    {
      header: "Nom",
      accessor: (collaborator) => (
        <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
          {collaborator.lastName}
        </div>
      ),
    },
    {
      header: "Prénom",
      accessor: "firstName",
    },
    {
      header: "Poste",
      accessor: (collaborator) => (
        <div className="flex items-center gap-2">
          <Badge
            className={getCollaboratorTypeBadgeStyle(
              collaborator.type || "UNKNOWN"
            )}
          >
            {getCollaboratorTypeLabel(collaborator.type || "UNKNOWN")}
          </Badge>
          <div className="flex items-center">
            <Briefcase className="h-3 w-3 text-slate-400 mr-1" />
            <span>{collaborator.jobFunction || "Non spécifié"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Numéro national",
      accessor: (collaborator) => (
        <div className="flex items-center">
          <Mail className="h-3 w-3 text-slate-400 mr-1" />
          <span className="text-slate-600">
            {collaborator.nationalNumber || "Non spécifié"}
          </span>
        </div>
      ),
      className: "hidden md:table-cell",
    },
    {
      header: "Entreprise",
      accessor: (collaborator) => (
        <div className="flex items-center">
          <Building className="h-3 w-3 text-slate-400 mr-1" />
          <Link
            to={ROUTES.COMPANY_DETAILS(collaborator.companyId)}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {companies[collaborator.companyId]?.name || collaborator.companyId}
          </Link>
        </div>
      ),
      className: "hidden md:table-cell",
    },
  ];

  return (
    <div className="w-full">
      <PageHeader
        title={hasRole("ROLE_COMPANY") ? "Mes Collaborateurs" : "Collaborateurs"}
        description={
          hasRole("ROLE_COMPANY")
            ? `Gérez les collaborateurs de ${user?.companyName || 'votre entreprise'}`
            : "Gérez les collaborateurs enregistrés dans le secrétariat social"
        }
        onExport={() => {}}
        addNewButton={{
          label: "Ajouter un collaborateur",
          route: ROUTES.COLLABORATOR_CREATE,
        }}
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher un collaborateur, un poste, une entreprise..."
      />

      <div className="mt-6">
        <DataTable
          data={filteredCollaborators}
          columns={columns}
          loading={loading}
          detailsRoute={ROUTES.COLLABORATOR_DETAILS}
          detailsButtonLabel="Voir détails"
        />
      </div>
    </div>
  );
}
