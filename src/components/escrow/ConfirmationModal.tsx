"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipient: string;
  amount: string;
  token: string;
  description: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  recipient,
  amount,
  token,
  description,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md p-6 relative text-white shadow-xl transform transition-transform duration-300 scale-95 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-6 text-emerald-400 text-center">
          Confirm Deal
        </h2>

        {/* Deal Details */}
        <div className="space-y-4 bg-slate-800 rounded-lg p-4 border border-emerald-500/30 shadow-inner">
          <div className="flex justify-between">
            <span className="font-semibold text-white/80">Recipient:</span>
            <span className="text-white truncate max-w-[200px]">{recipient}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-white/80">Amount:</span>
            <span className="text-white">
              {amount} {token}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-white/80">Description:</span>
            <span className="text-white truncate max-w-[200px]">{description}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="bg-red-800 hover:bg-red-700 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
