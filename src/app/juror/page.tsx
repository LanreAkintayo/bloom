"use client";

import React, { useEffect, useMemo, useState } from "react";
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
      {
        queryKey: ["rewards", signerAddress],
        queryFn: () => getManyJurorPayments(signerAddress!, supportedTokens),
        enabled: !!signerAddress,
      },
    ],
  }) as [
    { data?: StorageParams },
    { data?: Juror },
    { data?: bigint[] },
    { data?: TokenPayment[] }
  ];

  const [
    storageParamsResult,
    jurorResult,
    disputeHistoryResult,
    rewardsResult,
  ] = results;

  // Safely extract data with fallbacks
  const storageParams = storageParamsResult.data ?? null;
  const juror = jurorResult.data ?? null;
  const disputeIds = disputeHistoryResult.data ?? [];
  const rewards = rewardsResult.data ?? [];

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
  }) as [{ data?: ExtendedDispute[] }, { data?: Vote[] }, { data?: Timer[] }];

  const [disputesResult, disputeVotesResult, disputeTimersResult] =
    dependentResults;
  const disputes = disputesResult?.data ?? [];
  const disputeVotes = disputeVotesResult?.data ?? [];
  const disputeTimers = disputeTimersResult?.data ?? [];

  // const { data: storageParams } = useQuery({
  //   queryKey: ["storageParams"],
  //   queryFn: () => getStorageParams(),
  //   enabled: true, // 👈 This is the key
  // });

  // const {
  //   data: juror,
  //   isLoading: jurorLoading,
  //   isError,
  // } = useQuery({
  //   queryKey: ["juror", signerAddress],
  //   queryFn: () => getJuror(signerAddress!),
  //   enabled: !!signerAddress, // 👈 This is the key
  // });

  // const { data: disputeIds, isLoading: isLoadingHistory } = useQuery({
  //   queryKey: ["jurorDisputeHistory", signerAddress],
  //   queryFn: () => getJurorDisputeHistory(signerAddress!),
  //   enabled: !!signerAddress,
  // });

  // const { data: disputes } = useQuery({
  //   queryKey: ["disputes", disputeIds?.map((d) => d.toString())],
  //   queryFn: () => getManyDisputes(disputeIds!),
  //   enabled: !!disputeIds?.length,
  // });

  // const { data: disputeVotes } = useQuery({
  //   queryKey: [
  //     "manyDisputeVotes",
  //     signerAddress,
  //     disputeIds?.map((d) => d.toString()),
  //   ],
  //   queryFn: () => getManyDisputeVote(disputeIds!, signerAddress!),
  //   enabled: !!signerAddress && !!disputeIds,
  // });

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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white">Juror Dashboard</h1>
          <p className="text-white/70 mt-1 text-sm">
            Track your disputes, reputation, and rewards.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="space-y-6 sm:mt-16">
            {/* Staked & Reputation Card */}
            {juror && <StatsCard juror={juror} />}

            {/* Rewards Card */}
            {rewards && <RewardsCard rewards={rewards} onClaim={handleClaim} />}
          </div>

          {/* Right Panel */}
          <div className="space-y-6 lg:col-span-2">
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

            {/* Content Area */}
            {/* Dispute List */}
            {activeDisputes && pastDisputes && (
              <div className="space-y-4">
                {(activeTab === "active" ? activeDisputes : pastDisputes)
                  .slice()
                  .map((_, index, array) => {
                    const dispute = array[array.length - 1 - index];
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
            )}

            {/* Rules Section */}
            <Card className="bg-slate-900/95 border border-slate-700 shadow-lg">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-cyan-400" />
                  Rules & Guidelines
                </h3>
                <ul className="list-disc list-inside text-white/70 space-y-1 text-sm">
                  <li>
                    Ensure you review disputes promptly to maintain reputation.
                  </li>
                  <li>Staked BLM affects your selection chances.</li>
                  <li>Claim rewards regularly to keep track of earnings.</li>
                  <li>Do not miss voting deadlines.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
