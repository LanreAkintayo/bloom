"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Coins, FileText } from "lucide-react";

export default function WalletCard() {
  return (
    <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-2">
          <Coins className="text-emerald-500" />
          <h2 className="text-xl font-bold text-white">Your Wallet Balances</h2>
        </div>

        <div className="text-sm text-white/70 mb-4 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-white/70" />
          <span className="truncate w-52">0xA1b2...3c4D</span>
        </div>

        <div className="mb-4 p-3 bg-slate-800/90 rounded-lg text-sm border border-emerald-600/40 text-white/70">
          <span className="font-semibold text-emerald-400">Total Balance:</span>{" "}
          1,500 USDC + 2 ETH
        </div>

        <ul className="space-y-2 text-white/70 text-sm">
          <li className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-cyan-400" /> BLM
            </span>
            <span className="font-medium text-white">1000 BLM</span>
          </li>
          <li className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-cyan-400" /> USDC
            </span>
            <span className="font-medium text-white">500 USDC</span>
          </li>
          <li className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-400" /> DAI
            </span>
            <span className="font-medium text-white">300 DAI</span>
          </li>
          <li className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-400" /> ETH
            </span>
            <span className="font-medium text-white">2 ETH</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
