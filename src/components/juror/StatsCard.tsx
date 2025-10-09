"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Coins, Star, AlertCircle } from "lucide-react";
import { Juror } from "@/types";
import { formatLargeNumber, inCurrencyFormat } from "@/lib/utils";
import { formatUnits } from "viem";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// 1. Import the new component and its CSS
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface StatsProps {
  juror: Juror;
}

export default function StatsCard({ juror }: StatsProps) {
  const votesMissed = Number(juror.missedVotesCount);
  const formattedAmount = formatUnits(juror.stakeAmount, 18);
  const stakedAmount = inCurrencyFormat(formatUnits(juror.stakeAmount, 18));
  const abbreviatedStake = formatLargeNumber(BigInt(formattedAmount));
  const fullStake = Number(formatUnits(juror.stakeAmount, 18)).toLocaleString();
  const reputation = juror.reputation;
  const maxMissed = 5;
  const percentage = Math.min((votesMissed / maxMissed) * 100, 100);

  // Logic for color remains the same, but we'll use the hex values for the library
  const votesColorHex =
    votesMissed < 2
      ? "#22C55E" // green-500
      : votesMissed < 4
      ? "#FBBF24" // yellow-400
      : "#EF4444"; // red-500

  const votesColorClass =
    votesMissed < 2
      ? "text-emerald-400"
      : votesMissed < 4
      ? "text-yellow-400"
      : "text-red-500";

  return (
    <Card className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-sm xs:p-2 xs:py-3">
      <div className="absolute -top-1/4 left-1/2 -z-10 h-1/2 w-full -translate-x-1/2 rounded-full bg-emerald-800/15 blur-3xl"></div>

      <CardHeader className="border-b border-white/10 p-4">
        <h3 className="text-lg font-semibold text-white">Your Juror Stats</h3>
      </CardHeader>

      <CardContent className="px-3 xs:p-4 sm:p-0">
        <div className="grid grid-cols-2 gap-3 xs:gap-6">
          <div className="col-span-2 flex flex-col items-center justify-center rounded-xl bg-slate-900/70 px-4 py-4 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <AlertCircle className={`h-5 w-5 ${votesColorClass}`} />
              <span className="font-semibold text-white">Votes Missed</span>
            </div>

            {/* 2. Replace the entire <svg> block with this component */}
            <div className="my-3 h-20 w-20">
              <CircularProgressbar
                value={percentage}
                text={`${votesMissed}/${maxMissed}`}
                strokeWidth={12}
                styles={buildStyles({
                  textColor: "#FFFFFF", // White text
                  pathColor: votesColorHex, // Dynamic color (green, yellow, red)
                  trailColor: "rgba(51, 65, 85, 0.5)", // slate-700 with opacity
                  textSize: "28px",
                })}
              />
            </div>

            {votesMissed >= 4 && (
              <p
                className={`text-center text-xs font-medium ${votesColorClass}`}
              >
                {votesMissed >= 5
                  ? "You are blocked from selection"
                  : "Warning: Next missed vote will block you"}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-900/70 border border-slate-700/50 p-4 text-center">
            <Coins className="h-6 w-6 text-emerald-400" />
            <p className="text-xs text-slate-400">BLM Staked</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="cursor-pointer text-xl font-bold text-white underline decoration-slate-500 decoration-dotted underline-offset-4">
                    {abbreviatedStake}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="border-slate-700 bg-slate-800 text-white">
                  <p>{fullStake} BLM</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-900/70 border border-slate-700/50 p-4 text-center">
            <Star className="h-6 w-6 text-cyan-400" />
            <p className="text-xs text-slate-400">Reputation</p>
            <p className="text-xl font-bold text-white">{reputation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
