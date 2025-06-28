import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Calendar, User, Building } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { dimonaService, UpdateDimonaRequest } from "@/services/api/dimonaService";
import { collaboratorService } from "@/services/api/collaboratorService";
import { DimonaDto, DimonaType } from "@/types/DimonaTypes";
import { ROUTES } from "@/config/routes.config";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import type { Collaborator } from "@/types/CollaboratorTypes";

export function EditDimonaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  const [dimona, setDimona] = useState<DimonaDto | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type: "",
    entryDate: "",
    exitDate: "",
    exitReason: "",
    collaboratorId: "",
    onssReference: "",
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        const [dimonaData, collaboratorsData] = await Promise.all([
          dimonaService.getDimona(id),
          user?.companyId ? collaboratorService.getCollaboratorsByCompany(user.companyId) : []
        ]);
        
        setDimona(dimonaData);
        setCollaborators(collaboratorsData || []);
        
        // Initialize form with current dimona data
        setFormData({
          type: dimonaData.type,
          entryDate: new Date(dimonaData.entryDate).toISOString().split('T')[0],
          exitDate: new Date(dimonaData.exitDate).toISOString().split('T')[0],
          exitReason: dimonaData.exitReason || "",
          collaboratorId: dimonaData.collaboratorId,
          onssReference: dimonaData.onssReference,
        });
        
      } catch (error) {
        toast.error("Erreur lors du chargement de la déclaration");
        navigate(ROUTES.DIMONA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.companyId, navigate]);

  // Check if user can edit this dimona
  const canEdit = hasRole("ROLE_COMPANY") && 
    (user?.companyId === dimona?.companyId || user?.isCompanyContact);

  useEffect(() => {
    if (dimona && !canEdit) {
      toast.error("Vous n'avez pas l'autorisation de modifier cette déclaration");
      navigate(ROUTES.DIMONA_DETAILS(dimona.id));
    }
  }, [dimona, canEdit, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation errors when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }

    // Validate dates in real-time
    if (field === 'entryDate' || field === 'exitDate') {
      validateDates(field === 'entryDate' ? value : formData.entryDate, field === 'exitDate' ? value : formData.exitDate);
    }
  };

  const validateDates = (entryDate: string, exitDate: string) => {
    const errors: {[key: string]: string} = {};
    
    if (entryDate && exitDate) {
      const entry = new Date(entryDate);
      const exit = new Date(exitDate);
      
      if (exit <= entry) {
        errors.exitDate = "La date de sortie doit être ultérieure à la date d'entrée";
      }
    }
    
    setValidationErrors(prev => ({
      ...prev,
      ...errors
    }));
    
    return Object.keys(errors).length === 0;
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Validate required fields
    if (!formData.type) errors.type = "Le type de déclaration est requis";
    if (!formData.collaboratorId) errors.collaboratorId = "L'employé est requis";
    if (!formData.entryDate) errors.entryDate = "La date d'entrée est requise";
    if (!formData.exitDate) errors.exitDate = "La date de sortie est requise";
    if (!formData.onssReference) errors.onssReference = "La référence ONSS est requise";
    
    // Validate dates
    if (formData.entryDate && formData.exitDate) {
      const entry = new Date(formData.entryDate);
      const exit = new Date(formData.exitDate);
      
      if (exit <= entry) {
        errors.exitDate = "La date de sortie doit être ultérieure à la date d'entrée";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !dimona) return;

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    
    try {
      setSaving(true);
      
      const updateRequest: UpdateDimonaRequest = {
        type: formData.type,
        entryDate: formData.entryDate,
        exitDate: formData.exitDate,
        exitReason: formData.exitReason || undefined,
        collaboratorId: formData.collaboratorId,
        companyId: dimona.companyId, // Keep the same company
        onssReference: formData.onssReference,
      };
      
      await dimonaService.updateDimona(id, updateRequest);
      
      toast.success("Déclaration modifiée avec succès");
      navigate(ROUTES.DIMONA_DETAILS(id));
      
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors de la modification de la déclaration");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!dimona || !canEdit) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-semibold mb-2">Accès non autorisé</h2>
        <p className="text-slate-500 mb-4">
          Vous n'avez pas l'autorisation de modifier cette déclaration.
        </p>
        <Button onClick={() => navigate(ROUTES.DIMONA)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux déclarations
        </Button>
      </div>
    );
  }

  const selectedCollaborator = collaborators.find(c => c.id === formData.collaboratorId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Modifier la déclaration Dimona
          </h1>
          <p className="text-slate-500">
            Référence: {dimona.onssReference}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.DIMONA_DETAILS(dimona.id))}
            className="bg-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Annuler
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations de la déclaration
            </CardTitle>
            <CardDescription>
              Modifiez les informations de la déclaration Dimona
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type de déclaration</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DimonaType.IN}>Entrée (IN)</SelectItem>
                    <SelectItem value={DimonaType.OUT}>Sortie (OUT)</SelectItem>
                    <SelectItem value={DimonaType.UPDATE}>Modification (UPDATE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Collaborator */}
              <div className="space-y-2">
                <Label htmlFor="collaboratorId">Employé</Label>
                <Select value={formData.collaboratorId} onValueChange={(value) => handleInputChange('collaboratorId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
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

              {/* Entry Date */}
              <div className="space-y-2">
                <Label htmlFor="entryDate">Date d'entrée</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="entryDate"
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => handleInputChange('entryDate', e.target.value)}
                    className={`pl-10 ${validationErrors.entryDate ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {validationErrors.entryDate && (
                  <p className="text-sm text-red-600">{validationErrors.entryDate}</p>
                )}
              </div>

              {/* Exit Date */}
              <div className="space-y-2">
                <Label htmlFor="exitDate">Date de sortie</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="exitDate"
                    type="date"
                    value={formData.exitDate}
                    onChange={(e) => handleInputChange('exitDate', e.target.value)}
                    className={`pl-10 ${validationErrors.exitDate ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {validationErrors.exitDate && (
                  <p className="text-sm text-red-600">{validationErrors.exitDate}</p>
                )}
              </div>

              {/* ONSS Reference */}
              <div className="space-y-2">
                <Label htmlFor="onssReference">Référence ONSS</Label>
                <Input
                  id="onssReference"
                  type="text"
                  value={formData.onssReference}
                  onChange={(e) => handleInputChange('onssReference', e.target.value)}
                  placeholder="Référence ONSS"
                  required
                />
              </div>
            </div>

            {/* Exit Reason */}
            {formData.type === DimonaType.OUT && (
              <div className="space-y-2">
                <Label htmlFor="exitReason">Raison de sortie</Label>
                <Textarea
                  id="exitReason"
                  value={formData.exitReason}
                  onChange={(e) => handleInputChange('exitReason', e.target.value)}
                  placeholder="Indiquez la raison de la sortie..."
                  rows={3}
                />
              </div>
            )}

            {/* Selected Collaborator Info */}
            {selectedCollaborator && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Employé sélectionné</h4>
                    <p className="text-sm text-blue-700">
                      {selectedCollaborator.firstName} {selectedCollaborator.lastName}
                    </p>
                    {selectedCollaborator.jobFunction && (
                      <p className="text-xs text-blue-600">
                        Fonction: {selectedCollaborator.jobFunction}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.DIMONA_DETAILS(dimona.id))}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}
