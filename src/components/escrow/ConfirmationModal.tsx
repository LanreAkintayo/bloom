"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatAddress } from "@/lib/utils";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-400 text-center">
            Confirm Deal
          </DialogTitle>
          <DialogDescription className="text-white/70 text-center">
            Please review the deal details below before confirming
          </DialogDescription>
        </DialogHeader>

        {/* Deal Details */}
        <div className="space-y-4 bg-slate-800 rounded-lg p-4 border border-emerald-500/30 shadow-inner mt-4">
          <div className="flex justify-between">
            <span className="font-semibold text-white/80">Recipient:</span>
            <span className="text-white truncate max-w-[200px]">{formatAddress(recipient)}</span>
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

        <DialogFooter className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
