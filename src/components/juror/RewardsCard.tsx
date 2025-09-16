"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";

interface RewardsCardProps {
  rewards: Record<string, number>;
  onClaim: (token: string, amount: number) => void;
}

export default function RewardsCard({ rewards, onClaim }: RewardsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>(
    Object.keys(rewards)[0] || ""
  );
  const [claimAmount, setClaimAmount] = useState<number>(
    rewards[selectedToken] || 0
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleOpenModal = () => {
    setSelectedToken(Object.keys(rewards)[0] || "");
    setClaimAmount(rewards[Object.keys(rewards)[0]] || 0);
    setIsModalOpen(true);
  };

  const handleTokenChange = (token: string) => {
    setSelectedToken(token);
    setClaimAmount(rewards[token]);
    setDropdownOpen(false);
  };

  const handleMax = () => setClaimAmount(rewards[selectedToken]);

  const handleClaim = () => {
    if (claimAmount > 0) {
      onClaim(selectedToken, claimAmount);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      {/* Rewards Card */}
      <Card className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-black/95 border border-cyan-500/30 shadow-xl hover:shadow-2xl transition-all rounded-2xl">
        <CardContent className="px-4 space-y-4">
          <h3 className="text-xl font-semibold text-cyan-400">Total Rewards</h3>

          <div className="space-y-3">
            {Object.entries(rewards).map(([token, amount]) => (
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

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all mt-2"
            onClick={handleOpenModal}
          >
            Claim Rewards
          </Button>
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl shadow-2xl p-6 w-full max-w-md relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <h3 className="text-2xl font-bold text-cyan-400 mb-6 text-center">
              Claim Your Reward
            </h3>

            {/* Custom Dropdown */}
            <div className="mb-5 relative">
              <label className="block text-white/80 mb-2 font-medium">Select Token</label>
              <button
                className="w-full bg-slate-800/60 text-white rounded-xl px-4 py-3 flex items-center justify-between focus:ring-2 focus:ring-cyan-400 transition-all"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-green-500" />
                  {selectedToken}
                </span>
                <ChevronDown className="w-4 h-4 text-white/70" />
              </button>

              {dropdownOpen && (
                <ul className="absolute z-10 mt-2 w-full bg-slate-800/80 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {Object.keys(rewards).map((token) => (
                    <li
                      key={token}
                      onClick={() => handleTokenChange(token)}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-cyan-600 cursor-pointer transition-colors"
                    >
                      <span className="w-4 h-4 rounded-full bg-green-500" />
                      <span className="text-white/80">{token}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Amount Input */}
            <div className="mb-6 flex items-center gap-3 bg-slate-800/60 rounded-xl">
              <input
                type="number"
                className="flex-1 px-4 py-3 rounded-xl text-black font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all text-white"
                value={claimAmount}
                min={0}
                max={rewards[selectedToken]}
                onChange={(e) =>
                  setClaimAmount(
                    Math.min(Number(e.target.value), rewards[selectedToken])
                  )
                }
              />
              <button
                className="bg-cyan-600 hover:bg-cyan-700 px-4 py-3 rounded-xl text-white font-semibold transition-all shadow-md hover:shadow-lg"
                onClick={handleMax}
              >
                Max
              </button>
            </div>

            {/* Claim Button */}
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all text-lg font-semibold py-3 rounded-xl"
              onClick={handleClaim}
            >
              Claim
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
