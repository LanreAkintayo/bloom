"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Coins,
  Wallet,
  CheckCircle,
  XCircle,
  Info,
  User,
  ArrowRight,
  ShieldCheck,
  FileSearch,
} from "lucide-react";
import StatsCard from "@/components/juror/StatsCard";
import RewardsCard from "@/components/juror/RewardsCard";
import Header from "@/components/Header";
import { useAccount } from "wagmi";
import {
  Juror,
  Token,
  TypeChainId,
  TokenPayment,
  Dispute,
  ExtendedDispute,
  Vote,
  Timer,
  StorageParams,
} from "@/types";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getDispute,
  getJuror,
  getJurorDisputeHistory,
  getJurorTokenPayment,
  getManyDisputes,
  getManyDisputeTimer,
  getManyDisputeVote,
  getManyJurorPayments,
  getStorageParams,
} from "@/hooks/useDisputeStorage";
import { bloomLog } from "@/lib/utils";
import {
  addressToToken,
  IMAGES,
  SUPPORTED_CHAIN_ID,
  supportedTokens,
  TOKEN_META,
} from "@/constants";
import { Address, zeroAddress } from "viem";
import DisputeCard from "@/components/disputes/DisputeCard";
import RewardModal from "@/components/juror/RewardModal";
import DisputeCardSkeleton from "@/components/disputes/DisputeCardSkeleton";
import EmptyState from "@/components/EmptyState";

