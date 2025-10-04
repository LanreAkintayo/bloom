"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";
import { Juror, Token, TypeChainId, TokenPayment } from "@/types";
import { bloomLog, inCurrencyFormat } from "@/lib/utils";
import { formatUnits } from "viem";

interface RewardsCardProps {
  rewards: TokenPayment[];
  onClaim: (token: string, amount: number) => void;
}

export default function RewardsCard({ rewards, onClaim }: RewardsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>(
    Object.keys(rewards)[0] || ""
  );
  // const [claimAmount, setClaimAmount] = useState<number>(
  //   rewards[selectedToken] || 0
  // );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // const handleOpenModal = () => {
  //   setSelectedToken(Object.keys(rewards)[0] || "");
  //   setClaimAmount(rewards[Object.keys(rewards)[0]] || 0);
  //   setIsModalOpen(true);
  // };

  // const handleTokenChange = (token: string) => {
  //   setSelectedToken(token);
  //   setClaimAmount(rewards[token]);
  //   setDropdownOpen(false);
  // };

  // const handleMax = () => setClaimAmount(rewards[selectedToken]);

  return (
    <>
      {/* Rewards Card */}
      <Card className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-black/95 border border-cyan-500/30 shadow-xl hover:shadow-2xl transition-all rounded-2xl">
        <CardContent className="px-4 space-y-4">
          <h3 className="text-xl font-semibold text-cyan-400">Total Rewards</h3>

          <div className="space-y-3">
            {rewards.length > 0 &&
              rewards.map((currentReward: TokenPayment, index) => {
                const amount =
                  currentReward.payment > 0
                    ? inCurrencyFormat(
                        formatUnits(
                          currentReward.payment,
                          currentReward.decimal
                        )
                      )
                    : 0;
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-slate-800/60 rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 rounded-full bg-green-500" />
                      <span className="text-white/80 font-medium">
                        {currentReward.name}
                      </span>
                    </span>
                    <span className="font-bold text-white">
                      {amount} {currentReward.symbol}
                    </span>
                  </div>
                );
              })}
          </div>

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all mt-2"
            onClick={() => {
              bloomLog("Claim Rewards");
            }}
          >
            Claim Rewards
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
