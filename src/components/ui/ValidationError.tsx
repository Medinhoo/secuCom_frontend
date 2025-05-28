import { AlertCircle, Loader2 } from "lucide-react";

interface ValidationErrorProps {
  error?: string;
  isValidating?: boolean;
}

export function ValidationError({ error, isValidating }: ValidationErrorProps) {
  if (isValidating) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Vérification en cours...</span>
      </div>
    );
  }

  if (!error) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-red-600 mt-1">
      <AlertCircle className="h-3 w-3" />
      <span>{error}</span>
    </div>
  );
}
