import { useState } from "react";
import { ChevronDown, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusChangeModal } from "@/components/ui/StatusChangeModal";
import { DimonaStatus } from "@/types/DimonaTypes";
import { getStatusBadge } from "@/utils/dimonaUtils";
import { dimonaService } from "@/services/api/dimonaService";
import { toast } from "sonner";

interface StatusDropdownWithModalProps {
  dimonaId: string;
  currentStatus: DimonaStatus;
  onStatusChanged?: (newStatus: DimonaStatus) => void;
  disabled?: boolean;
}

export function StatusDropdownWithModal({ 
  dimonaId,
  currentStatus, 
  onStatusChanged,
  disabled = false 
}: StatusDropdownWithModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (status: DimonaStatus, reason?: string) => {
    try {
      setIsLoading(true);
      const updatedDimona = await dimonaService.updateDimonaStatus(dimonaId, status, reason);
      
      toast.success(`Statut mis à jour vers "${getStatusLabel(status)}"`);
      
      // Notify parent component of the change
      if (onStatusChanged) {
        onStatusChanged(updatedDimona.status);
      }
      
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error updating status:", error);
      
      // Handle specific error messages from backend
      let errorMessage = "Erreur lors de la mise à jour du statut";
      
      if (error.message) {
        if (error.message.includes("Invalid status value")) {
          errorMessage = "Statut invalide. Veuillez sélectionner un statut valide.";
        } else if (error.message.includes("hasRole")) {
          errorMessage = "Vous n'avez pas les permissions nécessaires pour changer ce statut.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      throw error; // Re-throw to let modal handle it
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: DimonaStatus) => {
    switch (status) {
      case DimonaStatus.TO_CONFIRM:
        return "À confirmer";
      case DimonaStatus.TO_SEND:
        return "À envoyer";
      case DimonaStatus.IN_PROGRESS:
        return "En cours";
      case DimonaStatus.ACCEPTED:
        return "Acceptée";
      case DimonaStatus.REJECTED:
        return "Rejetée";
      default:
        return status;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isLoading}
        onClick={() => setIsModalOpen(true)}
        className="h-auto px-2 py-1 gap-1 hover:bg-gray-50"
      >
        {getStatusBadge(currentStatus)}
        <div className="flex items-center gap-1 ml-1">
          <Edit3 className="h-3 w-3" />
          <ChevronDown className="h-3 w-3" />
        </div>
      </Button>

      <StatusChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentStatus={currentStatus}
        onStatusChange={handleStatusChange}
        loading={isLoading}
      />
    </>
  );
}
