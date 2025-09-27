"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmActionModalProps {
  open: boolean;
  action: "cancel" | "release" | "acknowledge" | "unacknowledge" | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const actionMessages: Record<string, { title: string; description: string; confirmText: string }> = {
  cancel: {
    title: "Cancel Deal",
    description: "Are you sure you want to cancel this deal? This cannot be undone.",
    confirmText: "Yes, Cancel"
  },
  release: {
    title: "Release Funds",
    description: "Once released, the funds will go to the recipient and this action cannot be reversed.",
    confirmText: "Yes, Release"
  },
  acknowledge: {
    title: "Acknowledge Deal",
    description: "You are about to acknowledge this deal. Once acknowledged, the other party can proceed.",
    confirmText: "Acknowledge"
  },
  claim: {
    title: "Unacknowledge",
    description: "You are about to unacknowledge this deal. Once unacknowledge, the other party can cancel the deal.",
    confirmText: "Unacknowledge"
  }
};

export default function ConfirmActionModal({
  open,
  action,
  onCancel,
  onConfirm
}: ConfirmActionModalProps) {
  if (!action) return null;
  const { title, description, confirmText } = actionMessages[action];

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="bg-slate-900 text-white border border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          <DialogDescription className="text-white/70">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onCancel} className="bg-slate-800 hover:bg-slate-700">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-700">
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
