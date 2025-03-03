// src/pages/EntreprisePage.tsx
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

// Type for Entreprise
interface Entreprise {
  id: string;
  nom: string;
  adresse: string;
  numeroTVA: string;
  secteurActivite: string;
  utilisateurId: string;
}

// Sample data for demonstration
const demoEntreprises: Entreprise[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    nom: "TechSolutions SPRL",
    adresse: "15 Rue de la Loi, 1000 Bruxelles",
    numeroTVA: "BE0123456789",
    secteurActivite: "Informatique",
    utilisateurId: "987e6543-e21b-12d3-a456-426614174111",
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    nom: "Construction Dupont SA",
    adresse: "24 Avenue Louise, 1050 Bruxelles",
    numeroTVA: "BE0987654321",
    secteurActivite: "Construction",
    utilisateurId: "887e6543-e21b-12d3-a456-426614174112",
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174002",
    nom: "Resto Gourmand",
    adresse: "8 Place du Marché, 4000 Liège",
    numeroTVA: "BE0567891234",
    secteurActivite: "Restauration",
    utilisateurId: "787e6543-e21b-12d3-a456-426614174113",
  },
  {
    id: "423e4567-e89b-12d3-a456-426614174003",
    nom: "Transports Express",
    adresse: "112 Chaussée de Namur, 5000 Namur",
    numeroTVA: "BE0345678912",
    secteurActivite: "Transport",
    utilisateurId: "687e6543-e21b-12d3-a456-426614174114",
  },
  {
    id: "523e4567-e89b-12d3-a456-426614174004",
    nom: "Média & Communications",
    adresse: "45 Boulevard Anspach, 1000 Bruxelles",
    numeroTVA: "BE0234567891",
    secteurActivite: "Médias",
    utilisateurId: "587e6543-e21b-12d3-a456-426614174115",
  },
];

export function EntreprisePage() {
  const [entreprises] = useState<Entreprise[]>(demoEntreprises);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter enterprises based on search term
  const filteredEntreprises = entreprises.filter(
    (entreprise) =>
      entreprise.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entreprise.secteurActivite
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      entreprise.numeroTVA.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Entreprises</h1>
        <Button onClick={() => console.log("Create new entreprise")}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une entreprise
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des entreprises</CardTitle>
          <CardDescription>
            Gérez les entreprises enregistrées dans le secrétariat social
          </CardDescription>
          <div className="flex mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, secteur ou TVA..."
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
                <TableHead>N° TVA</TableHead>
                <TableHead className="hidden md:table-cell">
                  Secteur d'activité
                </TableHead>
                <TableHead className="hidden md:table-cell">Adresse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntreprises.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Aucune entreprise trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntreprises.map((entreprise) => (
                  <TableRow key={entreprise.id}>
                    <TableCell className="font-medium">
                      {entreprise.nom}
                    </TableCell>
                    <TableCell>{entreprise.numeroTVA}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {entreprise.secteurActivite}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {entreprise.adresse}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm" asChild>
                        <Link to={`/clients/${entreprise.id}`}>
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
