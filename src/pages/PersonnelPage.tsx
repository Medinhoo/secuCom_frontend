// src/pages/PersonnelPage.tsx
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Personnel</h1>
        <Button onClick={() => console.log("Create new employee")}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un employé
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste du personnel</CardTitle>
          <CardDescription>
            Gérez les employés enregistrés dans le secrétariat social
          </CardDescription>
          <div className="flex mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, prénom, poste ou entreprise..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">
                  Entreprise
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Aucun employé trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.nom}
                    </TableCell>
                    <TableCell>{employee.prenom}</TableCell>
                    <TableCell>{employee.poste}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {employee.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {employee.entrepriseNom}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm" asChild>
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
