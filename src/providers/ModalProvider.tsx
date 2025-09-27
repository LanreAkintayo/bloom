"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import BaseModal from "@/components/BaseModal"; // update path to your BaseModal
import ModalContext, { ModalConfig } from "./modal-context";

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [open, setOpen] = useState(false);

  const openModal = (config: ModalConfig) => {
    setModalConfig(config);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setTimeout(() => setModalConfig(null), 200); // reset config after closing
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {modalConfig && (
        <BaseModal
          open={open}
          onClose={closeModal}
          title={modalConfig.title}
          description={modalConfig.description}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={() => {
            modalConfig.onConfirm?.();
            // auto-close success/error modals
            if (modalConfig.type !== "confirm") closeModal();
          }}
          loading={modalConfig.loading}
          type={modalConfig.type}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
