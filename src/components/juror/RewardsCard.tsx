"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, Gift, Award } from "lucide-react";
import { Juror, Token, TypeChainId, TokenPayment } from "@/types";
import { bloomLog, inCurrencyFormat } from "@/lib/utils";
import { Address, formatUnits, parseUnits } from "viem";
import Image from "next/image";
import RewardModal from "./RewardModal";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { disputeManagerAbi, getChainConfig } from "@/constants";
import { useAccount } from "wagmi";
import { config } from "@/lib/wagmi";
import { useModal } from "@/providers/ModalProvider";
import { form } from "viem/chains";

interface RewardsCardProps {
  rewards: TokenPayment[];
  refetch: () => void;
  onClaim: (token: string, amount: number) => void;
}

export default function RewardsCard({
  rewards,
  refetch,
  onClaim,
}: RewardsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { address: signerAddress } = useAccount();
  const currentChain = getChainConfig("sepolia");
  const disputeStorageAddress = currentChain.disputeStorageAddress as Address;
  const disputeManagerAddress = currentChain.disputeManagerAddress as Address;
  // const [claimAmount, setClaimAmount] = useState<number>(
  //   rewards[selectedToken] || 0
  // );

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { openModal, closeModal } = useModal();

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

  const [claim, setClaim] = useState<{
    loading: boolean;
    error: any;
    text: string;
  }>({ loading: false, error: "", text: "Claim Reward" });

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  const claimRewardsTransaction = async (
    tokenAddress: Address | string,
    amount: bigint
  ) => {
    try {
      const { request: claimRewardsRequest } = await simulateContract(config, {
        abi: disputeManagerAbi,
        address: disputeManagerAddress as Address,
        functionName: "claimReward",
        args: [tokenAddress, amount],
        chainId: currentChain.chainId as TypeChainId,
      });

      const hash = await writeContract(config, claimRewardsRequest);
      const receipt = await waitForTransactionReceipt(config, { hash });

      // return something meaningful
      return receipt;
    } catch (err) {
      // rethrow so handleAddEvidence can catch it
      throw err;
    }
  };

  const handleClaimRewardsTransaction = (
    token: TokenPayment,
    amount: bigint
  ) => {
    const formattedAmount = inCurrencyFormat(
      formatUnits(amount, token.decimal)
    );
    setIsRewardModalOpen(false);
    openModal({
      type: "confirm",
      title: "Claim Rewards",
      description: (
        <div className="space-y-2 text-[13px]">
          <p>
            You are about to claim {formattedAmount} {token.symbol}
          </p>
        </div>
      ),
      confirmText: "Yes",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        setIsRewardModalOpen(true);
        setClaim({
          loading: true,
          error: null,
          text: `Claiming ${formattedAmount} ${token.symbol}...`,
        });

        try {
          const receipt = await claimRewardsTransaction(token.address, amount);
          if (receipt.status == "success") {
            setIsRewardModalOpen(false);

            openModal({
              type: "success",
              title: "Claming Successful",
              description: (
                <div className="space-y-2 text-[13px]">
                  <p>
                    You've successfully claimed {formattedAmount} {token.symbol}
                  </p>
                </div>
              ),
              confirmText: "Close",
            });

            //  const newDeal = await getDeal(dealId);
            //  setDeal(newDeal);

            refetch();

            setClaim({
              loading: false,
              error: null,
              text: "Claim Reward",
            });
          }
        } catch (err: any) {
          const errorMessage = (err as Error).message;

          setIsRewardModalOpen(true);

          bloomLog("Unexpected Error: ", err);
          openModal({
            type: "error",
            title: "Claim Failed",
            description: (
              <div className="space-y-2 text-[13px]">
                <p>{errorMessage}</p>
              </div>
            ),
            confirmText: "Close",
          });
          setClaim({ loading: false, error: err, text: "Claim Reward" });
        }
      },
    });
  };

  const handleClaimRewards = async (token: TokenPayment, amount: bigint) => {
    handleClaimRewardsTransaction(token, amount);
  };

  return (
    <>
      <RewardModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        rewards={rewards}
        onClaim={handleClaimRewards}
        claimState={{
          claim,
          setClaim,
        }}
      />

      {/* Rewards Card */}
      <Card className="relative w-full  overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-sm py-0">
        {/* Aurora Glow Effect */}
        <div className="absolute -top-1/2 left-1/2 -z-10 h-[200%] w-[200%] -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent blur-3xl"></div>

        {/* 1. Dedicated CardHeader for a stronger title */}
        <CardHeader className="flex-row items-center justify-between border-b border-white/10 pt-6">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Your Rewards</h3>
          </div>
        </CardHeader>

        <CardContent className="px-6 ">
          {/* 2. Redesigned Rewards List: Clear and easy to read */}
          <div className="space-y-4">
            {rewards.length > 0 ? (
              rewards.map((reward: TokenPayment, index: number) => {
                const totalEarned = BigInt(reward.payment);
                const alreadyClaimed = BigInt(reward.paymentClaimed);
                const availableToClaim = totalEarned - alreadyClaimed;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-b-0"
                  >
                    {/* Token Info */}
                    <div className="flex items-center gap-4">
                      <Image
                        src={reward.image}
                        alt={reward.name}
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-white">
                          {reward.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {reward.symbol}
                        </p>
                      </div>
                    </div>

                    {/* 3. Clear Financial Breakdown (The most important change) */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-cyan-400">
                        {inCurrencyFormat(
                          formatUnits(availableToClaim, reward.decimal)
                        )}{" "}
                        {reward.symbol}
                      </p>
                      <p className="text-xs text-slate-500">
                        Available to Claim
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              // Optional: An empty state if there are no rewards
              <div className="py-8 text-center text-slate-500">
                <Gift className="mx-auto h-8 w-8" />
                <p className="mt-2">No rewards available yet.</p>
              </div>
            )}
          </div>
        </CardContent>

        {/* 4. Dedicated CardFooter for the main action */}
        {rewards.length > 0 && (
          <CardFooter className="border-t border-white/10 bg-black/20 p-4 sm:p-6">
            <Button
              className="w-full bg-emerald-600 font-semibold text-white shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/20"
              onClick={() => setIsRewardModalOpen(true)}
            >
              Claim Rewards
            </Button>
          </CardFooter>
        )}
      </Card>
    </>
  );
}
