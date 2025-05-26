import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DimonaStatus } from "@/types/DimonaTypes";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Textarea } from "./textarea";

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: DimonaStatus;
  onStatusChange: (status: DimonaStatus, reason?: string) => Promise<void>;
  loading?: boolean;
}

const statusOptions = [
  { value: DimonaStatus.TO_CONFIRM, label: "À confirmer", description: "La déclaration nécessite une confirmation" },
  { value: DimonaStatus.TO_SEND, label: "À envoyer", description: "Prête à être envoyée à l'ONSS" },
  { value: DimonaStatus.IN_PROGRESS, label: "En cours", description: "En cours de traitement par l'ONSS" },
  { value: DimonaStatus.REJECTED, label: "Rejetée", description: "Rejetée par l'ONSS" },
  { value: DimonaStatus.ACCEPTED, label: "Acceptée", description: "Acceptée par l'ONSS" },
];

const getStatusColor = (status: DimonaStatus) => {
  switch (status) {
    case DimonaStatus.TO_CONFIRM:
      return "text-orange-600";
    case DimonaStatus.TO_SEND:
      return "text-blue-600";
    case DimonaStatus.IN_PROGRESS:
      return "text-purple-600";
    case DimonaStatus.ACCEPTED:
      return "text-green-600";
    case DimonaStatus.REJECTED:
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export function StatusChangeModal({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
  loading = false,
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<DimonaStatus | "">("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ status?: string; reason?: string }>({});

  const handleClose = () => {
    if (!loading) {
      setSelectedStatus("");
      setReason("");
      setErrors({});
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors: { status?: string; reason?: string } = {};

    if (!selectedStatus) {
      newErrors.status = "Veuillez sélectionner un nouveau statut";
    } else if (selectedStatus === currentStatus) {
      newErrors.status = "Le nouveau statut doit être différent du statut actuel";
    }

    if (!reason.trim()) {
      newErrors.reason = "Veuillez indiquer la raison du changement";
    } else if (reason.trim().length < 10) {
      newErrors.reason = "La raison doit contenir au moins 10 caractères";
    } else if (reason.trim().length > 500) {
      newErrors.reason = "La raison ne peut pas dépasser 500 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedStatus) return;

    try {
      await onStatusChange(selectedStatus, reason.trim());
      handleClose();
    } catch (error: any) {
      // Error handling is done in the parent component
      console.error("Error changing status:", error);
      
      // Show additional error feedback in the modal if needed
      if (error.message && error.message.includes("Invalid status value")) {
        setErrors(prev => ({ 
          ...prev, 
          status: "Statut invalide. Veuillez réessayer." 
        }));
      }
    }
  };

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus);
  const selectedStatusOption = statusOptions.find(option => option.value === selectedStatus);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Changer le statut
          </DialogTitle>
          <DialogDescription>
            Modifiez le statut de cette déclaration Dimona et indiquez la raison du changement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">Statut actuel</Label>
            <p className={`text-sm font-medium ${getStatusColor(currentStatus)}`}>
              {currentStatusOption?.label}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {currentStatusOption?.description}
            </p>
          </div>

          {/* New Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Nouveau statut *</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value as DimonaStatus);
                if (errors.status) {
                  setErrors(prev => ({ ...prev, status: undefined }));
                }
              }}
              disabled={loading}
            >
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <SelectValue placeholder="Sélectionnez un nouveau statut" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions
                  .filter(option => option.value !== currentStatus)
                  .map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className={`font-medium ${getStatusColor(option.value)}`}>
                          {option.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status}</p>
            )}
          </div>

          {/* Status Change Preview */}
          {selectedStatus && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800">
                  Changement: <span className="font-medium">{currentStatusOption?.label}</span>
                  {" → "}
                  <span className="font-medium">{selectedStatusOption?.label}</span>
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du changement *</Label>
            <Textarea
              id="reason"
              placeholder="Expliquez pourquoi vous changez le statut de cette déclaration..."
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setReason(e.target.value);
                if (errors.reason) {
                  setErrors(prev => ({ ...prev, reason: undefined }));
                }
              }}
              disabled={loading}
              className={`min-h-[100px] resize-none ${errors.reason ? "border-red-500" : ""}`}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              {errors.reason ? (
                <p className="text-sm text-red-600">{errors.reason}</p>
              ) : (
                <p className="text-xs text-gray-500">
                  Minimum 10 caractères requis
                </p>
              )}
              <p className="text-xs text-gray-400">
                {reason.length}/500
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedStatus || !reason.trim()}
            className="min-w-[100px]"
          >
            {loading ? "Changement..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