export default function JurorDashboard() {
  const { address: signerAddress } = useAccount();
  const chainId = SUPPORTED_CHAIN_ID as TypeChainId;

  // Fetch all independent data in parallel using useQueries
  const results = useQueries({
    queries: [
      {
        queryKey: ["storageParams"],
        queryFn: getStorageParams,
        enabled: true,
      },
      {
        queryKey: ["juror", signerAddress],
        queryFn: () => getJuror(signerAddress!),
        enabled: !!signerAddress,
      },
      {
        queryKey: ["jurorDisputeHistory", signerAddress],
        queryFn: () => getJurorDisputeHistory(signerAddress!),
        enabled: !!signerAddress,
      },
    ],
  }) as [{ data?: StorageParams }, { data?: Juror }, { data?: bigint[] }];

  const [storageParamsResult, jurorResult, disputeHistoryResult] = results;

  const { data: rewards, refetch: refetchRewards } = useQuery({
    queryKey: ["rewards", signerAddress],
    queryFn: () => getManyJurorPayments(signerAddress!, supportedTokens),
    enabled: !!signerAddress,
  });

  // Safely extract data with fallbacks
  const storageParams = storageParamsResult.data ?? null;
  const juror = jurorResult.data ?? null;
  const disputeIds = disputeHistoryResult.data ?? [];
  // const rewards = rewardsResult.data ?? [];

  const dependentResults = useQueries({
    queries: [
      {
        queryKey: ["disputes", disputeIds?.map((d) => d.toString())],
        queryFn: () => getManyDisputes(disputeIds!),
        enabled: !!disputeIds?.length,
      },
      {
        queryKey: [
          "disputeVotes",
          signerAddress,
          disputeIds?.map((d) => d.toString()),
        ],
        queryFn: () => getManyDisputeVote(disputeIds!, signerAddress!),
        enabled: !!signerAddress && !!disputeIds?.length,
      },
      {
        queryKey: ["disputeTimers", disputeIds?.map((d) => d.toString())],
        queryFn: () => getManyDisputeTimer(disputeIds!),
        enabled: !!disputeIds?.length,
      },
    ],
  }) as [
    { data?: ExtendedDispute[]; isLoading: boolean },
    { data?: Vote[]; isLoading: boolean },
    { data?: Timer[]; isLoading: boolean }
  ];

  const isDisputesLoading = dependentResults[0].isLoading;

  bloomLog("Is disputes loading:", isDisputesLoading);

  const [disputesResult, disputeVotesResult, disputeTimersResult] =
    dependentResults;

  bloomLog("Disputes Result ", disputesResult?.data);
  const disputes = disputesResult?.data ?? null;
  const disputeVotes = disputeVotesResult?.data ?? null;
  const disputeTimers = disputeTimersResult?.data ?? null;

  bloomLog("Disputes: ", disputes);

  const disputeVotesMap = useMemo(() => {
    if (!disputeVotes) return;
    const map = new Map<bigint, Vote>();
    disputeVotes.forEach((v) => map.set(v.disputeId, v));
    return map;
  }, [disputeVotes]);

  // const { data: disputeTimers } = useQuery({
  //   queryKey: ["manyDisputeTimers", disputeIds?.map((d) => d.toString())],
  //   queryFn: () => getManyDisputeTimer(disputeIds!),
  //   enabled: !!disputeIds,
  // });

  // bloomLog("DisputeVotes: ", disputeVotes);

  const disputeTimersMap = useMemo(() => {
    if (!disputeTimers) return;
    const map = new Map<bigint, Timer>();
    disputeTimers.forEach((timer) => map.set(timer.disputeId, timer));
    return map;
  }, [disputeTimers]);

  const activeDisputes = useMemo(() => {
    if (!disputes) return;
    return disputes.filter((dispute) => dispute!.winner === zeroAddress);
  }, [disputes]);

  const pastDisputes = useMemo(() => {
    if (!disputes) return;
    return disputes.filter((dispute) => dispute!.winner !== zeroAddress);
  }, [disputes]);

  bloomLog("Active disputes: ", activeDisputes);
  bloomLog("Past disputes: ", pastDisputes);

  // const { data: rewards } = useQuery({
  //   queryKey: ["rewards", signerAddress],
  //   queryFn: () => getManyJurorPayments(signerAddress!, supportedTokens),
  //   enabled: !!signerAddress,
  // });

  // bloomLog("juror: ", juror);
  // bloomLog("disputeids: ", disputeIds);
  // bloomLog("Disputes: ", disputes);
  // bloomLog("Rewards: ", rewards);

  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  bloomLog("Rewards: ", rewards);

  // Dummy data

  const handleClaim = (token: string, amount: number) => {
    console.log(`Claiming ${amount} of ${token}`);
    // Here, you would interact with your smart contract
    // Example:
    // await contract.claimReward(tokenAddress, amount);
  };

  // const [claimState, setClaimState] = useState<{ loading: boolean; text: string; error: any }>({ loading: false, text: "", error: null})>

  const disputesToShow =
    (activeTab === "active" ? activeDisputes : pastDisputes) || [];
  const hasDisputes = disputesToShow.length > 0;

  const disputeStillLoading = isDisputesLoading;

  bloomLog("Disputes to show: ", disputesToShow);

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white">My Disputes</h1>
          <p className="text-white/70 mt-1 text-sm">
            Track the status of your disputes
          </p>
        </div>
        <div className="max-w-5xl mx-auto">
          {/* Right Panel */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-4">
              <Button
                onClick={() => setActiveTab("active")}
                className={`flex-1 ${
                  activeTab === "active"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-800 hover:bg-slate-700 text-white/70"
                }`}
              >
                Active Disputes ({activeDisputes?.length ?? 0})
              </Button>
              <Button
                onClick={() => setActiveTab("past")}
                className={`flex-1 ${
                  activeTab === "past"
                    ? "bg-cyan-600 hover:bg-cyan-700"
                    : "bg-slate-800 hover:bg-slate-700 text-white/70"
                }`}
              >
                Past Disputes ({pastDisputes?.length ?? 0})
              </Button>
            </div>

            {isDisputesLoading ? (
              <div className="space-y-4">
                <DisputeCardSkeleton />
              </div>
            ) : hasDisputes ? (
              <div className="space-y-4">
                {disputesToShow
                  .slice()
                  .reverse() // Reverses the array (cleaner than index math)
                  .map((dispute) => {
                    if (!dispute) return null;
                    const vote = disputeVotesMap?.get(dispute.disputeId);
                    const timer = disputeTimersMap?.get(dispute.disputeId);
                    return (
                      <DisputeCard
                        key={dispute.disputeId.toString()}
                        dispute={dispute}
                        disputeVote={vote!}
                        disputeTimer={timer!}
                        storageParams={storageParams!}
                      />
                    );
                  })}
              </div>
            ) : (
              // 3. EMPTY STATE: If not loading and no disputes, show empty
              <EmptyState
                Icon={FileSearch}
                title="No Disputes Found"
                description={`There are no ${activeTab} disputes to display at this time.`}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
