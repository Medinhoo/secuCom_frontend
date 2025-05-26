import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Clock, Info } from "lucide-react";
import { toast } from "sonner";

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

import { dimonaService } from "@/services/api/dimonaService";
import { DimonaDto } from "@/types/DimonaTypes";
import { getStatusBadge, getTypeBadge } from "@/utils/dimonaUtils";
import { ROUTES } from "@/config/routes.config";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { StatusHistory } from "@/components/ui/StatusHistory";

export function DimonaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dimona, setDimona] = useState<DimonaDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState<number>(0);

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
                  <p className="text-sm font-medium text-slate-500">
                    Référence ONSS
                  </p>
                  <p className="font-mono text-blue-800">
                    {dimona.onssReference}
                  </p>
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
