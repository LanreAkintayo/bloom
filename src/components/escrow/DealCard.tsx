"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Coins, FileText, Loader2 } from "lucide-react";
import { bloomLog, formatAddress } from "@/lib/utils";
import { Token, Status, DealAction } from "@/types";
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
  onDispute: (id: number) => void;
  loadingAction: {
    dealId: number | null;
    type: DealAction;
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
  onDispute,
  loadingAction,
}: DealCardProps) {
  const { allSupportedTokens } = useDefi();
  const { address: signerAddress } = useAccount();

  const token: Token = allSupportedTokens?.find(
    (t: Token) => t.address === deal.tokenAddress
  ) as Token;

  // bloomLog("Token in DealCard: ", token);

  // bloomLog("Current Deal: ", deal);

  bloomLog("Loading action.dealId: ", loadingAction.dealId);
  bloomLog("Deal.id: ", deal.id);

  const currentStatus = Status[deal.status] as string;

  // Determine milestones dynamically
  const milestones =
    currentStatus === "Disputed"
      ? ["Pending", "Acknowledged", "Disputed", "Finalized"]
      : ["Pending", "Acknowledged", "Completed"];

  const currentIndex = milestones.indexOf(currentStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Canceled":
        return "bg-red-300";
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

  const progressPercentage =
    (currentIndex / (milestones.length - 1)) * 100 > 0
      ? (currentIndex / (milestones.length - 1)) * 100
      : 0;

  return (
    <Card className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition py-0">
      <CardContent className="p-4 space-y-4 text-xs">
        {/* Recipient + Status */}
        <div className="flex justify-between items-start bg-slate-800/50 py-4 px-2 rounded-xl ">
          {/* Sender & Recipient */}
          <p className="text-white/70"> #{deal.id.toString()}</p>

          {/* Status Badge */}
          <div>
            <span
              className={`${getStatusColor(
                currentStatus
              )} px-3 py-1 rounded-full text-xs font-medium`}
            >
              {currentStatus}
            </span>
          </div>
        </div>
        {/* Recipient + Status */}
        <div className="flex justify-between items-start py-1 rounded-xl ">
          {/* Sender & Recipient */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Wallet className="w-4 h-4 text-cyan-400" />

              <span className="text-xs text-white/70">Sender</span>
              <span className="font-semibold text-white">
                {formatAddress(deal.sender)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs ">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-white/70">Recipient</span>
              <span className="font-semibold text-white">
                {formatAddress(deal.receiver)}
              </span>
            </div>
          </div>
        </div>

        {/* Amount + Description */}
        <div className="flex items-center space-x-2 text-slate-400 text-sm sm:text-xs">
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
        <div className="flex items-center space-x-2 text-slate-400 text-sm sm:text-xs">
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
          <div className="flex justify-between relative z-10 text-sm sm:text-xs">
            {milestones.map((milestone, index) => (
              <div
                key={milestone}
                className="flex flex-col items-center text-sm sm:text-xs"
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
        <div className="flex space-x-2 mt-4 ">
          {currentStatus === "Pending" && signerAddress === deal.sender && (
            <Button
              onClick={() => onCancel(deal.id)}
              className="bg-red-800 hover:bg-red-800/70 flex items-center justify-center gap-2 px-2 text-[13px]"
              disabled={
                loadingAction.dealId === deal.id &&
                loadingAction.type === "cancel"
              }
            >
              {loadingAction.dealId === deal.id &&
              loadingAction.type === "cancel" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Deal"
              )}
            </Button>
          )}
          {currentStatus === "Acknowledged" &&
            signerAddress === deal.sender && (
              <Button
                onClick={() => onRelease(deal.id)}
                className="bg-green-800 hover:bg-green-800/70 flex items-center justify-center gap-2 text-[13px] px-2"
                disabled={
                  loadingAction.dealId === deal.id &&
                  loadingAction.type === "release"
                }
              >
                {loadingAction.dealId === deal.id &&
                loadingAction.type === "release" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Releasing...
                  </>
                ) : (
                  "Release Now"
                )}
              </Button>
            )}
          {currentStatus === "Acknowledged" &&
            signerAddress === deal.receiver && (
              <div className="flex items-center space-x-2 text-[13px]">
                <Button
                  onClick={() => onUnacknowledge(deal.id)}
                  className="bg-yellow-900 hover:bg-yellow-900/70 flex items-center justify-center gap-2 text-[13px] px-2"
                  disabled={
                    loadingAction.dealId === deal.id &&
                    loadingAction.type === "unacknowledge"
                  }
                >
                  {loadingAction.dealId === deal.id &&
                  loadingAction.type === "unacknowledge" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Unacknowledging Deal...
                    </>
                  ) : (
                    "Unacknowledge Deal"
                  )}
                </Button>
                <Button
                  onClick={() => onDispute(deal.id)}
                  className="bg-cyan-700 hover:bg-cyan-700/70 flex items-center justify-center gap-2 text-[13px] py-0 px-2"
                  disabled={
                    loadingAction.dealId === deal.id &&
                    loadingAction.type === "dispute"
                  }
                >
                  {loadingAction.dealId === deal.id &&
                  loadingAction.type === "dispute" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Opening Dispute...
                    </>
                  ) : (
                    "Open Dispute"
                  )}
                </Button>
              </div>
            )}
          {currentStatus === "Pending" && signerAddress === deal.receiver && (
            <Button
              onClick={() => onAcknowledge(deal.id)}
              className="bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center gap-2 text-[13px] px-2 py-0"
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
