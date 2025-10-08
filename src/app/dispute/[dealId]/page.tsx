"use client";

import { useState, useEffect, use } from "react";
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
  disputeManagerAbi,
  disputeStorageAbi,
  feeControllerAbi,
  getChainConfig,
} from "@/constants";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { Address, erc20Abi, formatUnits, parseGwei, zeroAddress } from "viem";
import { config } from "@/lib/wagmi";
import { Candidate, Deal, Dispute, Token, TypeChainId, Vote } from "@/types";
import DisputeModal from "@/components/disputes/DisputeModal";
import ConfirmDisputeModal from "@/components/disputes/ConfirmDisputeModal";
import ErrorModal from "@/components/disputes/ErrorModal";
import { useAccount } from "wagmi";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getDeal,
  getDispute,
  getDisputeFee,
  getDisputeId,
  getDisputeVote,
  getDisputeTimer,
  getJurorAddresses,
  getJurorCandidate,
} from "@/hooks/useDisputeStorage";
import { useQuery } from "@tanstack/react-query";
import DisputeTimer from "@/components/disputes/DisputeTimer";

interface Props {
  params: Promise<{ dealId: string }>;
}

export default function DisputePage({ params }: Props) {
  const { dealId } = use(params);

  const { address: signerAddress } = useAccount();
  const currentChain = getChainConfig("sepolia");
  const disputeStorageAddress = currentChain.disputeStorageAddress as Address;
  const disputeManagerAddress = currentChain.disputeManagerAddress as Address;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const chainId = SUPPORTED_CHAIN_ID as TypeChainId;

  const [description, setDescription] = useState("");
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [token, setToken] = useState<any>(null);
  const [disputeFee, setDisputeFee] = useState<bigint | null>(null);

  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title?: string;
    message?: string;
  }>({
    open: false,
  });

  const [step, setStep] = useState(0);

  const disputeState = { step, setStep };

  const { data: disputeId } = useQuery({
    queryKey: ["disputeId", chainId, dealId.toString()],
    queryFn: () => getDisputeId(dealId!),
    enabled: !!dealId,
    staleTime: 60_000,
  });

  // Combine dispute + timer (they depend on disputeId)
  const { data: disputeBundle } = useQuery({
    queryKey: ["disputeBundle", disputeId?.toString()],
    queryFn: async () => {
      const [dispute, disputeTimer, jurorAddresses] = await Promise.all([
        getDispute(disputeId!),
        getDisputeTimer(disputeId!),
        getJurorAddresses(disputeId!),
      ]);
      return { dispute, disputeTimer, jurorAddresses };
    },
    enabled: !!disputeId,
    staleTime: 60_000,
  });

  const dispute = disputeBundle?.dispute;
  const disputeTimer = disputeBundle?.disputeTimer;
  const jurorAddresses = disputeBundle?.jurorAddresses;

  const status = dispute?.winner != zeroAddress ? "Ended" : "Ongoing";

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

        const validatedDisputeFee = await getDisputeFee(deal.amount);

        if (validatedDisputeFee) {
          bloomLog("dispute fee: ", validatedDisputeFee);
          setDisputeFee(validatedDisputeFee);
        }
      }
    };

    fetchDealAndToken();
  }, [dealId, chainId]);

  const handleApprove = async () => {
    setApproving(true);
    // simulate blockchain approval delay
    setTimeout(() => {
      setApproved(true);
      setApproving(false);
    }, 1500);
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
    // optionally set submitted state
    setSubmitted(true);

    try {
      // Now, we approve to spend the arbitration fee;
      // const validatedArbitrationFee = 50e18;

      // Approve transaction if only there is no allowance;
      const allowance = await readContract(config, {
        abi: erc20Abi,
        address: token.address as Address,
        args: [signerAddress as Address, disputeManagerAddress as Address],
        functionName: "allowance",
        chainId: currentChain.chainId as TypeChainId,
      });

      // If the dispute has been created, then no need to approve.
      setStep(1);

      // Now, we call openDispute.

      bloomLog("Deal ID is ", dealId);
      bloomLog("Description is ", description);

      const { request: openRequest } = await simulateContract(config, {
        abi: disputeManagerAbi,
        address: disputeManagerAddress as Address,
        functionName: "openDispute",
        args: [dealId, description],
        maxFeePerGas: parseGwei("2"), // slightly above average network fee
        maxPriorityFeePerGas: parseGwei("2"),
        gas: BigInt(1200000),
        chainId: currentChain.chainId as TypeChainId,
      });
      const hash = await writeContract(config, openRequest);

      const openReceipt = await waitForTransactionReceipt(config, {
        hash,
      });

      if (openReceipt.status == "success") {
        bloomLog("Open Transaction is successful");
        return null;
      }
    } catch (error) {
      bloomLog("There is an Error: ", error);
      const errorMessage = (error as Error).message;
      setErrorModal({
        open: true,
        title: "Error Occured",
        message: errorMessage || "Something went wrong during operation.",
      });
      setIsModalOpen(false);
    } finally {
      setSubmitted(false);
    }

    // here you can also call openDispute() to trigger blockchain interaction
  };

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
          disputeState={disputeState}
          deal={deal!}
        />
      )}

      
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* PAGE HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold">Dispute for Deal #{dealId}</h1>
            <p className="text-slate-400 text-sm mt-2">
              Track juror decisions, evidence, and updates for this dispute
            </p>
          </div>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* LEFT PANEL */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-emerald-400">
                      Dispute #{disputeId?.toString() || "—"}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Linked Deal: {dealId || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full">
                      {status}
                    </span>
                    <div className="mt-2">
                      {disputeTimer && (
                        <DisputeTimer disputeTimer={disputeTimer} />
                      )}
                    </div>
                  </div>
                </div>

                {deal && (
                  <div className="border-t border-slate-800 mt-4 pt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400">Plaintiff</p>
                      <p className="text-white font-medium">
                        {formatAddress(deal.sender)}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-slate-400">Defendant</p>
                      <p className="text-white font-medium">
                        {formatAddress(deal.receiver)}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* RIGHT PANEL */}
            <div className="xl:col-span-2">
              <Tabs defaultValue="jurors" className="w-full">
                <TabsList className="w-full bg-slate-900/60 border border-slate-800 rounded-xl flex justify-around">
                  <TabsTrigger
                    className="flex-1 py-3 text-sm font-medium text-white data-[state=active]:bg-green-800"
                    value="deal"
                  >
                    Deal Details
                  </TabsTrigger>
                  <TabsTrigger
                    className="flex-1 py-3 text-sm font-medium text-white data-[state=active]:bg-green-800"
                    value="jurors"
                  >
                    Jurors
                  </TabsTrigger>
                  <TabsTrigger
                    className="flex-1 py-3 text-sm font-medium text-white data-[state=active]:bg-green-800"
                    value="evidence"
                  >
                    Evidence
                  </TabsTrigger>
                </TabsList>

                {/* DEAL TAB */}
                <TabsContent value="deal" className="mt-6">
                  {deal && (
                    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl  hover:border-emerald-500/40 transition-all duration-300">
                      <CardContent className="p-0">
                        {/* Header Section */}
                        <div className="flex items-center justify-between border-b border-slate-800/70 px-6 pb-2">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">
                              Deal ID
                            </p>
                            <p className="text-white font-semibold tracking-wide">
                              {deal.id}
                            </p>
                          </div>
                          <span className="text-[12px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full">
                            Active
                          </span>
                        </div>

                        {/* Details Section */}
                        <div className="px-6 py-5 space-y-4 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Sender</span>
                            <span className="text-white font-medium">
                              {formatAddress(deal.sender)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Receiver</span>
                            <span className="text-white font-medium">
                              {formatAddress(deal.receiver)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Amount</span>
                            <span className="text-emerald-400 font-semibold">
                              {inCurrencyFormat(formatUnits(deal.amount, 18))}{" "}
                              {token.symbol}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* JURORS TAB */}
                <TabsContent value="jurors" className="mt-6">
                  {jurorAddresses ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {jurorAddresses.map((address, i) => {
                        return (
                          <Card
                            key={i}
                            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-slate-800 pt-4 px-2 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-emerald-500/10"
                          >
                            {/* Accent Glow Line */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/40 via-cyan-400/40 to-transparent"></div>

                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs text-slate-500 mb-1">
                                  Juror {i + 1}
                                </p>
                                <p className="text-sm font-semibold text-white">
                                  {formatAddress(address)}
                                </p>
                              </div>
                              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                                <Scale size={16} className="text-emerald-400" />
                              </div>
                            </div>

                            <div className="mt-2">
                              <div className="flex items-center justify-between cursor-pointer ">
                                <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                                  View Details
                                </span>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center">
                      Loading jurors...
                    </p>
                  )}
                </TabsContent>

                {/* EVIDENCE TAB */}
                <TabsContent value="evidence" className="mt-6">
                  <Card className="bg-slate-900 border border-slate-800 rounded-2xl">
                    <CardContent className="p-6 text-slate-400">
                      <p>No evidence submitted yet.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
