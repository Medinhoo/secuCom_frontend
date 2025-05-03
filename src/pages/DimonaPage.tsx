import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { DimonaDto } from "@/types/DimonaTypes";
import { dimonaService } from "@/services/api/dimonaService";
import { getStatusBadge, getTypeBadge } from "@/utils/dimonaUtils";
import { ROUTES } from "@/config/routes.config";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import { DataTable, Column } from "@/components/layout/DataTable";

export function DimonaPage() {
  const { user, hasRole } = useAuth();
  const [dimonas, setDimonas] = useState<DimonaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDimonas = async () => {
      try {
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

    fetchDimonas();
  }, [user, hasRole]);

  // Filter declarations based on search term
  const filteredDimonas = dimonas.filter((dimona) => {
    const matchesSearch = dimona.onssReference
      ? dimona.onssReference.toLowerCase().includes(searchTerm.toLowerCase())
      : searchTerm === "";

    return matchesSearch;
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
        <Link
          to={ROUTES.COLLABORATOR_DETAILS(dimona.collaboratorId)}
          className="text-slate-700 hover:text-blue-600"
        >
          Voir collaborateur
        </Link>
      ),
    },
    {
      header: "Entreprise",
      accessor: (dimona) => (
        <Link
          to={ROUTES.COMPANY_DETAILS(dimona.companyId)}
          className="text-slate-600 hover:text-blue-600"
        >
          Voir entreprise
        </Link>
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
      accessor: (dimona) => getStatusBadge(dimona.status),
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
          onDelete={async (id) => {
            try {
              await dimonaService.deleteDimona(id);
              setDimonas((prev) => prev.filter((d) => d.id !== id));
              toast.success("Demande de Dimona supprimée avec succès");
            } catch (error) {
              toast.error("Échec de la suppression de la demande de Dimona");
              console.error(error);
              throw error;
            }
          }}
          detailsRoute={ROUTES.DIMONA_DETAILS}
          detailsButtonLabel="Voir détails"
        />
      </div>
    </div>
  );
}
