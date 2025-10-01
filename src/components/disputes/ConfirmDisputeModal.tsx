"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface ConfirmDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dealId: string;
  description: string;
}

export default function ConfirmDisputeModal({
  isOpen,
  onClose,
  onConfirm,
  dealId,
  description,
}: ConfirmDisputeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-xl max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        // 👇 this prevents closing when pressing Escape
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-400 text-center">
            Confirm Dispute
          </DialogTitle>
          <DialogDescription className="text-white/70 text-center mt-2">
            Are you sure you want to open this dispute?
          </DialogDescription>
        </DialogHeader>

        {/* Deal Info */}
        {/* <div className="bg-slate-800 rounded-lg p-4 border border-emerald-500/30 shadow-inner mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-white/80 font-semibold">Deal ID:</span>
            <span className="text-white font-medium">{dealId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80 font-semibold">Description:</span>
            <span className="text-white truncate max-w-[200px]">{description}</span>
          </div>
        </div> */}

        <DialogFooter className=" mt-2 flex justify-end gap-3">
          <Button
            variant="outline"
            className="bg-red-800 hover:bg-red-700 text-white"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
