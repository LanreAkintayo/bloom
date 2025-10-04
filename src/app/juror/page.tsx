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
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  getDispute,
  getJuror,
  getJurorDisputeHistory,
  getJurorTokenPayment,
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

  const {
    data: juror,
    isLoading: jurorLoading,
    isError,
  } = useQuery({
    queryKey: ["juror", signerAddress],
    queryFn: () => getJuror(signerAddress!),
    enabled: !!signerAddress, // 👈 This is the key
  });

  const { data: disputeIds, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["jurorDisputeHistory", signerAddress],
    queryFn: () => getJurorDisputeHistory(signerAddress!),
    enabled: !!signerAddress,
  });

  const { data: disputes, isLoading: isLoadingDisputes } = useQuery({
    queryKey: ["disputes", disputeIds?.map((id) => id.toString())],
    queryFn: async () => {
      const results = await Promise.all(
        disputeIds!.map((id) => {
          const dispute = getDispute(id);
          return dispute;
        })
      );
      return results;
    },
    enabled: !!disputeIds && disputeIds.length > 0,
  });

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

  // const pastDisputes = useMemo(
  //   () => disputes?.filter((d: Dispute) => d.winner),
  //   [disputes]
  // );

  const { data: rewards } = useQuery({
    queryKey: ["rewards", supportedTokens, signerAddress],
    queryFn: async () => {
      bloomLog("Supported Tokens: ", supportedTokens);
      bloomLog("signer address: ", signerAddress);
      const results = await Promise.all(
        supportedTokens.map(async (tokenAddress) => {
          const payment = (await getJurorTokenPayment(
            signerAddress!,
            tokenAddress as Address
          )) as bigint;

          const symbol = addressToToken[chainId]?.[tokenAddress.toLowerCase()];
          const tokenMeta = TOKEN_META[chainId][symbol];
          const image = IMAGES[symbol];

          return { payment, image, ...tokenMeta, address: tokenAddress };
        })
      );
      return results;
    },
    enabled: !!signerAddress && supportedTokens.length > 0,
  });

  bloomLog("juror: ", juror);
  bloomLog("disputeids: ", disputeIds);
  bloomLog("Disputes: ", disputes);
  bloomLog("Rewards: ", rewards);

  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  // Dummy data

  const dummyDisputes = {
    active: [
      {
        id: 1,
        title: "Dispute #1023",
        sender: "0xA1B2...C3D4",
        recipient: "0xE5F6...G7H8",
        dealDetails: "Buyer claims seller did not deliver the agreed NFT",
        duration: 8, // voting duration in hours (urgent)
        token: "USDC",
        fee: 100,
      },
      {
        id: 2,
        title: "Dispute #1027",
        sender: "0xI9J0...K1L2",
        recipient: "0xM3N4...O5P6",
        dealDetails: "Seller claims buyer refused payment after delivery",
        duration: 20, // voting duration in hours (medium)
        token: "ETH",
        fee: 0.5,
      },
      {
        id: 3,
        title: "Dispute #1030",
        sender: "0xQ7R8...S9T0",
        recipient: "0xU1V2...W3X4",
        dealDetails: "Buyer claims seller sent wrong NFT",
        duration: 36, // voting duration in hours (plenty of time)
        token: "USDC",
        fee: 500,
      },
    ],
    past: [
      {
        id: 4,
        title: "Dispute #1010",
        sender: "0xA9B8...C7D6",
        recipient: "0xE5F4...G3H2",
        dealDetails: "Seller delivered partially defective NFT",
        token: "USDC",
        reward: 20, // reward won
        outcome: "Won",
      },
      {
        id: 5,
        title: "Dispute #1005",
        sender: "0xI1J2...K3L4",
        recipient: "0xM5N6...O7P8",
        dealDetails: "Buyer refused to pay for NFT delivery",
        token: "ETH",
        reward: 0, // no reward since lost
        outcome: "Lost",
      },
    ],
  };

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
          <div className="space-y-6">
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
            <div className="space-y-4">
              {activeTab === "active" &&
                activeDisputes &&
                activeDisputes.map((dispute: ExtendedDispute | null) => (
                  <DisputeCard key={dispute!.disputeId} dispute={dispute!} />
                ))}
              {activeTab === "past" &&
                pastDisputes &&
                pastDisputes.map((dispute: ExtendedDispute | null) => (
                  <DisputeCard key={dispute!.disputeId.toString()} dispute={dispute!} />
                ))}
            </div>

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
