import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { useCompanyConfirmation } from '@/hooks/useCompanyConfirmation';
import { History, User } from 'lucide-react';

interface CompanyConfirmationHistoryProps {
  companyId: string;
}

export const CompanyConfirmationHistory = ({ companyId }: CompanyConfirmationHistoryProps) => {
  const { loadConfirmationHistory, isLoadingHistory, confirmationHistory } = useCompanyConfirmation();

  useEffect(() => {
    loadConfirmationHistory(companyId);
  }, [companyId, loadConfirmationHistory]);

  if (isLoadingHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des confirmations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {confirmationHistory.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Aucune confirmation enregistrée pour cette entreprise.
        </p>
      ) : (
        <div className="space-y-3">
          {confirmationHistory.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">{entry.confirmedByUserName}</span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200">
                  Confirmé
                </Badge>
              </div>
              <div className="text-sm text-green-600">
                {new Date(entry.confirmedAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
