import React from "react";
import { useStatusChangeDetection } from "@/hooks/useStatusChangeDetection";
import { AccountActivatedModal } from "./modals";

const StatusChangeHandler: React.FC = () => {
  const { showActivatedModal, closeActivatedModal } = useStatusChangeDetection();

  return (
    <AccountActivatedModal
      isOpen={showActivatedModal}
      onClose={closeActivatedModal}
    />
  );
};

export default StatusChangeHandler;
