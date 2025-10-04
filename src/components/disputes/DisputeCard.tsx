import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Coins,
  Wallet,
  CheckCircle,
  XCircle,
  Info,
  User,
  ArrowRight,
} from "lucide-react";
import { Dispute, ExtendedDispute, TypeChainId } from "@/types";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getDisputeVote } from "@/hooks/useDisputeStorage";
import { formatUnits, zeroAddress } from "viem";
import { SUPPORTED_CHAIN_ID, TOKEN_META, addressToToken } from "@/constants";
import { bloomLog, formatAddress, inCurrencyFormat } from "@/lib/utils";

interface DisputeCardProps {
  dispute: ExtendedDispute;
}
export default function DisputeCard({ dispute }: DisputeCardProps) {
  const { address: signerAddress } = useAccount();
  const chainId = SUPPORTED_CHAIN_ID as TypeChainId;

  const { data: disputeVote, isLoading: isLoadingDisputes } = useQuery({
    queryKey: ["disputeVote", signerAddress, dispute.disputeId.toString()],
    queryFn: () => getDisputeVote(dispute.disputeId!, signerAddress!),
    enabled: !!dispute.disputeId.toString() && !!signerAddress,
  });

  const tokenSymbol = addressToToken[chainId][dispute.feeTokenAddress];
  const tokenMeta = TOKEN_META[chainId][tokenSymbol];

  const timeRemaining = 30;
  const timeRemainingInHours = 12;

  const hasWon = disputeVote?.support == dispute.winner;
  const isActive = dispute?.winner == zeroAddress;
  const against =
    dispute.initiator == dispute.sender ? dispute.receiver : dispute.sender;
  const disputeFee = tokenMeta
    ? inCurrencyFormat(formatUnits(dispute.disputeFee, tokenMeta.decimal))
    : 0;

  const disputeId = dispute.disputeId.toString();

  return (
    <>
      {isActive ? (
        <Card className="bg-slate-900/95 border border-cyan-500/30 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
          {/* Status Stripe based on voting duration */}
          <span
            className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
              timeRemainingInHours <= 12
                ? "bg-red-500"
                : timeRemainingInHours <= 24
                ? "bg-yellow-400"
                : "bg-green-500"
            }`}
          />

          {/* Optional Badge */}
          <span className="absolute top-4 right-4 bg-cyan-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
            New
          </span>

          {/* Left Side: Dispute Info */}
          <div className="flex-1 space-y-3">
            <h4 className="font-semibold text-white text-lg">
              Dispute #{disputeId}
            </h4>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="font-medium">
                  Initiator: {formatAddress(dispute.initiator)}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Against: {formatAddress(against)}</span>
              </span>
            </div>

            <p className="text-white/70 text-sm line-clamp-2">
              {dispute.description}
            </p>

            {/* Voting Duration */}
            <div className="flex items-center gap-2 text-sm justify-between sm:justify-start">
              <span className="text-white/80">Time Left:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  timeRemainingInHours <= 12
                    ? "bg-red-500/30 text-red-500"
                    : timeRemainingInHours <= 24
                    ? "bg-yellow-400/30 text-yellow-400"
                    : "bg-green-500/30 text-green-500"
                }`}
              >
                {timeRemainingInHours} hrs
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm justify-between sm:justify-start">
              <span className="text-white/80">Fee Paid:</span>
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-500/30 text-slate-300">
                {disputeFee} {tokenSymbol}
              </span>
            </div>
          </div>

          {/* Right Side: Action */}
          <div className="flex items-center md:justify-end mt-3 md:mt-0">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
              onClick={() => bloomLog("Vote")}
            >
              Vote Now <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          key={dispute.dealId}
          className="bg-slate-900/95 border border-cyan-500/30 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden"
        >
          {/* Status Stripe based on outcome */}
          <span
            className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
              hasWon ? "bg-green-500" : "bg-red-500"
            }`}
          />

          {/* Optional Reward Badge */}
          {/* {dispute.outcome === "Won" && dispute.reward && (
        <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
          +{dispute.reward} {dispute.token}
        </span>
      )} */}

          {/* Left Side: Dispute Info */}
          <div className="flex-1 space-y-3">
            <h4 className="font-semibold text-white text-lg">
              Dispute #{disputeId}
            </h4>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="font-medium">Initiator: {dispute.sender}</span>
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Against: {dispute.receiver}</span>
              </span>
            </div>

            <p className="text-white/70 text-sm line-clamp-2">
              {dispute.description}
            </p>

            {/* Outcome & Voting Info */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/80">Outcome:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  hasWon
                    ? "bg-green-500/30 text-green-500"
                    : "bg-red-500/30 text-red-500"
                }`}
              >
                {hasWon ? "Won" : "Lost"}
              </span>

              <span className="text-white/80">Voting:</span>
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-500/30 text-slate-300">
                Ended
              </span>
            </div>
          </div>

          {/* Right Side: Placeholder for any action (optional) */}
          <div className="flex items-center md:justify-end mt-3 md:mt-0">
            {/* You can put a "View Details" button if needed */}
            <Button className="bg-cyan-600 hover:bg-cyan-700 shadow-lg hover:shadow-xl transition-all px-6 py-3 rounded-2xl font-semibold flex items-center gap-2">
              View Details
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
