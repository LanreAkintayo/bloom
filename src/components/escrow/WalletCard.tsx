"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Coins } from "lucide-react";
import useDefi from "@/hooks/useDefi";
import { formatAddress, inCurrencyFormat } from "@/lib/utils";
import Image from "next/image";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

export default function WalletCard() {
  const { userWalletTokens } = useDefi(); // userWalletTokens starts as null
  const { address } = useAccount();

  const skeletonCount = 4; // number of placeholder rows

  return (
    <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg animate-fadeIn">
      <CardContent className="">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-2">
          <Coins className="text-emerald-500" />
          <h2 className="text-xl font-bold text-white">Your Wallet Balances</h2>
        </div>

         {/* <div className="mb-4 p-3 bg-slate-800/90 rounded-lg text-sm border border-emerald-600/40 text-white/70">
          <span className="font-semibold text-emerald-400">Total Balance:</span>{" "}
          1,500 USDC
        </div> */}

        {/* Wallet address */}
        {address ? (
          <div className="text-sm text-white/70 my-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-white/70" />
            <span className="truncate w-52">{formatAddress(address)}</span>
          </div>
        ) : (
          <div className="h-4 w-52 bg-slate-700/50 rounded animate-pulse mb-4"></div>
        )}

        {/* Friendly message while tokens are null */}
        {userWalletTokens === null && (
          <div className="mb-4 text-sm text-white/50 italic">
            Counting your treasures... 🪙
          </div>
        )}

        {/* Token list */}
        <ul className="space-y-2 text-white/70 text-sm">
          {userWalletTokens === null
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-slate-700/50 rounded-full"></div>
                    <div className="h-4 w-20 bg-slate-700/50 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-slate-700/50 rounded"></div>
                </li>
              ))
            : userWalletTokens.map((token, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg transition-all duration-300 hover:bg-slate-800/90"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={token.image}
                      alt={token.name}
                      width={20}
                      height={20}
                    />
                    {token.name}
                  </div>
                  <span className="font-medium text-white">
                    {inCurrencyFormat(formatUnits(token.balance, token.decimal))}{" "}
                    {token.symbol}
                  </span>
                </li>
              ))}
        </ul>
      </CardContent>
    </Card>
  );
}
