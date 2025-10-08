"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getChainConfig, SUPPORTED_CHAIN_ID } from "@/constants";
import {
  getDisputeVote,
  getJuror,
  getJurorCandidate,
} from "@/hooks/useDisputeStorage";
import { formatAddress } from "@/lib/utils";
import { TypeChainId } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

interface JurorModalProps {
  open: boolean;
  onClose: () => void;
  disputeId: bigint;
  jurorAddress: Address;
}

export default function JurorModal({
  open,
  onClose,
  disputeId,
  jurorAddress,
}: JurorModalProps) {

  const chainId = SUPPORTED_CHAIN_ID as TypeChainId;

  const { data: juror } = useQuery({
    queryKey: ["disputeId", chainId, jurorAddress],
    queryFn: () => getJuror(jurorAddress),
    enabled: !!jurorAddress,
    staleTime: 60_000,
  });

  const { data: candidate } = useQuery({
    queryKey: ["disputeId", chainId, disputeId.toString(), jurorAddress],
    queryFn: () => getJurorCandidate(disputeId!, jurorAddress),
    enabled: !!disputeId && !!jurorAddress,
    staleTime: 60_000,
  });

  const { data: disputeVote } = useQuery({
    queryKey: ["disputeId", chainId, disputeId.toString(), jurorAddress],
    queryFn: () => getDisputeVote(disputeId!, jurorAddress),
    enabled: !!disputeId && !!jurorAddress,
    staleTime: 60_000,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-950 via-slate-900 to-black border border-slate-800 rounded-2xl text-white shadow-lg max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-emerald-400">
            Juror Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-3 text-sm">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Juror ID</span>
            <span className="font-medium">{juror?.id}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Address</span>
            <span className="font-medium">{formatAddress(juror?.address)}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Voted For</span>
            <span
              className={`font-semibold ${
                juror.vote === "Plaintiff"
                  ? "text-cyan-400"
                  : juror.vote === "Defendant"
                  ? "text-emerald-400"
                  : "text-slate-400"
              }`}
            >
              {juror.vote || "Pending"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Reward</span>
            <span className="text-emerald-400 font-medium">
              {juror.reward || "0 USDC"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
