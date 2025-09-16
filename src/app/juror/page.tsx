"use client";

import React, { useState } from "react";
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

export default function JurorDashboard() {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  // Dummy data
  const dummyStats = {
    blmStaked: 1200,
    reputation: 85,
    votesMissed: 2,
    rewards: {
      USDC: 150,
      ETH: 0.5,
    },
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6">
      {/* Page Header */}
      <div className="my-10 text-center ">
        <h1 className="text-3xl font-bold text-white">Juror Dashboard</h1>
        <p className="text-white/70 mt-1 text-sm">
          Track your disputes, reputation, and rewards.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="space-y-6">
          {/* Staked & Reputation Card */}
          <StatsCard
            blmStaked={dummyStats.blmStaked}
            reputation={dummyStats.reputation}
            votesMissed={dummyStats.votesMissed}
          />

          {/* Rewards Card */}
          <RewardsCard rewards={dummyStats.rewards} onClaim={handleClaim} />

          {/* <Card className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-black/95 border border-cyan-500/30 shadow-xl hover:shadow-2xl transition-all rounded-2xl">
          <CardContent className="px-4 space-y-4">
            <h3 className="text-xl font-semibold text-cyan-400">
              Total Rewards
            </h3>

            <div className="space-y-3">
              {Object.entries(dummyStats.rewards).map(([token, amount]) => (
                <div
                  key={token}
                  className="flex justify-between items-center bg-slate-800/60 rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 rounded-full bg-green-500" />
                    <span className="text-white/80 font-medium">{token}</span>
                  </span>
                  <span className="font-bold text-white">
                    {amount} {token}
                  </span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all mt-2">
              Claim Rewards
            </Button>
          </CardContent>
        </Card> */}
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
              Active Disputes ({dummyDisputes.active.length})
            </Button>
            <Button
              onClick={() => setActiveTab("past")}
              className={`flex-1 ${
                activeTab === "past"
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "bg-slate-800 hover:bg-slate-700 text-white/70"
              }`}
            >
              Past Disputes ({dummyDisputes.past.length})
            </Button>
          </div>

          {/* Content Area */}
          <div className="space-y-4">
            {activeTab === "active" &&
              dummyDisputes.active.map((dispute) => (
                <Card
                  key={dispute.id}
                  className="bg-slate-900/95 border border-cyan-500/30 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden"
                >
                  {/* Status Stripe based on voting duration */}
                  <span
                    className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
                      dispute.duration <= 12
                        ? "bg-red-500"
                        : dispute.duration <= 24
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
                      {dispute.title}
                    </h4>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-white/80">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium">
                          Initiator: {dispute.sender}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4 text-emerald-400" />
                        <span className="font-medium">
                          Against: {dispute.recipient}
                        </span>
                      </span>
                    </div>

                    <p className="text-white/70 text-sm line-clamp-2">
                      {dispute.dealDetails}
                    </p>

                    {/* Voting Duration */}
                    <div className="flex items-center gap-2 text-sm justify-between sm:justify-start">
                      <span className="text-white/80">Time Left:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          dispute.duration <= 12
                            ? "bg-red-500/30 text-red-500"
                            : dispute.duration <= 24
                            ? "bg-yellow-400/30 text-yellow-400"
                            : "bg-green-500/30 text-green-500"
                        }`}
                      >
                        {dispute.duration} hrs
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm justify-between sm:justify-start">
                      <span className="text-white/80">Fee Paid:</span>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-500/30 text-slate-300">
                        {dispute.fee} {dispute.token}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Action */}
                  <div className="flex items-center md:justify-end mt-3 md:mt-0">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
                      onClick={() => navigateToDispute(dispute.id)}
                    >
                      Vote Now <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}

            {activeTab === "past" &&
              dummyDisputes.past.map((dispute) => (
                <Card
                  key={dispute.id}
                  className="bg-slate-900/95 border border-cyan-500/30 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden"
                >
                  {/* Status Stripe based on outcome */}
                  <span
                    className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
                      dispute.outcome === "Won" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />

                  {/* Optional Reward Badge */}
                  {dispute.outcome === "Won" && dispute.reward && (
                    <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      +{dispute.reward} {dispute.token}
                    </span>
                  )}

                  {/* Left Side: Dispute Info */}
                  <div className="flex-1 space-y-3">
                    <h4 className="font-semibold text-white text-lg">
                      {dispute.title}
                    </h4>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-white/80">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium">
                          Initiator: {dispute.sender}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4 text-emerald-400" />
                        <span className="font-medium">
                          Against: {dispute.recipient}
                        </span>
                      </span>
                    </div>

                    <p className="text-white/70 text-sm line-clamp-2">
                      {dispute.dealDetails}
                    </p>

                    {/* Outcome & Voting Info */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white/80">Outcome:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          dispute.outcome === "Won"
                            ? "bg-green-500/30 text-green-500"
                            : "bg-red-500/30 text-red-500"
                        }`}
                      >
                        {dispute.outcome}
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
  );
}
