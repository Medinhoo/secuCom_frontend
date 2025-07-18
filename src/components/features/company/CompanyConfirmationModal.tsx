import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Shield, FileCheck } from 'lucide-react';
import { useCompanyConfirmation } from '@/hooks/useCompanyConfirmation';
import type { CompanyDto } from '@/types/CompanyTypes';

interface CompanyConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyDto;
  onConfirmed: (updatedCompany: CompanyDto) => void;
  onSaveAndConfirm?: () => Promise<void>;
  formData?: CompanyDto;
}

export const CompanyConfirmationModal = ({
  isOpen,
  onClose,
  company,
  onConfirmed,
  onSaveAndConfirm,
}: CompanyConfirmationModalProps) => {
  const { confirmCompanyData, isConfirming } = useCompanyConfirmation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResponsibilityAccepted, setIsResponsibilityAccepted] = useState(false);

  const handleConfirm = async () => {
    if (!isResponsibilityAccepted) {
      return;
    }

    setIsProcessing(true);
    try {
      if (onSaveAndConfirm) {
        // Flux avec sauvegarde : sauvegarder d'abord, puis confirmer
        await onSaveAndConfirm();
        const updatedCompany = await confirmCompanyData(company.id);
        if (updatedCompany) {
          onConfirmed(updatedCompany);
          onClose();
        }
      } else {
        // Flux direct : juste confirmer les données actuelles
        const updatedCompany = await confirmCompanyData(company.id);
        if (updatedCompany) {
          onConfirmed(updatedCompany);
          onClose();
        }
      }
    } catch (error) {
      console.error('Error during confirmation process:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsResponsibilityAccepted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Confirmation de responsabilité
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-3">
            <p className="text-gray-600 leading-relaxed">
              Veuillez confirmer que vous assumez la responsabilité des données saisies 
              et certifier leur exactitude.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-green-900">Engagement de responsabilité :</h4>
                <p className="text-sm text-green-800 leading-relaxed">
                  En confirmant, vous certifiez que toutes les informations saisies sont exactes, 
                  complètes et à jour. Vous assumez l'entière responsabilité de la véracité 
                  de ces données et de leur conformité aux exigences légales.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="responsibility-acceptance"
                checked={isResponsibilityAccepted}
                onCheckedChange={(checked) => setIsResponsibilityAccepted(checked as boolean)}
                className="mt-0.5"
              />
              <label 
                htmlFor="responsibility-acceptance" 
                className="text-sm font-medium text-blue-900 leading-relaxed cursor-pointer flex-1"
              >
                J'assume toute la responsabilité des informations que j'ai saisies et 
                je confirme leur exactitude. Je comprends que ces données seront utilisées 
                à des fins administratives et légales.
              </label>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleConfirm}
              disabled={!isResponsibilityAccepted || isProcessing || isConfirming}
              className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300"
            >
              {(isProcessing || isConfirming) ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Confirmation en cours...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Confirmer
                </div>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isProcessing || isConfirming}
              className="w-full"
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
