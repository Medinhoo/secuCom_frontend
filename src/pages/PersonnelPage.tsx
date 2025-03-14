// src/pages/PersonnelPage.tsx
import { useState } from "react";
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

// Import data from mockData file
import { getEmployeesWithCompanyName, Employee } from "@/data/mockData";

// Type for employee with company name
type EmployeeWithCompany = Employee & { entrepriseNom: string };

export function PersonnelPage() {
  // Get employees with company name from mock data
  const [employees] = useState<EmployeeWithCompany[]>(
    getEmployeesWithCompanyName()
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.entrepriseNom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group employees by poste for stats
  const positionCounts = employees.reduce((acc, employee) => {
    const position = employee.poste;
    acc[position] = (acc[position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Personnel
          </h1>
          <p className="text-slate-500">
            Gérez les employés enregistrés dans le secrétariat social
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
            <Plus className="mr-2 h-4 w-4" /> Ajouter un employé
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher un employé, un poste, une entreprise..."
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
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-slate-300 mb-2" />
                      <p>Aucun employé trouvé</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Essayez de modifier vos critères de recherche
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="hover:bg-slate-50 border-b border-slate-100 group"
                  >
                    <TableCell className="py-4">
                      <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                        {employee.nom}
                      </div>
                    </TableCell>
                    <TableCell>{employee.prenom}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Briefcase className="h-3 w-3 text-slate-400 mr-1" />
                        <span>{employee.poste}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 text-slate-400 mr-1" />
                        <span className="text-slate-600">{employee.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        <Building className="h-3 w-3 text-slate-400 mr-1" />
                        <Link
                          to={`/entreprises/${employee.entrepriseId}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {employee.entrepriseNom}
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
                        <Link to={`/personnel/${employee.id}`}>
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
