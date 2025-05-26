import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DimonaStatus } from "@/types/DimonaTypes";
import { getStatusBadge } from "@/utils/dimonaUtils";

interface StatusDropdownProps {
  currentStatus: DimonaStatus;
  onStatusChange: (newStatus: DimonaStatus) => Promise<void>;
  disabled?: boolean;
}

const statusOptions = [
  { value: DimonaStatus.TO_CONFIRM, label: "À confirmer" },
  { value: DimonaStatus.TO_SEND, label: "À envoyer" },
  { value: DimonaStatus.IN_PROGRESS, label: "En cours" },
  { value: DimonaStatus.REJECTED, label: "Rejetée" },
  { value: DimonaStatus.ACCEPTED, label: "Acceptée" },
];

export function StatusDropdown({ currentStatus, onStatusChange, disabled = false }: StatusDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: DimonaStatus) => {
    if (newStatus === currentStatus || isLoading) return;
    
    try {
      setIsLoading(true);
      await onStatusChange(newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isLoading}
          className="h-8 gap-1"
        >
          {getStatusBadge(currentStatus)}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{option.label}</span>
            {option.value === currentStatus && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
