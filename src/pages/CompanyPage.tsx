import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { companyService } from "@/services/api/companyService";
import type { CompanyDto } from "@/types/CompanyTypes";
import { ROUTES } from "@/config/routes.config";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import { DataTable, Column } from "@/components/layout/DataTable";

// Helper function to get sector color (kept as is)
const getSectorLightColor = (sector: string | undefined) => {
  if (!sector) return "bg-slate-100 text-slate-700";

  const sectorColors: Record<string, string> = {
    Construction: "bg-blue-100 text-blue-700",
    Transport: "bg-green-100 text-green-700",
    Horeca: "bg-yellow-100 text-yellow-700",
    Commerce: "bg-purple-100 text-purple-700",
    Services: "bg-pink-100 text-pink-700",
  };

  return sectorColors[sector] || "bg-slate-100 text-slate-700";
};

export function CompanyPage() {
  const { user, hasRole } = useAuth();
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch companies based on user role
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // If user has ROLE_COMPANY, fetch only their company
        if (hasRole("ROLE_COMPANY") && user?.companyId) {
          const data = await companyService.getCompanyById(user.companyId);
          setCompanies([data]); // Set as array with single company
        } else {
          // For other roles, fetch all companies
          const data = await companyService.getAllCompanies();
          setCompanies(data);
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des entreprises", {
          description: "Veuillez réessayer plus tard",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [user, hasRole]);

  // Filter companies based on search term
  const filteredCompanies = companies.filter(
    (company) =>
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.activitySector
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      company.vatNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.bceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Define table columns with flexible widths
  const columns: Column<CompanyDto>[] = [
    {
      header: "Nom de l'entreprise",
      accessor: (company) => (
        <div className="flex flex-col">
          <div className="font-medium text-blue-800 hover:text-blue-600 transition-colors">
            {company.name}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>BCE: {company.bceNumber}</span>
            <span>•</span>
            <span>TVA: {company.vatNumber || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (company) => (
        <div className="flex flex-col text-sm">
          <span className="text-slate-600">{company.email || "—"}</span>
          <span className="text-slate-500">{company.phoneNumber || "—"}</span>
        </div>
      ),
    },
    {
      header: "N° ONSS",
      accessor: (company) => (
        <span className="font-mono text-sm text-slate-600">
          {company.onssNumber || "N/A"}
        </span>
      ),
      className: "font-mono",
    },
    {
      header: "Forme juridique",
      accessor: (company) => (
        <div className="flex flex-col">
          <span className="text-slate-700">{company.legalForm || "N/A"}</span>
          {company.creationDate && (
            <span className="text-xs text-slate-500">
              Créé le{" "}
              {new Date(company.creationDate).toLocaleDateString("fr-BE")}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Secteur & CP",
      accessor: (company) => (
        <div className="flex flex-col gap-2">
          <Badge className={getSectorLightColor(company.activitySector)}>
            {company.activitySector || "N/A"}
          </Badge>
          <div className="flex flex-wrap gap-1">
            {company.jointCommittees?.map((committee, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {committee}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <PageHeader
        title={hasRole("ROLE_COMPANY") ? "Mon Entreprise" : "Entreprises"}
        description={
          hasRole("ROLE_COMPANY")
            ? `Gérez les informations de ${user?.companyName || 'votre entreprise'}`
            : "Gérez les entrepries enregistrées dans le secrétariat social"
        }
        onExport={() => {}}
        addNewButton={{
          label: "Ajouter une entreprise",
          route: ROUTES.COMPANY_CREATE,
        }}
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher par nom, secteur, BCE ou numéro TVA..."
      />

      <div className="mt-6">
        <DataTable
          data={filteredCompanies}
          columns={columns}
          loading={loading}
          onDelete={async (id) => {
            try {
              await companyService.deleteCompany(id);
              setCompanies((prev) => prev.filter((c) => c.id !== id));
              toast.success("Entreprise supprimée avec succès");
            } catch (error) {
              toast.error("Échec de la suppression de l'entreprise");
              console.error(error);
              throw error;
            }
          }}
          detailsRoute={ROUTES.COMPANY_DETAILS}
          detailsButtonLabel="Détails"
        />
      </div>
    </div>
  );
}
