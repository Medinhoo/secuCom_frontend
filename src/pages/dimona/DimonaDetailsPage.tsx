import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Clock, Info, CheckCircle, Edit, AlertCircle, Save, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import { dimonaService } from "@/services/api/dimonaService";
import { DimonaDto, DimonaStatus } from "@/types/DimonaTypes";
import { getStatusBadge, getTypeBadge } from "@/utils/dimonaUtils";
import { ROUTES } from "@/config/routes.config";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { StatusHistory } from "@/components/common/status/StatusHistory";

export function DimonaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [dimona, setDimona] = useState<DimonaDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [historyCount, setHistoryCount] = useState<number>(0);
  
  // Inline editing states
  const [isEditingReference, setIsEditingReference] = useState(false);
  const [editedReference, setEditedReference] = useState("");
  const [savingReference, setSavingReference] = useState(false);

  useEffect(() => {
    const fetchDimona = async () => {
      try {
        if (!id) return;
        const [dimonaData, historyCountData] = await Promise.all([
          dimonaService.getDimona(id),
          dimonaService.getStatusHistoryCount(id).catch(() => 0)
        ]);
        setDimona(dimonaData);
        setHistoryCount(historyCountData);
      } catch (error) {
        toast.error("Erreur lors du chargement de la déclaration Dimona");
      } finally {
        setLoading(false);
      }
    };

    fetchDimona();
  }, [id]);


  const handleDelete = async () => {
    try {
      if (!id) return;
      await dimonaService.deleteDimona(id);
      toast.success("Dimona declaration deleted successfully");
      navigate(ROUTES.DIMONA);
    } catch (error) {
      toast.error("Error deleting Dimona declaration");
    }
    setDeleteDialogOpen(false);
  };

  const handleConfirmDimona = async () => {
    try {
      if (!id) return;
      setActionLoading(true);
      const updatedDimona = await dimonaService.updateDimonaStatus(
        id, 
        DimonaStatus.TO_SEND, 
        "Déclaration confirmée par le contact entreprise"
      );
      setDimona(updatedDimona);
      toast.success("Déclaration confirmée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la confirmation de la déclaration");
    } finally {
      setActionLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleModifyDimona = () => {
    if (!id) return;
    navigate(ROUTES.EDIT_DIMONA(id));
  };

  const handleEditReference = () => {
    if (!dimona) return;
    setEditedReference(dimona.onssReference);
    setIsEditingReference(true);
  };

  const handleCancelEditReference = () => {
    setIsEditingReference(false);
    setEditedReference("");
  };

  const handleSaveReference = async () => {
    if (!id || !dimona || !editedReference || !editedReference.trim()) return;

    try {
      setSavingReference(true);
      const updatedDimona = await dimonaService.updateDimona(id, {
        type: dimona.type,
        entryDate: new Date(dimona.entryDate).toISOString().split('T')[0],
        exitDate: new Date(dimona.exitDate).toISOString().split('T')[0],
        exitReason: dimona.exitReason || undefined,
        collaboratorId: dimona.collaboratorId,
        companyId: dimona.companyId,
        onssReference: editedReference.trim(),
      });
      setDimona(updatedDimona);
      setIsEditingReference(false);
      setEditedReference("");
      toast.success("Référence ONSS mise à jour avec succès");
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors de la mise à jour de la référence ONSS");
      }
    } finally {
      setSavingReference(false);
    }
  };

  // Check if user can perform actions on this dimona
  const canPerformActions = hasRole("ROLE_COMPANY") && 
    (user?.companyId === dimona?.companyId || user?.isCompanyContact);

  const showConfirmButton = canPerformActions && dimona?.status === DimonaStatus.TO_CONFIRM;
  const showModifyButton = canPerformActions && dimona?.status === DimonaStatus.REJECTED;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!dimona) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-semibold mb-2">Déclaration introuvable</h2>
        <p className="text-slate-500 mb-4">
          La déclaration Dimona demandée n'existe pas ou a été supprimée.
        </p>
        <Button onClick={() => navigate(ROUTES.DIMONA)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux déclarations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Déclaration Dimona
          </h1>
          <p className="text-slate-500">Détails de la déclaration Dimona</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.DIMONA)}
            className="bg-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
          </Button>
        </div>
      </div>

      {/* Action Buttons for Company Contacts */}
      {showConfirmButton && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Confirmation requise</h3>
                <p className="text-green-700">Cette déclaration est prête à être envoyée à l'ONSS</p>
              </div>
            </div>
            <Button 
              onClick={() => setConfirmDialogOpen(true)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {actionLoading ? "Confirmation..." : "Confirmer"}
            </Button>
          </div>
        </div>
      )}

      {showModifyButton && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Modification requise</h3>
                <p className="text-red-700">Cette déclaration a été rejetée et doit être corrigée</p>
              </div>
            </div>
            <Button 
              onClick={handleModifyDimona}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Détails
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historique
            {historyCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {historyCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Informations de base de la déclaration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-slate-500">
                      Référence ONSS
                    </p>
                    {canPerformActions && !isEditingReference && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditReference}
                        className="h-4 w-4 p-0 text-slate-400 hover:text-slate-600"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {isEditingReference ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={editedReference}
                        onChange={(e) => setEditedReference(e.target.value)}
                        className="font-mono text-sm"
                        placeholder="Référence ONSS"
                        disabled={savingReference}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveReference}
                        disabled={savingReference || !editedReference || !editedReference.trim()}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEditReference}
                        disabled={savingReference}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="font-mono text-blue-800">
                      {dimona.onssReference}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Type</p>
                  <div>{getTypeBadge(dimona.type)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Statut</p>
                  <div>{getStatusBadge(dimona.status)}</div>
                </div>
                {dimona.errorMessage && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Message d'erreur
                    </p>
                    <p className="text-red-600">{dimona.errorMessage}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Période</CardTitle>
              <CardDescription>Dates d'entrée et de sortie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Date d'entrée
                  </p>
                  <p>
                    {new Date(dimona.entryDate).toLocaleDateString("fr-BE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Date de sortie
                  </p>
                  <p>
                    {new Date(dimona.exitDate).toLocaleDateString("fr-BE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {dimona.exitReason && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Raison de sortie
                    </p>
                    <p>{dimona.exitReason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <StatusHistory dimonaId={dimona.id} />
        </TabsContent>
      </Tabs>

      {/* Confirm Dimona Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Confirmer la déclaration
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir confirmer cette déclaration Dimona ? 
              Elle sera marquée comme prête à être envoyée à l'ONSS.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmDimona}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? "Confirmation..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette déclaration Dimona ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
