"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, ChevronDown, ChevronUp, Coins, Loader2 } from "lucide-react";
import WalletCard from "@/components/escrow/WalletCard";
import Header from "@/components/Header";
import { useAccount } from "wagmi";
import useDefi from "@/hooks/useDefi";
import { Token, TypeChainId, WalletToken } from "@/types";
import { Address, erc20Abi, formatUnits, parseUnits } from "viem";
import { useModal } from "@/providers/ModalProvider"; // make sure path correct
import { bloomLog, inCurrencyFormat } from "@/lib/utils";
import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { config } from "@/lib/wagmi";
import { getChainConfig, jurorManagerAbi } from "@/constants";

export default function RegisterJuror() {
  const { juror, loadJuror } = useDefi();
  const { address: signerAddress } = useAccount();
  const [stakeAmount, setStakeAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const { userWalletTokens } = useDefi();
  const { openModal, closeModal } = useModal();
  const [registerText, setRegisterText] = useState("Register as Juror");

  const currentChain = getChainConfig("sepolia");
  const jurorManagerAddress = currentChain.jurorManagerAddress as Address;

  // bloomLog("Juror: ", juror);

  useEffect(() => {
    const getJuror = async () => {
      if (signerAddress) {
        await loadJuror(signerAddress);
      }
    };
    getJuror();
  }, [signerAddress]);

  const bloomToken = userWalletTokens?.find(
    (token: WalletToken) => token.symbol === "BLM"
  );

  const bloomBalance = bloomToken?.balance
    ? parseFloat(formatUnits(bloomToken.balance, 18))
    : 0;

  // Check if stake is valid
  const isStakeValid = () => {
    const amount = Number(stakeAmount);
    if (isNaN(amount)) return false;
    if (amount <= 0) return false;
    if (amount > bloomBalance) return false;
    return true;
  };

  const isFormValid = signerAddress?.trim() !== "" && isStakeValid();

  // Handle input change with max auto-populate
  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Allow only numbers with optional decimal
    if (!/^\d*\.?\d*$/.test(value)) return;

    // Prevent leading zeros like "00" but allow "0."
    if (value.startsWith("00")) return;

    const numericValue = parseFloat(value);

    // If value >= balance, auto-set max
    if (!isNaN(numericValue) && numericValue >= bloomBalance) {
      setStakeAmount(String(bloomBalance));
      return;
    }

    setStakeAmount(value);
  };

  // Approve BLM tokens for staking
  const approveByTransaction = async (
    amountToApprove: bigint,
    token: Token
  ) => {
    setRegisterText("Approving...");
    try {
      const { request: approveRequest } = await simulateContract(config, {
        abi: erc20Abi,
        address: bloomToken?.address as Address,
        functionName: "approve",
        args: [jurorManagerAddress, amountToApprove],
        chainId: currentChain.chainId as TypeChainId,
      });

      const hash = await writeContract(config, approveRequest);
      const receipt = await waitForTransactionReceipt(config, { hash });

      if (receipt.status === "success") {
        bloomLog("Approval successful");
        setRegisterText("Registering as Juror...");
        return true;
      }

      return false;
    } catch (error) {
      bloomLog("Approval Error: ", error);
      setRegisterText("Register as Juror");
      setLoading(false);
      return false;
    }
  };

  // Register juror on-chain
  const registerJurorTransaction = async (validatedAmount: bigint) => {
    const { request: registerRequest } = await simulateContract(config, {
      abi: jurorManagerAbi,
      address: jurorManagerAddress as Address,
      functionName: "registerJuror",
      args: [validatedAmount],
      chainId: currentChain.chainId as TypeChainId,
    });

    const hash = await writeContract(config, registerRequest);
    const receipt = await waitForTransactionReceipt(config, { hash });

    return receipt.status === "success";
  };

  // Open confirmation modal before registering
  const handleRegisterClick = () => {
    openModal({
      type: "confirm",
      title: "Confirm Registration",
      description: (
        <div className="space-y-2 text-[13px]">
          <p>
            You are about to stake{" "}
            <span className="font-bold">{stakeAmount} BLM</span>. Once staked,
            tokens will be locked for a cooldown period.
          </p>
        </div>
      ),
      confirmText: "Yes, Register",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal(); // Close confirmation modal immediately
        setLoading(true);

        try {
          const validatedAmount = parseUnits(stakeAmount, 18);

          // Step 1: Approve token
          const approvalSuccess = await approveByTransaction(
            validatedAmount,
            bloomToken!
          );
          if (!approvalSuccess) {
            return openModal({
              type: "error",
              title: "Registration Failed",
              description: (
                <div className="space-y-2 text-[13px]">
                  <p>Token approval failed, please try again.</p>
                </div>
              ),
              confirmText: "Close",
            });
          }

          // Step 2: Register juror
          const registrationSuccess = await registerJurorTransaction(
            validatedAmount
          );
          if (!registrationSuccess) {
            return openModal({
              type: "error",
              title: "Registration Failed",
              description: (
                <div className="space-y-2 text-[13px]">
                  <p>Registration failed, please try again.</p>
                </div>
              ),
              confirmText: "Close",
            });
          }

          // Step 3: Success modal
          openModal({
            type: "success",
            title: "Registration Successful",
            description: (
              <div className="space-y-2 text-[13px]">
                <p>
                  You successfully registered as a juror with{" "}
                  <span className="font-bold">{stakeAmount} BLM</span>.
                </p>
              </div>
            ),
            confirmText: "Close",
          });

          setStakeAmount("");
        } catch (err: any) {
          bloomLog("Unexpected Error: ", err);

          // Display error nicely
          const errorMessage =
            err?.message || "Something went wrong, please try again.";

          openModal({
            type: "error",
            title: "Registration Failed",
            description: (
              <div className="space-y-2 text-[13px]">
                <p>{errorMessage}</p>
                <p className="text-white/60 text-sm">
                  If the problem persists, try refreshing or contacting support.
                </p>
              </div>
            ),
            confirmText: "Close",
          });
        } finally {
          setLoading(false);
          setRegisterText("Register as Juror");
        }
      },
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          <WalletCard />

          {/* Staked Info Card */}
          <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/80 to-slate-900 border border-emerald-500/30 shadow-lg hover:shadow-emerald-500/50 transition-transform transform hover:-translate-y-1 p-4">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-emerald-400 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-cyan-400" />
                  Your Staked BLM
                </h3>
                
              </div>

              {juror?.stakeAmount && (
                <div className="text-white text-2xl font-bold">
                  {inCurrencyFormat(
                    formatUnits(juror.stakeAmount, 18).toString()
                  )}{" "}
                  BLM
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg py-0">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-emerald-400 mb-5">
                Register as a Juror
              </h2>

              {juror?.jurorAddress ? (
                <div className="bg-slate-800/70 border border-emerald-500/30 rounded-xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Left side: Info */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold text-white/90">
                      You are already a juror
                    </h3>

                    <p className="text-white/70 mt-3 text-sm">
                      Stake more tokens to increase your score and improve your
                      chances of selection.
                    </p>
                  </div>

                  {/* Right side: Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      asChild
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <a href="/juror">Go to Profile</a>
                    </Button>

                    <Button
                      asChild
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      <a href="/juror">Stake More BLM</a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Signer Address Input */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Signer Address
                    </label>
                    <Input
                      placeholder="Enter your wallet address"
                      value={signerAddress || ""}
                      className="bg-slate-800 border border-slate-700 placeholder:text-white/50 text-white"
                      disabled
                    />
                  </div>

                  {/* Stake Input with Max Button */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-white mb-1">
                        Amount to Stake (BLM)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Enter BLM amount"
                          value={stakeAmount}
                          onChange={handleStakeAmountChange}
                          className="bg-slate-800 border border-slate-700 placeholder:text-white/50 text-white flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => setStakeAmount(String(bloomBalance))}
                          className="bg-slate-700 hover:bg-slate-600 text-sm px-3"
                        >
                          Max
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Register Button */}
                  <Button
                    onClick={handleRegisterClick}
                    disabled={loading || !isFormValid}
                    className="bg-emerald-600 hover:bg-emerald-700 w-full flex space-x-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {registerText}
                  </Button>
                </div>
              )}

              {/* Rules Section */}
              <div className="mt-4 border-t border-slate-700 pt-4">
                <button
                  onClick={() => setShowRules(!showRules)}
                  className="flex items-center justify-between w-full text-white/80 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium">Rules and Guidelines</span>
                  </div>
                  {showRules ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    showRules ? "max-h-96 mt-3" : "max-h-0"
                  }`}
                >
                  <ul className="list-disc list-inside text-white/70 space-y-2 text-sm">
                    <li>You must stake BLM tokens to become a juror.</li>
                    <li>
                      The more you stake, the higher your chance of selection.
                    </li>
                    <li>
                      Maintain a good reputation to continue getting deals
                      assigned.
                    </li>
                    <li>You may be called to review disputes in the system.</li>
                    <li>Unstaking is only allowed after a cooldown period.</li>
                  </ul>

                  <Button
                    // as="a"
                    // href="https://example.com/juror-docs"
                    // target="_blank"
                    className="bg-slate-800 my-5 w-full border border-slate-700"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
