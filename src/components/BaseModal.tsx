"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode; // JSX/component allowed
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  loading?: boolean;
  type?: "confirm" | "success" | "error";
}

export default function BaseModal({
  open,
  onClose,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  loading = false,
  type = "confirm",
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          {description && (
            <DialogDescription asChild>
              <div className="text-white/70">{description}</div>
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex space-x-2">
          {type === "confirm" && (
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700"
            >
              {cancelText}
            </Button>
          )}

          {onConfirm && (
            <Button
              onClick={onConfirm}
              disabled={loading}
              className={
                type === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : type === "error"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }
            >
              {loading ? "Please wait..." : confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
