"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Coins, FileText, Loader2 } from "lucide-react";
import { bloomLog, formatAddress } from "@/lib/utils";
import { Token, Status } from "@/types";
import useDefi from "@/hooks/useDefi";
import { formatUnits } from "viem";
import Image from "next/image";
import { useAccount } from "wagmi";

interface Deal {
  id: number;
  receiver: string;
  sender: string;
  amount: bigint;
  tokenAddress: string;
  status: number;
  description: string;
  createdAt: string;
}

interface DealCardProps {
  deal: Deal;
  currentUser: "sender" | "receiver";
  onCancel: (id: number) => void;
  onRelease: (id: number) => void;
  onClaim: (id: number) => void;
  onAcknowledge: (id: number) => void;
  onUnacknowledge: (id: number) => void;
  loadingAction: {
    dealId: number | null;
    type: "cancel" | "release" | "acknowledge" | "unacknowledge" | null;
  };

}

export default function DealCard({
  deal,
  currentUser,
  onCancel,
  onRelease,
  onClaim,
  onAcknowledge,
  onUnacknowledge,
  loadingAction,
}: DealCardProps) {
  const { allSupportedTokens } = useDefi();
  const { address: signerAddress } = useAccount();

  const token: Token = allSupportedTokens?.find(
    (t: Token) => t.address === deal.tokenAddress
  ) as Token;

  bloomLog("Token in DealCard: ", token);

  bloomLog("Current Deal: ", deal);

  const currentStatus = Status[deal.status] as string;

  // Determine milestones dynamically
  const milestones =
    currentStatus === "Disputed"
      ? ["Pending", "Acknowledged", "Disputed", "Finalized"]
      : ["Pending", "Acknowledged", "Completed"];

  const currentIndex = milestones.indexOf(currentStatus);

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
    <Card className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition py-0">
      <CardContent className="p-4 space-y-4">
        {/* Recipient + Status */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-white">
              Recipient: {formatAddress(deal.receiver)}
            </span>
          </div>
          <span
            className={`${getStatusColor(
              currentStatus
            )} text-white px-2 py-0.5 rounded-md text-sm round-full`}
          >
            {currentStatus}
          </span>
        </div>

        {/* Amount + Description */}
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          {token && (
            <div className="flex items-center gap-2">
              <Image
                src={token.image}
                alt={token.name}
                width={20}
                height={20}
              />
              <span>
                {formatUnits(deal.amount, token.decimal)} {token.symbol}
              </span>
            </div>
          )}
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
              <div
                key={milestone}
                className="flex flex-col items-center text-xs"
              >
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
          {currentStatus === "Pending" && signerAddress === deal.sender && (
            <Button
              onClick={() => onCancel(deal.id)}
              className="bg-red-800 hover:bg-red-700"
            >
              Cancel Deal
            </Button>
          )}
          {currentStatus === "Acknowledged" &&
            signerAddress === deal.sender && (
              <Button
                onClick={() => onRelease(deal.id)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Release Now
              </Button>
            )}
          {currentStatus === "Pending" && signerAddress === deal.receiver && (
            <Button
              onClick={() => onAcknowledge(deal.id)}
              className="bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center gap-2"
              disabled={
                loadingAction.dealId === deal.id &&
                loadingAction.type === "acknowledge"
              }
            >
              {loadingAction.dealId === deal.id &&
              loadingAction.type === "acknowledge" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Acknowledging...
                </>
              ) : (
                "Acknowledge"
              )}
            </Button>
          )}
          {currentStatus === "Disputed" && signerAddress === deal.receiver && (
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
