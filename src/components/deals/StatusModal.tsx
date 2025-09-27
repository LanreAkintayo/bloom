"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface StatusModalProps {
  open: boolean;
  success: boolean;
  message: string;
  onClose: () => void;
}

export default function StatusModal({ open, success, message, onClose }: StatusModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border border-slate-700">
        <DialogHeader className="flex flex-col items-center space-y-2">
          {success ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500" />
          )}
          <DialogTitle className="text-lg font-bold">
            {success ? "Success" : "Failed"}
          </DialogTitle>
          <DialogDescription className="text-center text-white/70">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center">
          <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
