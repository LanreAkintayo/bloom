"use client";

import React from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

        {/* Icon + Title + Message */}
        <div className="flex flex-col items-center text-center">
          {isSuccess ? (
            <CheckCircle2 className="text-emerald-500 w-16 h-16 mb-4 animate-bounce" />
          ) : (
            <XCircle className="text-red-500 w-16 h-16 mb-4 animate-shake" />
          )}

          <h2
            className={`text-2xl font-bold mb-2 ${
              isSuccess ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {title ||
              (isSuccess ? "Transaction Successful!" : "Transaction Failed!")}
          </h2>

          <p className="text-white/70">
            {message ||
              (isSuccess
                ? "Your transaction was confirmed on-chain."
                : "Something went wrong. Please try again.")}
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className={`mt-6 flex ${
            isSuccess ? "justify-between" : "justify-center"
          }`}
        >
          <Button
            onClick={onClose}
            className={`${
              isSuccess
                ? "bg-slate-700 hover:bg-slate-600"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            Close
          </Button>

          {isSuccess && (
            <Link href="/deals/my_deals" className="w-full max-w-[120px]">
              <Button
                onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                View Deals
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
