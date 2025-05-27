import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDimonasInProgress } from '@/hooks/useDimonasInProgress';
import { DimonaType } from '@/types/DimonaTypes';

export const DimonasInProgressSection: React.FC = () => {
  const { 
    dimonas, 
    markAsAccepted, 
    markAsRejected, 
    getDaysInProgress, 
    isUrgent  } = useDimonasInProgress();

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

  const handleMarkAsAccepted = async (dimonaId: string) => {
    const success = await markAsAccepted(dimonaId);
    if (success) {
      console.log('Dimona marquée comme acceptée');
    }
  };

  const handleMarkAsRejected = async (dimonaId: string) => {
    const success = await markAsRejected(dimonaId, 'Rejetée depuis le dashboard');
    if (success) {
      console.log('Dimona marquée comme rejetée');
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm bg-purple-50 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0 border-b-0">
        <CardTitle className="text-lg font-bold text-purple-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Dimonas en cours ONSS
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-200 text-purple-800">
              {dimonas.length} en cours
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs border-purple-300 text-purple-700 hover:bg-purple-100"
              onClick={() => window.open('https://www.socialsecurity.be/site_fr/employer/applics/dimona/index.htm', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              ONSS
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-purple-50 flex-1 overflow-hidden">
        {dimonas.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="h-10 w-10 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-purple-600 mb-1">Aucune dimona en cours</p>
            <p className="text-xs text-purple-500">Toutes les dimonas ont été traitées !</p>
          </div>
        ) : (
          <div className="space-y-2 h-full overflow-y-auto">
            {dimonas.slice(0, 8).map((dimona) => {
              const daysInProgress = getDaysInProgress(dimona.entryDate);
              const urgent = isUrgent(dimona.entryDate);

              return (
                <div
                  key={dimona.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors hover:bg-white ${
                    urgent ? 'border-red-300 bg-red-50' : 'border-purple-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      urgent ? 'bg-red-200' : 'bg-purple-200'
                    }`}>
                      {urgent ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-purple-900 truncate text-sm">
                          {dimona.onssReference || `#${dimona.id.slice(-6)}`}
                        </p>
                        <Badge className={`text-xs ${getTypeColor(dimona.type)}`}>
                          {getTypeLabel(dimona.type)}
                        </Badge>
                        {urgent && (
                          <Badge className="bg-red-200 text-red-800 text-xs">
                            À vérifier
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-purple-600">
                        <span>{new Date(dimona.entryDate).toLocaleDateString('fr-FR')}</span>
                        <span className="mx-1">•</span>
                        <span className={urgent ? 'text-red-600 font-medium' : 'text-purple-600'}>
                          {daysInProgress}j en cours
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <Link to={`/dimona/${dimona.id}`}>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs border-purple-300 text-purple-700 hover:bg-purple-100">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </Link>
                    
                    <Button
                      onClick={() => handleMarkAsAccepted(dimona.id)}
                      size="sm"
                      className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      onClick={() => handleMarkAsRejected(dimona.id)}
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {dimonas.length > 8 && (
              <div className="text-center pt-2 border-t border-purple-200">
                <Link to="/dimona?status=IN_PROGRESS">
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-100 text-xs">
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
