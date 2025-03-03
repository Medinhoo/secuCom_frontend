// src/pages/EmployeePage.tsx
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

// Type for Employee
interface Employee {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  email: string;
  dateEmbauche: string;
  telephone: string;
  entrepriseId: string;
  entrepriseNom: string;
}

// Sample data for demonstration
const demoEmployees: Employee[] = [
  {
    id: "emp1",
    nom: "Dubois",
    prenom: "Jean",
    poste: "Développeur Senior",
    email: "jean.dubois@techsolutions.be",
    dateEmbauche: "15/03/2020",
    telephone: "+32 470 12 34 56",
    entrepriseId: "123e4567-e89b-12d3-a456-426614174000",
    entrepriseNom: "TechSolutions SPRL",
  },
  {
    id: "emp2",
    nom: "Martin",
    prenom: "Sophie",
    poste: "Designer UX",
    email: "sophie.martin@techsolutions.be",
    dateEmbauche: "21/09/2021",
    telephone: "+32 471 23 45 67",
    entrepriseId: "123e4567-e89b-12d3-a456-426614174000",
    entrepriseNom: "TechSolutions SPRL",
  },
  {
    id: "emp3",
    nom: "Laurent",
    prenom: "Michel",
    poste: "Chef de chantier",
    email: "michel.laurent@construction-dupont.be",
    dateEmbauche: "03/05/2018",
    telephone: "+32 472 34 56 78",
    entrepriseId: "223e4567-e89b-12d3-a456-426614174001",
    entrepriseNom: "Construction Dupont SA",
  },
  {
    id: "emp4",
    nom: "Leroy",
    prenom: "Émilie",
    poste: "Comptable",
    email: "emilie.leroy@mediascom.be",
    dateEmbauche: "12/01/2022",
    telephone: "+32 473 45 67 89",
    entrepriseId: "523e4567-e89b-12d3-a456-426614174004",
    entrepriseNom: "Média & Communications",
  },
  {
    id: "emp5",
    nom: "Petit",
    prenom: "Thomas",
    poste: "Chauffeur",
    email: "thomas.petit@transportsexpress.be",
    dateEmbauche: "07/08/2019",
    telephone: "+32 474 56 78 90",
    entrepriseId: "423e4567-e89b-12d3-a456-426614174003",
    entrepriseNom: "Transports Express",
  },
  {
    id: "emp6",
    nom: "Dupont",
    prenom: "Claire",
    poste: "Chef cuisinière",
    email: "claire.dupont@resto-gourmand.be",
    dateEmbauche: "22/11/2020",
    telephone: "+32 475 67 89 01",
    entrepriseId: "323e4567-e89b-12d3-a456-426614174002",
    entrepriseNom: "Resto Gourmand",
  },
];

export function PersonnelPage() {
  const [employees] = useState<Employee[]>(demoEmployees);
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
