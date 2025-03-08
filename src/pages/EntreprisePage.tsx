// src/pages/EntreprisePage.tsx
import { useState } from "react";
import { Plus, Search, Download, Eye } from "lucide-react";
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

// Import data from mockData file
import {
  demoEntreprises,
  getSectorLightColor,
  Entreprise,
} from "@/data/mockData";

export function EntreprisePage() {
  const [entreprises] = useState<Entreprise[]>(demoEntreprises);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter enterprises based on search term
  const filteredEntreprises = entreprises.filter(
    (entreprise) =>
      entreprise.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entreprise.secteurActivite
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      entreprise.numeroTVA.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get sector counts for tabs
  const sectorCounts = entreprises.reduce((acc, entreprise) => {
    const sector = entreprise.secteurActivite;
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Entreprises
          </h1>
          <p className="text-slate-500">
            Gérez les entreprises enregistrées dans le secrétariat social
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
            <Plus className="mr-2 h-4 w-4" /> Ajouter une entreprise
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher une entreprise, un secteur, un n° TVA..."
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
              {entreprises.length}
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
                      Entreprise
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      TVA
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      Secteur
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      Employés
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntreprises.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-slate-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Search className="h-10 w-10 text-slate-300 mb-2" />
                          <p>Aucune entreprise trouvée</p>
                          <p className="text-sm text-slate-400 mt-1">
                            Essayez de modifier vos critères de recherche
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntreprises.map((entreprise) => (
                      <TableRow
                        key={entreprise.id}
                        className="hover:bg-slate-50 border-b border-slate-100 group"
                      >
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                              {entreprise.nom}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {entreprise.adresse}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-600">
                          {entreprise.numeroTVA}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getSectorLightColor(
                              entreprise.secteurActivite
                            )}`}
                          >
                            {entreprise.secteurActivite}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium">
                              {entreprise.employesCount}
                            </div>
                            <div className="ml-2 w-16 bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((entreprise.employesCount || 0) / 30) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                          >
                            <Link to={`/entreprises/${entreprise.id}`}>
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
                        Entreprise
                      </TableHead>
                      <TableHead className="text-blue-700 font-medium">
                        TVA
                      </TableHead>
                      <TableHead className="text-blue-700 font-medium">
                        Secteur
                      </TableHead>
                      <TableHead className="text-blue-700 font-medium">
                        Employés
                      </TableHead>
                      <TableHead className="text-blue-700 font-medium text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntreprises
                      .filter((e) => e.secteurActivite === sector)
                      .map((entreprise) => (
                        <TableRow
                          key={entreprise.id}
                          className="hover:bg-slate-50 border-b border-slate-100 group"
                        >
                          <TableCell className="py-4">
                            <div className="flex flex-col">
                              <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                                {entreprise.nom}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {entreprise.adresse}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-slate-600">
                            {entreprise.numeroTVA}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${getSectorLightColor(
                                entreprise.secteurActivite
                              )}`}
                            >
                              {entreprise.secteurActivite}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium">
                                {entreprise.employesCount}
                              </div>
                              <div className="ml-2 w-16 bg-slate-100 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      ((entreprise.employesCount || 0) / 30) *
                                        100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              asChild
                              className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                            >
                              <Link to={`/entreprises/${entreprise.id}`}>
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
