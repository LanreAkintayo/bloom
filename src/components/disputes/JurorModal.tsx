"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// Import Skeleton component (you might need to create this or use one from a library)
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a basic Skeleton component
import { getChainConfig, SUPPORTED_CHAIN_ID } from "@/constants";
import {
  getDisputeVote,
  getJuror,
  getJurorCandidate,
} from "@/hooks/useDisputeStorage";
import { bloomLog, formatAddress, inCurrencyFormat } from "@/lib/utils";
import { TypeChainId } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Address, formatUnits, zeroAddress } from "viem";

interface JurorModalProps {
  open: boolean;
  onClose: () => void;
  disputeId: bigint;
  jurorAddress: Address;
  plaintiff: Address;
  defendant: Address;
}

// Helper component for the Skeleton layout
const JurorModalSkeleton = () => (
  <div className="space-y-4 mt-3 text-sm">
    {/* Juror Address Skeleton */}
    <div className="flex justify-between border-b border-slate-800 pb-2">
      <span className="text-slate-400">Address</span>
      <Skeleton className="h-4 w-28 bg-slate-700" />
    </div>
    {/* Voted For Skeleton */}
    <div className="flex justify-between border-b border-slate-800 pb-2">
      <span className="text-slate-400">Voted For</span>
      <Skeleton className="h-4 w-20 bg-slate-700" />
    </div>
    {/* Stake Skeleton */}
    <div className="flex justify-between border-b border-slate-800 pb-2">
      <span className="text-slate-400">Stake</span>
      <Skeleton className="h-4 w-16 bg-slate-700" />
    </div>
    {/* Reputation Skeleton */}
    <div className="flex justify-between">
      <span className="text-slate-400">Reputation</span>
      <Skeleton className="h-4 w-16 bg-slate-700" />
    </div>
  </div>
);

export default function JurorModal({
  open,
  onClose,
  disputeId,
  jurorAddress,
  plaintiff,
  defendant,
}: JurorModalProps) {
  const chainId = SUPPORTED_CHAIN_ID as TypeChainId;

  // Destructure the loading state from useQuery
  const { data: juror, isLoading: isJurorLoading } = useQuery({
    queryKey: ["disputeId", chainId, jurorAddress],
    queryFn: () => getJuror(jurorAddress),
    enabled: !!jurorAddress,
    staleTime: 60_000,
  });

  const { data: candidate } = useQuery({
    queryKey: ["jurorCandidate", chainId, disputeId?.toString(), jurorAddress],
    queryFn: () => getJurorCandidate(disputeId!, jurorAddress),
    enabled: !!disputeId && !!jurorAddress,
    staleTime: 60_000,
  });

  // Destructure the loading state from useQuery
  const { data: disputeVote, isLoading: isVoteLoading } = useQuery({
    queryKey: ["disputeVote", chainId, disputeId?.toString(), jurorAddress],
    queryFn: () => getDisputeVote(disputeId!, jurorAddress),
    enabled: !!disputeId && !!jurorAddress,
    staleTime: 60_000,
  });

  // Determine the overall loading state
  const isLoading = isJurorLoading || isVoteLoading;

//   bloomLog("DisputeVote: ", disputeVote);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl text-white shadow-lg max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-emerald-400">
            Juror Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <JurorModalSkeleton />
        ) : juror && disputeVote ? (
          <div className="space-y-4 mt-3 text-sm">
            <div className="flex justify-between border-b border-slate-800 pb-2"></div>

            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Address</span>
              <span className="font-medium">
                {formatAddress(juror.jurorAddress)}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Voted For</span>
              <span
                className={`font-semibold ${
                  disputeVote.support == plaintiff
                    ? "text-cyan-400"
                    : disputeVote.support == defendant
                    ? "text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {disputeVote.support &&
                  (disputeVote.support == zeroAddress
                    ? "No Vote"
                    : formatAddress(disputeVote?.support))}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Stake</span>
              <span className="text-emerald-400 font-medium">
                {inCurrencyFormat(formatUnits(juror.stakeAmount, 18)) ||
                  "0 BLM"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reputation</span>
              <span className="text-emerald-400 font-medium">
                {juror.reputation || "0 BLM"}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-red-400">
            Could not load juror data.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
