// src/pages/DimonaPage.tsx
import { useState } from "react";
import { Plus, Search, Download, ArrowDownUp } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Import data and utils
import { demoDimonas, DimonaType, DimonaStatus } from "@/data/mockData";
import { getStatusBadge, getTypeBadge } from "@/utils/dimonaUtils";

export function DimonaPage() {
  const [dimonas] = useState(demoDimonas);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Filter declarations based on search term and filters
  const filteredDimonas = dimonas.filter((dimona) => {
    // Search filter
    const matchesSearch =
      dimona.employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dimona.employee.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dimona.entreprise.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dimona.refNumber.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      dimona.statut.toLowerCase() === statusFilter.toLowerCase();

    // Type filter
    const matchesType =
      typeFilter === "all" ||
      dimona.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  // Count by status for badges
  const statusCounts = dimonas.reduce((acc, dimona) => {
    acc[dimona.statut] = (acc[dimona.statut] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Déclarations Dimona
          </h1>
          <p className="text-slate-500">
            Gérez les déclarations Dimona pour vos employés
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
            <Plus className="mr-2 h-4 w-4" /> Nouvelle déclaration
          </Button>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher par nom, entreprise ou référence..."
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
              <SelectItem value="accepted">Acceptée</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="rejected">Rejetée</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] border-slate-200 focus:ring-blue-500 bg-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="in">Entrée</SelectItem>
              <SelectItem value="out">Sortie</SelectItem>
              <SelectItem value="update">Modification</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dimonas Table */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="text-blue-700 font-medium">
                  Référence
                </TableHead>
                <TableHead className="text-blue-700 font-medium">
                  Employé
                </TableHead>
                <TableHead className="text-blue-700 font-medium hidden md:table-cell">
                  Entreprise
                </TableHead>
                <TableHead className="text-blue-700 font-medium">
                  Type
                </TableHead>
                <TableHead className="text-blue-700 font-medium hidden md:table-cell">
                  Date de déclaration
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
              {filteredDimonas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-slate-300 mb-2" />
                      <p>Aucune déclaration trouvée</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Essayez de modifier vos critères de recherche
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDimonas.map((dimona) => (
                  <TableRow
                    key={dimona.id}
                    className="hover:bg-slate-50 border-b border-slate-100 group"
                  >
                    <TableCell className="font-mono text-blue-800 group-hover:text-blue-600 transition-colors">
                      {dimona.refNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        to={`/personnel/${dimona.employee.id}`}
                        className="text-slate-700 hover:text-blue-600"
                      >
                        {dimona.employee.prenom} {dimona.employee.nom}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Link
                        to={`/entreprises/${dimona.entreprise.id}`}
                        className="text-slate-600 hover:text-blue-600"
                      >
                        {dimona.entreprise.nom}
                      </Link>
                    </TableCell>
                    <TableCell>{getTypeBadge(dimona.type)}</TableCell>
                    <TableCell className="hidden md:table-cell text-slate-600">
                      {dimona.dateDeclaration}
                    </TableCell>
                    <TableCell>{getStatusBadge(dimona.statut)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                      >
                        <Link to={`/dimona/${dimona.id}`}>Voir détails</Link>
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
