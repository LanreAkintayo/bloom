"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Wallet, CheckCircle, XCircle, Info } from "lucide-react";
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
      { id: 1, title: "Dispute #1023", token: "USDC", amount: 100 },
      { id: 2, title: "Dispute #1027", token: "ETH", amount: 0.2 },
    ],
    past: [
      {
        id: 3,
        title: "Dispute #1010",
        token: "USDC",
        amount: 50,
        outcome: "Won",
      },
      {
        id: 4,
        title: "Dispute #1005",
        token: "ETH",
        amount: 0.1,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                className="bg-slate-900/95 border border-cyan-500/30 shadow-lg flex justify-between items-center p-4"
              >
                <div>
                  <h4 className="font-medium text-white">{dispute.title}</h4>
                  <span className="text-white/70">
                    {dispute.amount} {dispute.token}
                  </span>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Vote Now
                </Button>
              </Card>
            ))}

          {activeTab === "past" &&
            dummyDisputes.past.map((dispute) => (
              <Card
                key={dispute.id}
                className="bg-slate-900/95 border border-slate-500/30 shadow-lg flex justify-between items-center p-4"
              >
                <div>
                  <h4 className="font-medium text-white">{dispute.title}</h4>
                  <span className="text-white/70">
                    {dispute.amount} {dispute.token} — {dispute.outcome}
                  </span>
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
  );
}
