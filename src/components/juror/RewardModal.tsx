"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenPayment } from "@/types";
import { useState, useEffect } from "react";
import Image from "next/image";
import { formatUnits, parseUnits } from "viem";
import { Loader2 } from "lucide-react";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: TokenPayment[];
  onClaim: (selectedToken: TokenPayment, amount: bigint) => void;
  claimState?: any;
}

export default function RewardModal({
  isOpen,
  onClose,
  rewards,
  onClaim,
  claimState,
}: RewardModalProps) {
  const { claim, setClaim } = claimState || {};

  const [selectedToken, setSelectedToken] = useState<TokenPayment | null>(null);
  const [amount, setAmount] = useState("");

  // Effect to set the first reward as default when the modal opens
  useEffect(() => {
    if (isOpen && rewards.length > 0) {
      setSelectedToken(rewards[0]);
    } else {
      // Reset state when modal closes
      setSelectedToken(null);
      setAmount("");
    }
  }, [isOpen, rewards]);

  const handleTokenChange = (tokenAddress: string) => {
    const newSelectedToken = rewards.find((r) => r.address === tokenAddress);
    if (newSelectedToken) {
      setSelectedToken(newSelectedToken);
      // Reset amount when token changes
      setAmount("");
    }
  };

  const handleSetMax = () => {
    if (selectedToken) {
      const formattedMax = formatUnits(
        selectedToken.payment,
        selectedToken.decimal
      );
      setAmount(formattedMax);
    }
  };

  const handleClaim = () => {
    if (selectedToken && amount) {
      const amountAsBigInt = parseUnits(amount, selectedToken.decimal);
      onClaim(selectedToken, amountAsBigInt);
    }
  };

  const availableBalance = selectedToken
    ? parseFloat(
        formatUnits(selectedToken.payment, selectedToken.decimal)
      ).toFixed(4)
    : "0.00";

  const isAmountInvalid =
    !amount ||
    parseFloat(amount) <= 0 ||
    (selectedToken &&
      parseUnits(amount, selectedToken.decimal) > selectedToken.payment);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900/95 p-0 shadow-lg max-w-lg "
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-emerald-400">
            Claim Juror Rewards
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Select a token and the amount you wish to withdraw.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-6">
          {/* Token Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Select Token
            </label>
            <Select
              value={selectedToken?.address}
              onValueChange={handleTokenChange}
            >
              <SelectTrigger className="w-full border-slate-700 bg-slate-800 text-white">
                <SelectValue placeholder="Select a token to claim" />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800 text-white">
                {rewards.map((reward) => (
                  <SelectItem key={reward.address} value={reward.address}>
                    <div className="flex items-center gap-3">
                      <Image
                        src={reward.image}
                        alt={reward.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span>{reward.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Amount to Claim
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-slate-700 bg-slate-800 pr-16 text-white placeholder:text-white/50"
                disabled={!selectedToken}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSetMax}
                className="absolute right-1 top-1/2 h-8 -translate-y-1/2 text-emerald-400 hover:bg-slate-700 hover:text-emerald-300"
                disabled={!selectedToken}
              >
                Max
              </Button>
            </div>
            {selectedToken && (
              <p className="mt-2 text-xs text-slate-400">
                Available to claim: {availableBalance} {selectedToken.symbol}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="bg-slate-900 p-6 pt-4">
          <Button
            onClick={handleClaim}
            disabled={claim?.loading || isAmountInvalid}
            className="w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
          >
            {claim.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {claim.text}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
