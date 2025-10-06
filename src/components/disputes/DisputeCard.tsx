import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowRight } from "lucide-react";
import {
  ExtendedDispute,
  StorageParams,
  Timer,
  TypeChainId,
  Vote,
} from "@/types";
import { useAccount } from "wagmi";
import { formatUnits, zeroAddress } from "viem";
import { SUPPORTED_CHAIN_ID, TOKEN_META, addressToToken } from "@/constants";
import {
  bloomLog,
  formatAddress,
  formatCountdown,
  inCurrencyFormat,
} from "@/lib/utils";
import Link from "next/link";

interface DisputeCardProps {
  dispute: ExtendedDispute;
  disputeVote: Vote;
  disputeTimer: Timer;
  storageParams: StorageParams;
}

export default function DisputeCard({
  dispute,
  disputeVote,
  disputeTimer,
}: DisputeCardProps) {
  const { address: signerAddress } = useAccount();
  const chainId = SUPPORTED_CHAIN_ID as TypeChainId;

  const tokenSymbol =
    addressToToken[chainId][dispute.feeTokenAddress.toLowerCase()];
  const tokenMeta = TOKEN_META[chainId][tokenSymbol];

  const disputeId = dispute.disputeId.toString();
  const isActive = dispute.winner === zeroAddress;
  const hasWon = disputeVote?.support === dispute.winner;
  const against =
    dispute.initiator === dispute.sender ? dispute.receiver : dispute.sender;

  const disputeFee = tokenMeta
    ? inCurrencyFormat(formatUnits(dispute.disputeFee, tokenMeta.decimal))
    : 0;

  // Calculate end time
  const endTime = useMemo(() => {
    return (
      (Number(disputeTimer?.startTime ?? 0) +
        Number(disputeTimer?.standardVotingDuration ?? 0) +
        Number(disputeTimer?.extendDuration ?? 0)) *
      1000
    );
  }, [disputeTimer]);

  // Countdown state
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(endTime - Date.now(), 0)
  );

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        const next = endTime - Date.now();
        return next > 0 ? next : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, isActive]);

  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMinutes = remainingHours * 60;

  const getStatusColor = (minutes: number) => {
    if (minutes <= remainingMinutes * (1 / 3))
      return { stripe: "bg-red-500", badge: "bg-red-500/30 text-red-500" };
    if (minutes <= remainingMinutes * (2 / 3))
      return {
        stripe: "bg-yellow-400",
        badge: "bg-yellow-400/30 text-yellow-400",
      };
    return { stripe: "bg-green-500", badge: "bg-green-500/30 text-green-500" };
  };

  const { stripe, badge } = getStatusColor(remainingMinutes);

  // bloomLog("Disptue vote: ", disputeVote);

  return (
    <Card className="bg-slate-900/95 border border-cyan-500/30 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
      {/* Status Stripe */}
      <span
        className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${stripe}`}
      />

      {/* Badge */}
      {isActive ? (
        <span className="absolute top-4 right-4 bg-cyan-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
          Active
        </span>
      ) : (
        <span
          className={`absolute top-4 right-4 ${
            hasWon ? "bg-emerald-600" : "bg-red-600"
          } text-white text-xs px-2 py-1 rounded-full font-semibold`}
        >
          {hasWon ? "Won" : "Lost"}
        </span>
      )}

      {/* Dispute Info */}
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
            <span className="font-medium">
              Against: {formatAddress(against)}
            </span>
          </span>
        </div>

        <p className="text-white/70 text-sm line-clamp-2">
          {dispute.description}
        </p>

        <div className="flex items-center gap-3 text-sm">
          {isActive ? (
            <>
              <span className="text-white/80">Time Left:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${badge}`}
              >
                {formatCountdown(remainingMs)}
              </span>
            </>
          ) : (
            <>
              <span className="text-white/80">Voting:</span>
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-500/30 text-slate-300">
                Ended
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/80">Fee Paid:</span>
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-500/30 text-slate-300">
            {disputeFee} {tokenSymbol}
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center md:justify-end mt-3 md:mt-0">
        {isActive ? (
          <Link href={`/vote/${dispute.dealId}`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all px-6 py-3 rounded-2xl font-semibold flex items-center gap-2">
              {disputeVote?.jurorAddress === signerAddress ? (
                "Already Voted"
              ) : (
                <>
                  Vote Now <ArrowRight className="w-4 h-4" />
                </>
              )}
              {/* Vote Now <ArrowRight className="w-4 h-4" /> */}
            </Button>
          </Link>
        ) : (
          <Button className="bg-cyan-600 hover:bg-cyan-700 shadow-lg hover:shadow-xl transition-all px-6 py-3 rounded-2xl font-semibold flex items-center gap-2">
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
}
