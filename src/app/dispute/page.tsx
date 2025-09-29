"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Scale, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import { bloomLog, formatAddress, inCurrencyFormat } from "@/lib/utils";
import {
  SUPPORTED_CHAIN_ID,
  TOKEN_META,
  addressToToken,
  bloomEscrowAbi,
  getChainConfig,
} from "@/constants";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { Address, erc20Abi, formatUnits } from "viem";
import { config } from "@/lib/wagmi";
import { Deal, Token, TypeChainId } from "@/types";
import DisputeModal from "@/components/disputes/DisputeModal";
import ConfirmDisputeModal from "@/components/disputes/ConfirmDisputeModal";
import ErrorModal from "@/components/disputes/ErrorModal";
import { useAccount } from "wagmi";

export default function DisputePage() {
  const { address: signerAddress } = useAccount();
  const currentChain = getChainConfig("sepolia");
  const disputeManagerAddress = currentChain.disputeManagerAddress as Address;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const chainId = SUPPORTED_CHAIN_ID as TypeChainId;

  const [dealId, setDealId] = useState("");
  const [dealData, setDealData] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [token, setToken] = useState<any>(null);

  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title?: string;
    message?: string;
  }>({
    open: false,
  });

  const getDeal = async (dealId: string) => {
    try {
      const bloomEscrowAddress = currentChain.bloomEscrowAddress as Address;

      const deal = (await readContract(config, {
        abi: bloomEscrowAbi,
        address: bloomEscrowAddress,
        functionName: "getDeal",
        args: [dealId],
        chainId,
      })) as Deal;

      return deal;
    } catch (error) {
      console.error("Failed to load deal :", error);

      return null;
    }
  };

  useEffect(() => {
    if (!dealId) return;

    const fetchDealAndToken = async () => {
      bloomLog("Getting deal");
      const deal = await getDeal(dealId);
      bloomLog("Deal: ", deal);
      setDeal(deal);

      if (deal) {
        const tokenSymbol =
          addressToToken[chainId]?.[deal.tokenAddress.toLowerCase()];
        if (tokenSymbol) {
          const token = TOKEN_META[chainId][tokenSymbol];
          bloomLog("Token: ", token);
          const newToken = {
            ...token,
            address: deal.tokenAddress.toLowerCase(),
          };
          setToken(newToken);
        } else {
          bloomLog("Token not found for address: ", deal.tokenAddress);
        }
      }
    };

    fetchDealAndToken();
  }, [dealId, chainId]);
  const handleDealChange = (id: string) => {
    setDealId(id);
  };

  const handleApprove = async () => {
    setApproving(true);
    // simulate blockchain approval delay
    setTimeout(() => {
      setApproved(true);
      setApproving(false);
    }, 1500);
  };

  const approveTransaction = async (amountToApprove: bigint) => {
    bloomLog("Token address: ", token.address);
    try {
      const { request: approveRequest } = await simulateContract(config, {
        abi: erc20Abi,
        address: token.address as Address,
        functionName: "approve",
        args: [disputeManagerAddress, amountToApprove],
        chainId: currentChain.chainId as TypeChainId,
      });
      const hash = await writeContract(config, approveRequest);

      const approveReceipt = await waitForTransactionReceipt(config, {
        hash,
      });
      if (approveReceipt.status == "success") {
        bloomLog("Approve Transaction is successful");
        return null;
      }
    } catch (error) {
      return error;
    } finally {
      // return isSuccessful;
    }
  };

  // handle submit button
  const handleSubmit = () => {
    if (!dealId || !description) return;

    // Open confirmation modal first
    setIsConfirmOpen(true);
  };

  // callback when user confirms
  const handleConfirmDispute = async () => {
    setIsConfirmOpen(false);
    setIsModalOpen(true);

    try {
      // Now, we approve to spend the arbitration fee;
      const validatedArbitrationFee = 4e6;
      const error = await approveTransaction(BigInt(validatedArbitrationFee));
      if (error) {
        const message = (error as Error).message;
        setErrorModal({
          open: true,
          title: "Approval Failed",
          message:
            message ||
            "Your transaction could not be confirmed on-chain. Please try again.",
        });
        setIsModalOpen(false);
        return;
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      setErrorModal({
        open: true,
        title: "Approval Error",
        message: errorMessage || "Something went wrong during approval.",
      });
    } finally {
    }

    // optionally set submitted state
    setSubmitted(true);

    // here you can also call openDispute() to trigger blockchain interaction
  };
  const openDispute = async () => {
    // Here I don't know, you try to track all the events and if any of the event comes up, It shows here or something.
  };

  // bloomLog("Description: ", description);

  return (
    <>
      <Header />

      <ErrorModal
        isOpen={errorModal.open}
        onClose={() => setErrorModal({ ...errorModal, open: false })}
        title={errorModal.title}
        message={errorModal.message}
      />

      <ConfirmDisputeModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDispute}
        dealId={dealId}
        description={description}
      />

      {signerAddress && token && (
        <DisputeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSubmitted(false); // reset submit state if needed
          }}
          token={token}
          currentChain={currentChain}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white">Dispute</h1>
          <p className="text-white/70 mt-1 text-sm">
            Open a dispute and get it reviewed by jurors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8">
          {/* Left Panel - Dispute Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg w-full">
              {/* <CardHeader /> */}
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between">
                    <h2 className="text-2xl font-bold text-emerald-400">
                      Open A Dispute
                    </h2>
                    {/* <div className="border-b border-slate-700 mt-2 mb-6"></div> */}
                    <Button
                      variant="outline"
                      className="w-48 bg-slate-800 border border-cyan-500/30 text-cyan-400 hover:bg-slate-700 flex items-center gap-2 lg:hidden"
                      onClick={() =>
                        document
                          .getElementById("how-it-works")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      How It Works -{">"}
                    </Button>
                  </div>
                  <div className="-mx-6 border-b border-emerald-500/30 mt-2 mt-5"></div>
                </div>

                {/* Deal ID Input */}
                <div className="space-y-2">
                  <Label htmlFor="dealId" className="text-slate-300">
                    Deal ID
                  </Label>
                  <Input
                    id="dealId"
                    placeholder="Enter deal ID"
                    value={dealId}
                    onChange={(e) => handleDealChange(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Deal Details */}
                <div className="bg-slate-800 rounded-xl p-5 shadow-md border border-slate-700">
                  <h3 className="text-white text-lg font-semibold mb-4">
                    Deal Details
                  </h3>

                  {deal && token && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Deal ID</span>
                        <span className="text-white font-medium">
                          {deal.id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Sender</span>
                        <span className="text-white font-medium">
                          {formatAddress(deal.sender)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Receiver</span>
                        <span className="text-white font-medium">
                          {formatAddress(deal.receiver)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Amount</span>
                        <span className="text-white font-medium">
                          {inCurrencyFormat(
                            formatUnits(deal.amount, token.decimal)
                          )}{" "}
                          {token.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">
                          Arbitration Fee
                        </span>
                        <span className="text-white font-medium">
                          {"10 USDC"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dispute Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">
                    Dispute Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue clearly..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[120px]"
                  />
                </div>

                {/* Approve + Submit Flow */}
                <div className="space-y-3">
                  <Button
                    className="mx-auto flex justify-center  bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md"
                    disabled={!deal || !description || submitted}
                    onClick={handleSubmit}
                  >
                    {submitted ? "Submitting..." : "Submit Dispute"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - How Disputes Work */}
          <div
            id="how-it-works"
            className="lg:col-span-5 mx-auto lg:mx-0 my-8 lg:my-0"
          >
            <Card className="bg-slate-900/95 border border-cyan-500/30 shadow-md">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white text-center mb-4">
                  How Disputes Work
                </h2>
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-600 text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        1. Submit Your Dispute
                      </p>
                      <p className="text-white/60 text-sm">
                        Enter the deal ID, provide a description, and submit the
                        case.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">2. Jurors Review</p>
                      <p className="text-white/60 text-sm">
                        A panel of jurors is assigned to review your evidence
                        and claims.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-600 text-white">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        3. Finalized in 48 Hours
                      </p>
                      <p className="text-white/60 text-sm">
                        A decision is reached within 48 hours and outcomes are
                        enforced.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Learn More Button */}
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="mx-auto w-48 bg-slate-800 border border-cyan-500/30 text-cyan-400 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
