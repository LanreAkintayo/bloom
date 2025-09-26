"use client";

import React from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "success" | "failure";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: Status;
  title?: string;
  message?: string;
}

export default function StatusModal({
  isOpen,
  onClose,
  status,
  title,
  message,
}: StatusModalProps) {
  if (!isOpen) return null;

  const isSuccess = status === "success";

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

        {/* Icon */}
        <div className="flex flex-col items-center text-center">
          {isSuccess ? (
            <CheckCircle2 className="text-emerald-500 w-16 h-16 mb-4 animate-bounce" />
          ) : (
            <XCircle className="text-red-500 w-16 h-16 mb-4 animate-shake" />
          )}

          {/* Title */}
          <h2
            className={`text-2xl font-bold mb-2 ${
              isSuccess ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {title || (isSuccess ? "Transaction Successful!" : "Transaction Failed!")}
          </h2>

          {/* Message */}
          <p className="text-white/70">
            {message ||
              (isSuccess
                ? "Your transaction was confirmed on-chain."
                : "Something went wrong. Please try again.")}
          </p>
        </div>

        {/* Action */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={onClose}
            className={`${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
