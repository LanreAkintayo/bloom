"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Star, AlertCircle } from "lucide-react";
import { Juror } from "@/types";
import { inCurrencyFormat } from "@/lib/utils";
import { formatUnits } from "viem";

interface StatsProps {
  juror: Juror;
}

export default function StatsCard({ juror }: StatsProps) {
  // Calculate circle progress
  const votesMissed = Number(juror.missedVotesCount);
  const stakedAmount = inCurrencyFormat(formatUnits(juror.stakeAmount, 18));
  const reputation = juror.reputation;
  const maxMissed = 5;

  const percentage = Math.min((votesMissed / maxMissed) * 100, 100);
  const votesColor =
    votesMissed < 2
      ? "text-green-400"
      : votesMissed === 2
      ? "text-yellow-400"
      : "text-red-500";

  return (
    <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg hover:shadow-xl transition-shadow rounded-xl">
      <CardContent className="p-2 px-4 space-y-3">
        <h3 className="text-xl font-semibold text-emerald-400">Your Stats</h3>

        {/* BLM Staked */}
        <div className="flex-1 bg-slate-800/60 rounded-xl p-3 flex justify-between items-center shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 text-sm">
            <Coins className="w-5 h-5 text-emerald-400" />
            <span className="text-white/80 font-medium">BLM Staked</span>
          </div>
          <span className="font-bold text-white text-sm">
            {stakedAmount} BLM
          </span>
        </div>

        {/* Reputation */}
        <div className="flex-1 bg-slate-800/60 rounded-xl p-3 flex justify-between items-center shadow-md hover:shadow-lg transition-shado text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium">Reputation</span>
          </div>
          <span className="font-bold text-white">{reputation}</span>
        </div>

        {/* Votes Missed Circular Donut */}
        <div className="flex-1 bg-slate-800/60 rounded-xl p-3 flex justify-between items-center shadow-md hover:shadow-lg transition-shadow text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-6 h-6 ${votesColor}`} />
            <span className="text-white font-medium">Votes Missed</span>
          </div>

          <svg className="w-12 h-12" viewBox="0 0 36 36">
            <circle
              className="text-slate-800"
              strokeWidth="3"
              stroke="currentColor"
              fill="transparent"
              r="16"
              cx="18"
              cy="18"
            />
            <circle
              className={votesColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${percentage}, 100`}
              stroke="currentColor"
              fill="transparent"
              r="16"
              cx="18"
              cy="18"
              transform="rotate(-90 18 18)"
            />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              className="text-white text-xs"
              fill="currentColor"
            >
              <tspan>{votesMissed}</tspan>
              <tspan dx="2">/</tspan>
              <tspan dx="2">{maxMissed}</tspan>
            </text>
          </svg>
        </div>

        {votesMissed >= 2 && (
          <p className="text-sm text-slate-400 mt-1">
            {votesMissed === 2
              ? "Warning: Next missed vote will block selection"
              : "You are currently blocked from selection"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
