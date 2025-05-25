import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";

interface AccountActivatedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountActivatedModal: React.FC<AccountActivatedModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          {/* Icon de succès avec animation */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center relative">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
          </div>

          <DialogTitle className="text-xl font-semibold text-gray-900">
            Félicitations ! 🎉
          </DialogTitle>

          <DialogDescription className="text-center space-y-3 text-gray-600">
            <p className="text-base font-medium">
              Votre compte a maintenant accès à toutes les fonctionnalités.
            </p>
            <p className="text-sm">
              Un employé du secrétariat social a été notifié de la completion de votre entreprise.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center pt-4">
          <Button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-medium transition-colors"
          >
            Parfait !
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountActivatedModal;
