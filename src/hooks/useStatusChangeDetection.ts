import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export const useStatusChangeDetection = () => {
  const { user } = useAuth();
  const [showActivatedModal, setShowActivatedModal] = useState(false);
  const previousStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (user?.accountStatus) {
      // Si on a un statut précédent et qu'il a changé de PENDING à ACTIVE
      if (
        previousStatusRef.current === "PENDING" &&
        user.accountStatus === "ACTIVE" &&
        (user.isCompanyContact || user.roles?.includes("ROLE_COMPANY"))
      ) {
        setShowActivatedModal(true);
      }

      // Mettre à jour le statut précédent
      previousStatusRef.current = user.accountStatus;
    }
  }, [user?.accountStatus, user?.isCompanyContact, user?.roles]);

  const closeActivatedModal = () => {
    setShowActivatedModal(false);
  };

  return {
    showActivatedModal,
    closeActivatedModal,
  };
};
