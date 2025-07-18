import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, FileText } from "lucide-react";

interface CompanyDataRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteProfile: () => void;
}

const CompanyDataRequiredModal: React.FC<CompanyDataRequiredModalProps> = ({
  isOpen,
  onClose,
  onCompleteProfile,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Données d'entreprise requises
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-3">
            <p className="text-gray-600 leading-relaxed">
              Pour accéder à toutes les fonctionnalités de l'application, 
              vous devez d'abord compléter et confirmer toutes les informations de votre entreprise.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">Informations requises :</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Données légales de l'entreprise</li>
                  <li>• Informations fiscales et sociales</li>
                  <li>• Coordonnées complètes</li>
                  <li>• Secteur d'activité et régime de travail</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Prochaine étape :</h4>
                <p className="text-sm text-green-800">
                  Après avoir complété toutes les informations, vous devrez confirmer 
                  l'exactitude des données pour débloquer l'accès à toutes les fonctionnalités.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button 
              onClick={onCompleteProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Compléter les informations de l'entreprise
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDataRequiredModal;
