import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { DimonaDto, DimonaStatus } from "@/types/DimonaTypes";
import { dimonaService } from "@/services/api/dimonaService";
import { collaboratorService } from "@/services/api/collaboratorService";
import { companyService } from "@/services/api/companyService";
import { getStatusBadge, getTypeBadge } from "@/utils/dimonaUtils";
import { ROUTES } from "@/config/routes.config";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import { DataTable, Column } from "@/components/layout/DataTable";
import { StatusDropdownWithModal } from "@/components/ui/StatusDropdownWithModal";
import type { Collaborator } from "@/types/CollaboratorTypes";
import type { CompanyDto } from "@/types/CompanyTypes";

export function DimonaPage() {
  const { user, hasRole } = useAuth();
  const [dimonas, setDimonas] = useState<DimonaDto[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch collaborators and companies in parallel
        const [collaboratorsData, companiesData] = await Promise.all([
          collaboratorService.getAllCollaborators(),
          companyService.getAllCompanies(),
        ]);
        
        setCollaborators(collaboratorsData || []);
        setCompanies(companiesData || []);

        // If user has ROLE_COMPANY, fetch only their company's dimonas
        if (hasRole("ROLE_COMPANY") && user?.companyId) {
          const data = await dimonaService.getDimonasByCompany(user.companyId);
          setDimonas(data || []);
        } else {
          // For other roles, fetch all dimonas
          const data = await dimonaService.getAllDimonas();
          setDimonas(data || []);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error loading Dimona declarations";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, hasRole]);

  // Helper functions to get names
  const getCollaboratorName = (collaboratorId: string) => {
    const collaborator = collaborators.find(c => c.id === collaboratorId);
    return collaborator ? `${collaborator.firstName} ${collaborator.lastName}` : "Collaborateur inconnu";
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : "Entreprise inconnue";
  };

  // Handle status change
  const handleStatusChanged = (dimonaId: string) => (newStatus: DimonaStatus) => {
    setDimonas(prev => 
      prev.map(dimona => 
        dimona.id === dimonaId 
          ? { ...dimona, status: newStatus }
          : dimona
      )
    );
  };

  // Filter declarations based on search term
  const filteredDimonas = dimonas.filter((dimona) => {
    const collaboratorName = getCollaboratorName(dimona.collaboratorId).toLowerCase();
    const companyName = getCompanyName(dimona.companyId).toLowerCase();
    const reference = dimona.onssReference?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    return collaboratorName.includes(searchLower) || 
           companyName.includes(searchLower) || 
           reference.includes(searchLower);
  });

  const columns: Column<DimonaDto>[] = [
    {
      header: "Référence",
      accessor: (dimona) => (
        <span className="font-mono text-blue-800 group-hover:text-blue-600 transition-colors">
          {dimona.onssReference}
        </span>
      ),
    },
    {
      header: "Employé",
      accessor: (dimona) => (
        <div className="flex flex-col">
          <Link
            to={ROUTES.COLLABORATOR_DETAILS(dimona.collaboratorId)}
            className="text-slate-900 hover:text-blue-600 font-medium"
          >
            {getCollaboratorName(dimona.collaboratorId)}
          </Link>
        </div>
      ),
    },
    {
      header: "Entreprise",
      accessor: (dimona) => (
        <div className="flex flex-col">
          <Link
            to={ROUTES.COMPANY_DETAILS(dimona.companyId)}
            className="text-slate-700 hover:text-blue-600"
          >
            {getCompanyName(dimona.companyId)}
          </Link>
        </div>
      ),
      className: "hidden md:table-cell",
    },
    {
      header: "Type",
      accessor: (dimona) => getTypeBadge(dimona.type),
    },
    {
      header: "Date de déclaration",
      accessor: (dimona) =>
        new Date(dimona.entryDate).toLocaleDateString("fr-BE"),
    },
    {
      header: "Statut",
      accessor: (dimona) => (
        <div>
          {hasRole("ROLE_COMPANY") ? (
            // Company contacts see read-only status badge
            getStatusBadge(dimona.status)
          ) : (
            // Other roles can change status
            <StatusDropdownWithModal
              dimonaId={dimona.id}
              currentStatus={dimona.status}
              onStatusChanged={handleStatusChanged(dimona.id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <PageHeader
        title={hasRole("ROLE_COMPANY") ? "Mes Déclarations Dimona" : "Déclarations Dimona"}
        description={
          hasRole("ROLE_COMPANY")
            ? `Gérez les déclarations Dimona pour les employés de ${user?.companyName || 'votre entreprise'}`
            : "Gérez les déclarations Dimona pour vos employés"
        }
        onExport={() => {}}
        addNewButton={{
          label: "Nouvelle déclaration",
          route: ROUTES.CREATE_DIMONA,
        }}
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher par nom, entreprise ou référence..."
      />

      <div className="mt-6">
        <DataTable
          data={filteredDimonas}
          columns={columns}
          loading={loading}
          detailsRoute={ROUTES.DIMONA_DETAILS}
          detailsButtonLabel="Voir détails"
        />
      </div>
    </div>
  );
}
