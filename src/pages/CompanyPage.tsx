// src/pages/CompanyPage.tsx
import { useState, useEffect } from "react";
import { Plus, Search, Download, Eye, Loader2 } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { companyService } from "@/services/api/companyService";
import type { CompanyDto } from "@/types/CompanyTypes";

// Helper function to get sector color
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
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await companyService.getAllCompanies();
        setCompanies(data);
      } catch (error) {
        toast.error("Erreur lors du chargement des entreprises", {
          description: "Veuillez réessayer plus tard",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

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

  // Get sector counts for tabs
  const sectorCounts = companies.reduce((acc, company) => {
    const sector = company.activitySector;
    if (sector) {
      acc[sector] = (acc[sector] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Companies
          </h1>
          <p className="text-slate-500">
            Gérez les companies enregistrées dans le secrétariat social
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
            <Plus className="mr-2 h-4 w-4" /> Ajouter une company
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher par nom, secteur, BCE ou numéro TVA..."
            className="pl-9 py-2 border-slate-200 rounded-md bg-white shadow-sm focus-visible:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs for sectors */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="mt-6">
        <TabsList className="bg-white p-1 rounded-lg mb-4 shadow-sm">
          <TabsTrigger
            value="all"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            Tous
            <Badge
              variant="secondary"
              className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              {companies.length}
            </Badge>
          </TabsTrigger>
          {Object.entries(sectorCounts).map(([sector, count]) => (
            <TabsTrigger
              key={sector}
              value={sector}
              className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              {sector}
              <Badge
                variant="secondary"
                className={`ml-2 ${getSectorLightColor(sector)}`}
              >
                {count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="text-blue-700 font-medium">
                      Nom de l'entreprise
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      Contact
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      N° ONSS
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      Forme juridique
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      Secteur & CP
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      Formule
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-slate-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Search className="h-10 w-10 text-slate-300 mb-2" />
                          <p>Aucune company trouvée</p>
                          <p className="text-sm text-slate-400 mt-1">
                            Essayez de modifier vos critères de recherche
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow
                        key={company.id}
                        className="hover:bg-slate-50 border-b border-slate-100 group"
                      >
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                              {company.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>BCE: {company.bceNumber}</span>
                              <span>•</span>
                              <span>TVA: {company.vatNumber || "N/A"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="text-slate-600">
                              {company.email || "—"}
                            </span>
                            <span className="text-slate-500">
                              {company.phoneNumber || "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-600">
                          {company.onssNumber || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-slate-700">
                              {company.legalForm || "N/A"}
                            </span>
                            {company.creationDate && (
                              <span className="text-xs text-slate-500">
                                Créé le{" "}
                                {new Date(
                                  company.creationDate
                                ).toLocaleDateString("fr-BE")}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Badge
                              className={`${getSectorLightColor(
                                company.activitySector
                              )}`}
                            >
                              {company.activitySector || "N/A"}
                            </Badge>
                            <div className="flex flex-wrap gap-1">
                              {company.jointCommittees?.map(
                                (committee, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {committee}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-700"
                          >
                            {company.subscriptionFormula || "Standard"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                          >
                            <Link to={`/companies/${company.id}`}>
                              <Eye className="h-4 w-4 mr-2" /> Détails
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

        {/* Tabs for each sector */}
        {Object.keys(sectorCounts).map((sector) => (
          <TabsContent key={sector} value={sector} className="mt-0">
            <Card className="border-0 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                      <TableHead className="text-blue-700 font-medium">
                        Nom de l'entreprise
                      </TableHead>
                      <TableHead className="text-blue-700 font-medium">
                        Contact
                      </TableHead>
                      <TableHead className="text-blue-700 font-medium">
                        N° ONSS
                      </TableHead>
                      <TableHead className="text-blue-700 font-medium">
                        Forme juridique
                      </TableHead>
                      <TableHead className="text-blue-700 font-medium">
                        Secteur & CP
                      </TableHead>
                      <TableHead className="text-blue-700 font-medium">
                        Formule
                      </TableHead>
                      <TableHead className="text-blue-700 font-medium text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies
                      .filter((company) => company.activitySector === sector)
                      .map((company) => (
                        <TableRow
                          key={company.id}
                          className="hover:bg-slate-50 border-b border-slate-100 group"
                        >
                          <TableCell className="py-4">
                            <div className="flex flex-col">
                              <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                                {company.name}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                <span>BCE: {company.bceNumber}</span>
                                <span>•</span>
                                <span>TVA: {company.vatNumber || "N/A"}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span className="text-slate-600">
                                {company.email || "—"}
                              </span>
                              <span className="text-slate-500">
                                {company.phoneNumber || "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-slate-600">
                            {company.onssNumber || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-slate-700">
                                {company.legalForm || "N/A"}
                              </span>
                              {company.creationDate && (
                                <span className="text-xs text-slate-500">
                                  Créé le{" "}
                                  {new Date(
                                    company.creationDate
                                  ).toLocaleDateString("fr-BE")}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              <Badge
                                className={`${getSectorLightColor(
                                  company.activitySector
                                )}`}
                              >
                                {company.activitySector}
                              </Badge>
                              <div className="flex flex-wrap gap-1">
                                {company.jointCommittees?.map(
                                  (committee, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {committee}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700"
                            >
                              {company.subscriptionFormula || "Standard"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              asChild
                              className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                            >
                              <Link to={`/companies/${company.id}`}>
                                <Eye className="h-4 w-4 mr-2" /> Détails
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
