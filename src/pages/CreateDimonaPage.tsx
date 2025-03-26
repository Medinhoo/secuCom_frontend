import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/layout/LoadingSpinner";

import { dimonaService } from "@/services/api/dimonaService";
import { companyService } from "@/services/api/companyService";
import { collaboratorService } from "@/services/api/collaboratorService";
import { CreateDimonaRequest, DimonaType } from "@/types/DimonaTypes";
import type { CompanyDto } from "@/types/CompanyTypes";
import type { Collaborator } from "@/types/CollaboratorTypes";
import { ROUTES } from "@/config/routes.config";

export function CreateDimonaPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<CreateDimonaRequest>({
    type: DimonaType.IN,
    entryDate: new Date(),
    exitDate: new Date(),
    collaboratorId: "",
    companyId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesData, collaboratorsData] = await Promise.all([
          companyService.getAllCompanies(),
          collaboratorService.getAllCollaborators(),
        ]);
        setCompanies(companiesData);
        setCollaborators(collaboratorsData);
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dimonaService.createDimona(formData);
      toast.success("Déclaration Dimona créée avec succès");
      navigate(ROUTES.DIMONA);
    } catch (error) {
      toast.error("Erreur lors de la création de la déclaration");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateDimonaRequest,
    value: string | DimonaType | Date
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Nouvelle déclaration Dimona
          </h1>
          <p className="text-slate-500">
            Créez une nouvelle déclaration Dimona pour un collaborateur
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.DIMONA)}
          className="bg-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations de la déclaration</CardTitle>
            <CardDescription>
              Remplissez les informations nécessaires pour la déclaration Dimona
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type de déclaration</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleInputChange("type", value as DimonaType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DimonaType.IN}>Entrée</SelectItem>
                  <SelectItem value={DimonaType.OUT}>Sortie</SelectItem>
                  <SelectItem value={DimonaType.UPDATE}>
                    Modification
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryDate">Date d'entrée</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={
                    new Date(formData.entryDate).toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    handleInputChange("entryDate", new Date(e.target.value))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exitDate">Date de sortie</Label>
                <Input
                  id="exitDate"
                  type="date"
                  value={
                    new Date(formData.exitDate).toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    handleInputChange("exitDate", new Date(e.target.value))
                  }
                  required
                />
              </div>
            </div>

            {/* Exit Reason (only for OUT type) */}
            {formData.type === DimonaType.OUT && (
              <div className="space-y-2">
                <Label htmlFor="exitReason">Raison de sortie</Label>
                <Input
                  id="exitReason"
                  value={formData.exitReason || ""}
                  onChange={(e) =>
                    handleInputChange("exitReason", e.target.value)
                  }
                  placeholder="Raison de la sortie"
                />
              </div>
            )}

            {/* Collaborator and Company Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collaboratorId">Collaborateur</Label>
                <Select
                  value={formData.collaboratorId}
                  onValueChange={(value) =>
                    handleInputChange("collaboratorId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un collaborateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {collaborators.map((collaborator) => (
                      <SelectItem key={collaborator.id} value={collaborator.id}>
                        {collaborator.firstName} {collaborator.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyId">Entreprise</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) =>
                    handleInputChange("companyId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.DIMONA)}
                type="button"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Création en cours..." : "Créer la déclaration"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
