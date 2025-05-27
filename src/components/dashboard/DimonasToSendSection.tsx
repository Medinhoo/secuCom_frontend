import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Send, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDimonasToSend } from '@/hooks/useDimonasToSend';
import { DimonaType } from '@/types/DimonaTypes';
import { ROUTES } from '@/config/routes.config';

export const DimonasToSendSection: React.FC = () => {
  const { dimonas, sendToONSS, getDaysOld } = useDimonasToSend();

  const getTypeColor = (type: DimonaType) => {
    switch (type) {
      case DimonaType.IN:
        return 'bg-green-100 text-green-700';
      case DimonaType.OUT:
        return 'bg-red-100 text-red-700';
      case DimonaType.UPDATE:
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: DimonaType) => {
    switch (type) {
      case DimonaType.IN:
        return 'Entrée';
      case DimonaType.OUT:
        return 'Sortie';
      case DimonaType.UPDATE:
        return 'Modification';
      default:
        return type;
    }
  };

  const handleSendToONSS = async (dimonaId: string) => {
    const success = await sendToONSS(dimonaId);
    if (success) {
      console.log('Dimona envoyée avec succès à l\'ONSS');
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm bg-blue-50 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0 border-b-0">
        <CardTitle className="text-lg font-bold text-blue-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Dimonas à envoyer
          </div>
          <Badge className="bg-blue-200 text-blue-800">
            {dimonas.length} en attente
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-blue-50 flex-1 overflow-hidden">
        {dimonas.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-10 w-10 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-blue-600 mb-1">Aucune dimona à envoyer</p>
            <p className="text-xs text-blue-500">Toutes les dimonas sont à jour !</p>
          </div>
        ) : (
          <div className="space-y-2 h-full overflow-y-auto">
            {dimonas.slice(0, 8).map((dimona) => {
              const daysOld = getDaysOld(dimona.entryDate);
              const isUrgent = daysOld > 7;

              return (
                <div
                  key={dimona.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors hover:bg-white ${
                    isUrgent ? 'border-orange-300 bg-orange-50' : 'border-blue-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isUrgent ? 'bg-orange-200' : 'bg-blue-200'
                    }`}>
                      {isUrgent ? (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-blue-900 truncate text-sm">
                          {dimona.onssReference || `#${dimona.id.slice(-6)}`}
                        </p>
                        <Badge className={`text-xs ${getTypeColor(dimona.type)}`}>
                          {getTypeLabel(dimona.type)}
                        </Badge>
                        {isUrgent && (
                          <Badge className="bg-orange-200 text-orange-800 text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-blue-600">
                        <span>{new Date(dimona.entryDate).toLocaleDateString('fr-FR')}</span>
                        <span className="mx-1">•</span>
                        <span className={isUrgent ? 'text-orange-600 font-medium' : ''}>
                          {daysOld}j
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <Link to={ROUTES.DIMONA_DETAILS(dimona.id)}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Button
                      onClick={() => handleSendToONSS(dimona.id)}
                      size="sm"
                      className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {dimonas.length > 8 && (
              <div className="text-center pt-2 border-t border-blue-200">
                <Link to={`${ROUTES.DIMONA}?status=TO_SEND`}>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100 text-xs">
                    +{dimonas.length - 8} autres
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
