"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Coins, Copy, Check } from "lucide-react";
import useDefi from "@/hooks/useDefi";
import { formatAddress, inCurrencyFormat } from "@/lib/utils";
import Image from "next/image";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

export default function WalletCard() {
  const { userWalletTokens } = useDefi();
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // only true after client mounts
  }, []);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const skeletonCount = 4;

  if (!mounted) {
    // while waiting for client, render a neutral loader (no wallet branch chosen yet)
    return (
      <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg animate-fadeIn">
        <CardContent>
          <div className="flex items-center space-x-2 mb-2">
            <Coins className="text-emerald-500" />
            <h2 className="text-xl font-bold text-white">
              Your Wallet Balances
            </h2>
          </div>
          <ul className="space-y-2 text-white/70 text-sm">
            {Array.from({ length: skeletonCount }).map((_, i) => (
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
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg animate-fadeIn">
      <CardContent>
        {/* Header */}
        <div className="flex items-center space-x-2 mb-2">
          <Coins className="text-emerald-500" />
          <h2 className="text-xl font-bold text-white">Your Wallet Balances</h2>
        </div>

        {/* Wallet not connected */}
        {!address && (
          <div className="my-6 text-center text-white/60">
            <Wallet className="w-6 h-6 mx-auto mb-2 text-white/50" />
            <p className="mb-1">No wallet connected</p>
            <p className="text-sm italic">
              Please connect your wallet to view balances
            </p>
          </div>
        )}

        {/* Wallet connected */}
        {address && (
          <>
            {/* Wallet address */}
            <div className="text-sm text-white/70 my-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-white/70" />
              <span className="truncate">{formatAddress(address)}</span>
              <button
                onClick={handleCopy}
                className="ml-1 p-1 rounded hover:bg-slate-700/60 transition-colors cursor-pointer"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            </div>

            {/* Loading skeleton when tokens are null */}
            {userWalletTokens === null && (
              <>
                <ul className="space-y-2 text-white/70 text-sm">
                  {Array.from({ length: skeletonCount }).map((_, i) => (
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
                  ))}
                </ul>
              </>
            )}

            {/* Tokens loaded */}
            {userWalletTokens && (
              <ul className="space-y-2 text-white/70 text-sm">
                {userWalletTokens.map((token, index) => (
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
                      {inCurrencyFormat(
                        formatUnits(token.balance, token.decimal)
                      )}{" "}
                      {token.symbol}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
