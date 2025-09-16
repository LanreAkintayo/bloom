"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Coins, FileText } from "lucide-react";

interface Deal {
  id: number;
  recipient: string;
  sender: string;
  amount: string;
  status: "Pending" | "Acknowledged" | "Completed" | "Disputed" | "Finalized";
  description: string;
  createdAt: string;
}

interface DealCardProps {
  deal: Deal;
  currentUser: "sender" | "receiver";
  onCancel: (id: number) => void;
  onRelease: (id: number) => void;
  onClaim: (id: number) => void;
}

export default function DealCard({
  deal,
  currentUser,
  onCancel,
  onRelease,
  onClaim,
}: DealCardProps) {
  // Determine milestones dynamically
  const milestones =
    deal.status === "Disputed"
      ? ["Pending", "Acknowledged", "Disputed", "Finalized"]
      : ["Pending", "Acknowledged", "Completed"];

  const currentIndex = milestones.indexOf(deal.status);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "Acknowledged":
        return "bg-cyan-600";
      case "Completed":
      case "Finalized":
        return "bg-emerald-600";
      case "Disputed":
        return "bg-red-600";
      default:
        return "bg-slate-600";
    }
  };

  const progressPercentage = (currentIndex / (milestones.length - 1)) * 100;

  return (
    <Card className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition">
      <CardContent className="p-4 space-y-4">
        {/* Recipient + Status */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-white">Recipient: {deal.recipient}</span>
          </div>
          <span
            className={`${getStatusColor(deal.status)} text-white px-2 py-0.5 rounded-md text-sm round-full`}
          >
            {deal.status}
          </span>
        </div>

        {/* Amount + Description */}
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          <Coins className="w-4 h-4" />
          <span>{deal.amount}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          <FileText className="w-4 h-4" />
          <span>{deal.description}</span>
        </div>

        {/* Milestone Progress */}
        <div className="relative mt-4">
          {/* Base line */}
          <div className="absolute top-3/12 left-0 w-full h-1 bg-slate-700 rounded-full -translate-y-1/2" />
          {/* Progress fill */}
          <div
            className="absolute top-3/12 left-0 h-1 bg-emerald-500 rounded-full -translate-y-1/2 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />

          {/* Milestone circles */}
          <div className="flex justify-between relative z-10">
            {milestones.map((milestone, index) => (
              <div key={milestone} className="flex flex-col items-center text-xs">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${
                      index <= currentIndex
                        ? `bg-emerald-500 border-emerald-500`
                        : `bg-slate-800 border-slate-600`
                    }`}
                >
                  {index + 1}
                </div>
                <span className="mt-1 text-white/70">{milestone}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions based on status and role */}
        <div className="flex space-x-2 mt-4">
          {deal.status === "Pending" && currentUser === "sender" && (
            <Button
              onClick={() => onCancel(deal.id)}
              className="bg-red-800 hover:bg-red-700"
            >
              Cancel Deal
            </Button>
          )}
          {deal.status === "Acknowledged" && currentUser === "sender" && (
            <Button
              onClick={() => onRelease(deal.id)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Release Now
            </Button>
          )}
          {deal.status === "Completed" && currentUser === "receiver" && (
            <Button
              onClick={() => onClaim(deal.id)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Claim
            </Button>
          )}
          {deal.status === "Disputed" && currentUser === "sender" && (
            <Button
              onClick={() => onCancel(deal.id)}
              className="bg-red-800 hover:bg-red-700"
            >
              Cancel / Respond
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
