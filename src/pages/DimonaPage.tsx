// src/pages/DimonaPage.tsx
import { useState } from "react";
import { Plus, Search } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Déclarations Dimona
        </h1>
        <Button onClick={() => console.log("Create new Dimona")}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle déclaration
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des déclarations</CardTitle>
          <CardDescription>
            Gérez les déclarations Dimona pour vos employés
          </CardDescription>
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, entreprise ou référence..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
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
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="in">Entrée</SelectItem>
                  <SelectItem value="out">Sortie</SelectItem>
                  <SelectItem value="update">Modification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Employé</TableHead>
                <TableHead className="hidden md:table-cell">
                  Entreprise
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">
                  Date de déclaration
                </TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDimonas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Aucune déclaration trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredDimonas.map((dimona) => (
                  <TableRow key={dimona.id}>
                    <TableCell className="font-medium">
                      {dimona.refNumber}
                    </TableCell>
                    <TableCell>
                      {dimona.employee.prenom} {dimona.employee.nom}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {dimona.entreprise.nom}
                    </TableCell>
                    <TableCell>{getTypeBadge(dimona.type)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {dimona.dateDeclaration}
                    </TableCell>
                    <TableCell>{getStatusBadge(dimona.statut)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm" asChild>
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
