import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { documentService } from '@/services/api/documentService';
import { ContratDto, ContratStatus } from '@/types/DocumentTypes';
import { toast } from 'sonner';

interface ContractsListProps {
  collaboratorId: string;
}

export function ContractsList({ collaboratorId }: ContractsListProps) {
  const [contracts, setContracts] = useState<ContratDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les contrats
  useEffect(() => {
    const loadContracts = async () => {
      try {
        setIsLoading(true);
        const allContracts = await documentService.getContrats();
        // Filtrer les contrats pour ce collaborateur
        const filteredContracts = allContracts.filter(
          (contract: ContratDto) => contract.collaboratorId === collaboratorId
        );
        setContracts(filteredContracts);
      } catch (err) {
        setError('Erreur lors du chargement des contrats');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadContracts();
  }, [collaboratorId]);

  const handleDownload = async (contractId: string, filename: string) => {
    try {
      const blob = await documentService.downloadDocumentPdf(contractId);
      documentService.downloadFile(blob, filename);
      toast.success('Téléchargement démarré');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleTerminateContract = async (contractId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir terminer ce contrat ? Cette action créera automatiquement une dimona OUT.')) {
      return;
    }

    try {
      await documentService.terminerContrat(contractId);
      toast.success('Contrat terminé avec succès');
      // Recharger les contrats
      const allContracts = await documentService.getContrats();
      const filteredContracts = allContracts.filter(
        (contract: ContratDto) => contract.collaboratorId === collaboratorId
      );
      setContracts(filteredContracts);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la terminaison du contrat');
    }
  };

  const handleActivateContract = async (contractId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir réactiver ce contrat ?')) {
      return;
    }

    try {
      await documentService.activerContrat(contractId);
      toast.success('Contrat activé avec succès');
      // Recharger les contrats
      const allContracts = await documentService.getContrats();
      const filteredContracts = allContracts.filter(
        (contract: ContratDto) => contract.collaboratorId === collaboratorId
      );
      setContracts(filteredContracts);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'activation du contrat');
    }
  };

  const getStatusBadge = (status: ContratStatus) => {
    switch (status) {
      case 'ACTIF':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Actif
          </Badge>
        );
      case 'TERMINE':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Terminé
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const getDimonaBadges = (contract: ContratDto) => {
    const badges = [];
    
    if (contract.dimonaInId) {
      badges.push(
        <Badge key="in" variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Dimona IN
        </Badge>
      );
    }
    
    if (contract.dimonaOutId) {
      badges.push(
        <Badge key="out" variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          Dimona OUT
        </Badge>
      );
    }
    
    return badges;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">Erreur lors du chargement des contrats</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="flex flex-col items-center justify-center">
          <CheckCircle className="h-10 w-10 text-gray-300 mb-2" />
          <p className="text-gray-500">Aucun contrat trouvé</p>
          <p className="text-sm text-gray-400 mt-1">
            Ce collaborateur n'a pas encore de contrat généré
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <Card key={contract.id} className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-slate-900">
                    {contract.templateDisplayName || contract.templateName}
                  </h4>
                  {getStatusBadge(contract.contratStatus)}
                </div>
                
                <p className="text-sm text-slate-500 mb-3">
                  Créé le {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
                  {contract.startDate && (
                    <> • Début: {new Date(contract.startDate).toLocaleDateString('fr-FR')}</>
                  )}
                  {contract.endDate && (
                    <> • Fin: {new Date(contract.endDate).toLocaleDateString('fr-FR')}</>
                  )}
                </p>
                
                <div className="flex gap-2 flex-wrap">
                  {getDimonaBadges(contract)}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(contract.id, contract.generatedFileName)}
                  className="border-slate-200 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                {contract.contratStatus === 'ACTIF' && !contract.dimonaOutId && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleTerminateContract(contract.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Terminer
                  </Button>
                )}
                
                {contract.contratStatus === 'TERMINE' && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleActivateContract(contract.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Réactiver
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
