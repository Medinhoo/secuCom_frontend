import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { CompanyDto } from '@/types/CompanyTypes';

interface CompanyConfirmationBadgeProps {
  company: CompanyDto;
  className?: string;
}

export const CompanyConfirmationBadge = ({ company, className }: CompanyConfirmationBadgeProps) => {
  const isConfirmed = company.companyConfirmed;

  return (
    <Badge
      className={`flex items-center gap-1 ${
        isConfirmed 
          ? 'bg-green-200 text-green-700 ' 
          : 'bg-orange-200 text-orange-700'
      } ${className}`}
    >
      {isConfirmed ? (
        <>
          <CheckCircle className="h-3 w-3" />
          Confirmée
        </>
      ) : (
        <>
          <AlertCircle className="h-3 w-3" />
          En attente de confirmation
        </>
      )}
    </Badge>
  );
};
