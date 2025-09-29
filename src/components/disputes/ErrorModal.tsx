"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function ErrorModal({
  isOpen,
  onClose,
  title,
  message,
}: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white rounded-2xl max-w-md w-full max-h-[80vh] shadow-xl flex flex-col animate-scale-up overflow-hidden">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center text-center scrollbar-none">
          {/* Icon */}
          <XCircle className="text-red-500 w-16 h-16 mb-4 animate-shake" />

          {/* Title */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-2 text-red-400">
              {title || "Something went wrong!"}
            </DialogTitle>
          </DialogHeader>

          {/* Message */}
          <p className="text-white/70 break-words whitespace-pre-wrap">
            {message || "An unexpected error occurred. Please try again."}
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-center p-4">
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
