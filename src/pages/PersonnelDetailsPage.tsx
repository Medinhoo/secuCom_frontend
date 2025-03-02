import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Save, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Types
interface Employee {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  email: string;
  dateEmbauche: string;
}

// Sample employees
const demoEmployees: Record<string, Employee> = {
  emp1: {
    id: "emp1",
    nom: "Dubois",
    prenom: "Jean",
    poste: "Développeur Senior",
    email: "jean.dubois@techsolutions.be",
    dateEmbauche: "15/03/2020",
  },
  emp2: {
    id: "emp2",
    nom: "Martin",
    prenom: "Sophie",
    poste: "Designer UX",
    email: "sophie.martin@techsolutions.be",
    dateEmbauche: "21/09/2021",
  },
};

export function PersonnelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Employee | null>(null);

  useEffect(() => {
    if (id) {
      const foundEmployee = demoEmployees[id];
      if (foundEmployee) {
        setEmployee(foundEmployee);
        setFormData(foundEmployee);
      } else {
        navigate("/personnel");
      }
    }
  }, [id, navigate]);

  if (!employee || !formData) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = () => {
    if (formData) {
      setEmployee(formData);
      setEditMode(false);
      console.log("Saving employee:", formData);
    }
  };

  const handleCancel = () => {
    setFormData(employee);
    setEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/personnel")}
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {employee.nom} {employee.prenom}
        </h1>
      </div>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div>
            <CardTitle>Informations personnel</CardTitle>
            <CardDescription>Détails sur l'employé</CardDescription>
          </div>
          {!editMode ? (
            <Button onClick={() => setEditMode(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" /> Modifier
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave} size="sm" variant="default">
                <Save className="h-4 w-4 mr-2" /> Enregistrer
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline">
                <X className="h-4 w-4 mr-2" /> Annuler
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {editMode ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poste">Poste</Label>
                  <Input
                    id="poste"
                    name="poste"
                    value={formData.poste}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Nom
                  </h3>
                  <p className="text-lg">{employee.nom}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Prénom
                  </h3>
                  <p className="text-lg">{employee.prenom}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Poste
                  </h3>
                  <p className="text-lg">{employee.poste}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </h3>
                  <p className="text-lg">{employee.email}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
