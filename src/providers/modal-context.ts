"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import BaseModal from "@/components/BaseModal"; // path to your BaseModal

// Define the shape of the modal config
export interface ModalConfig {
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  type?: "confirm" | "success" | "error";
  loading?: boolean;
}

// Define context interface
interface ModalContextProps {
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

// Create the context
const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export default ModalContext
