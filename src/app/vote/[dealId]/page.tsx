"use client";

import axios from "axios";
import React, { useState, useEffect, use, useMemo } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  FileText,
  Info,
  ArrowRight,
  Clock,
  Hash,
  Layers,
  Image as LucideImage,
  Video,
  Lightbulb,
  UploadCloud,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  User,
  DollarSign,
  Loader2,
} from "lucide-react";
import EvidencePicker from "@/components/evidence/EvidencePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EvidenceCard from "@/components/evidence/EvidenceCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useAccount } from "wagmi";
import { Address, erc20Abi, formatUnits, parseGwei, zeroAddress } from "viem";
import {
  SUPPORTED_CHAIN_ID,
  TOKEN_META,
  addressToToken,
  bloomEscrowAbi,
  disputeManagerAbi,
  disputeStorageAbi,
  feeControllerAbi,
  getChainConfig,
  jurorManagerAbi,
} from "@/constants";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@/lib/wagmi";
import {
  bloomLog,
  formatAddress,
  formatCountdown,
  inCurrencyFormat,
} from "@/lib/utils";
import { Deal, EvidenceType, Token, TypeChainId, Evidence } from "@/types";
import useDefi from "@/hooks/useDefi";
import { useQuery } from "@tanstack/react-query";
import {
  getDeal,
  getDispute,
  getDisputeId,
  getDisputeTimer,
  getDisputeVote,
  getEvidence,
  getJurorDisputeHistory,
} from "@/hooks/useDisputeStorage";
import { useModal } from "@/providers/ModalProvider";

interface Props {
  params: Promise<{ dealId: string }>;
}

export default function DisputeVotingPage({ params }: Props) {
  const { dealId } = use(params);
  const { storageParams } = useDefi();

  const [selectedVote, setSelectedVote] = useState<string>("");
  const { address: signerAddress } = useAccount();
  const currentChain = getChainConfig("sepolia");
  const jurorManagerAddress = currentChain.jurorManagerAddress as Address;
  const chainId = SUPPORTED_CHAIN_ID as TypeChainId;
  // const [deal, setDeal] = useState<Deal | null>(null);
  const { openModal, closeModal } = useModal();

  // bloomLog("Selected vote: ", selectedVote);

  const [voteData, setVoteData] = useState<{
    loading: boolean;
    error: any;
    text: string;
  }>({ loading: false, error: "", text: "Submit Vote" });

  const { data: deal } = useQuery({
    queryKey: ["deal", dealId.toString()],
    queryFn: () => getDeal(dealId!),
    enabled: !!dealId,
    staleTime: 60_000,
  });

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
      const [dispute, disputeTimer] = await Promise.all([
        getDispute(disputeId!),
        getDisputeTimer(disputeId!),
      ]);
      return { dispute, disputeTimer };
    },
    enabled: !!disputeId,
    staleTime: 60_000,
  });

  const dispute = disputeBundle?.dispute;
  const disputeTimer = disputeBundle?.disputeTimer;

  // Juror dispute history — optional or lazy
  const { data: jurorDisputeHistory } = useQuery({
    queryKey: ["jurorDisputeHistory", signerAddress],
    queryFn: () => getJurorDisputeHistory(signerAddress!),
    enabled: !!signerAddress,
    staleTime: 120_000,
  });

  // bloomLog("Juror dispute history: ", jurorDisputeHistory)

  const {
    data: disputeVote,
    refetch: refetchDisputeVote,
    isLoading: disputeVoteLoading,
  } = useQuery({
    queryKey: ["disputeVote", signerAddress, disputeId?.toString()],
    queryFn: () => getDisputeVote(disputeId!, signerAddress!),
    enabled: !!signerAddress && !!disputeId,
  });

  const initiator = dispute?.initiator;
  const against =
    dispute?.initiator === dispute?.sender
      ? dispute?.receiver
      : dispute?.sender;

  const { data: evidences } = useQuery({
    queryKey: ["disputeEvidences", dealId?.toString(), dispute?.initiator],
    queryFn: async () => {
      const initiator = dispute!.initiator;
      const against =
        dispute!.initiator === dispute!.sender
          ? dispute!.receiver
          : dispute!.sender;

      const [initiatorEvidences, againstEvidences] = await Promise.all([
        getEvidence(dealId!, initiator),
        getEvidence(dealId!, against),
      ]);

      return { initiatorEvidences, againstEvidences };
    },
    enabled: !!dispute && !!dealId,
  });

  const initiatorEvidences = evidences?.initiatorEvidences;
  const againstEvidences = evidences?.againstEvidences;
  // Check if the disputeId is in the juror dispute history
  const isJuror = useMemo(() => {
    if (!jurorDisputeHistory || !disputeId) return undefined;
    return jurorDisputeHistory.includes(disputeId);
  }, [jurorDisputeHistory, disputeId]);

  // const isJuror = jurorDisputeHistory && Array.isArray(jurorDisputeHistory)
  //   ? jurorDisputeHistory.some((id) => id === disputeId)
  //   : undefined;

  bloomLog("IsJuror: ", isJuror);

  const endTime = useMemo(() => {
    return (
      (Number(disputeTimer?.startTime ?? 0) +
        Number(disputeTimer?.standardVotingDuration ?? 0) +
        Number(disputeTimer?.extendDuration ?? 0)) *
      1000
    );
  }, [disputeTimer]);

  // Countdown state
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(endTime - Date.now(), 0)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        const next = endTime - Date.now();
        return next > 0 ? next : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMinutes = remainingHours * 60;

  const voteTransaction = async (
    disputeId: bigint | string,
    support: string
  ) => {
    try {
      const { request: voteRequest } = await simulateContract(config, {
        abi: jurorManagerAbi,
        address: jurorManagerAddress as Address,
        functionName: "vote",
        args: [disputeId, support],
        chainId: currentChain.chainId as TypeChainId,
      });

      const hash = await writeContract(config, voteRequest);
      const receipt = await waitForTransactionReceipt(config, { hash });

      // return something meaningful
      return receipt;
    } catch (err) {
      // rethrow so handleAddEvidence can catch it
      throw err;
    }
  };

  const handleSubmitVote = () => {
    openModal({
      type: "confirm",
      title: "Vote Submission",
      description: (
        <div className="space-y-2 text-[13px]">
          <p>You are about to submit a vote.</p>
        </div>
      ),
      confirmText: "Yes, Vote",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        setVoteData({ loading: true, error: null, text: "Submitting Vote..." });
        try {
          const validatedDisputeId = disputeId!;
          const validatedSupport =
            selectedVote == "plaintiff" ? initiator! : against!;

          const receipt = await voteTransaction(
            validatedDisputeId,
            validatedSupport
          );
          if (receipt.status == "success") {
            openModal({
              type: "success",
              title: "Submission Successful",
              description: (
                <div className="space-y-2 text-[13px]">
                  <p>You successfully submitted a vote.</p>
                </div>
              ),
              confirmText: "Close",
            });
            await refetchDisputeVote();

            setVoteData({
              loading: false,
              error: null,
              text: "Submit Vote",
            });
          }
        } catch (err: any) {
          const errorMessage = (err as Error).message;

          bloomLog("Unexpected Error: ", err);
          openModal({
            type: "error",
            title: "Submission Failed",
            description: (
              <div className="space-y-2 text-[13px]">
                <p>{errorMessage}</p>
              </div>
            ),
            confirmText: "Close",
          });
          setVoteData({ loading: false, error: err, text: "Submit Vote" });
        }
      },
    });
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white">
            Dispute #{disputeId}
          </h1>
          <p className="text-white/70 mt-1 text-sm">
            Review evidence and cast your vote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Parties */}
          <div>
            <Card className="bg-slate-900/95 border border-slate-700 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Meta Info Section */}
                <div className="bg-slate-800/80 border-b border-slate-700 px-5 py-6 grid grid-cols-2 gap-4 text-sm text-white/80 -mt-8">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-emerald-400" />
                    <span>
                      Deal ID:{" "}
                      <span className="font-semibold text-white">
                        #{dealId && dealId.toString()}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>
                      Dispute ID:{" "}
                      <span className="font-semibold text-white">
                        #{disputeId && disputeId.toString()}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>
                      Time Left:{" "}
                      <span className="font-semibold text-white">
                        {remainingMs && formatCountdown(remainingMs)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Parties Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                  {/* Plaintiff */}
                  <div className="p-5 border-r border-slate-700">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-400">
                      <User className="w-5 h-5" /> Plaintiff
                    </h3>
                    <p className="text-sm text-white/80 mt-2">
                      {initiator && formatAddress(initiator)}
                    </p>
                    {/* <p className="text-sm text-white/60">{plaintiff.claim}</p> */}
                  </div>

                  {/* Defendant */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-cyan-400">
                      <User className="w-5 h-5" /> Defendant
                    </h3>
                    <p className="text-sm text-white/80 mt-2">
                      {against && formatAddress(against)}
                    </p>
                    {/* <p className="text-sm text-white/60">{defendant.defense}</p> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Evidence Tabs + Voting */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/95 border border-cyan-500/30 shadow-md rounded-2xl p-5 space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Submitted Evidence
              </h2>

              {/* Tabs Section */}
              <Tabs defaultValue="plaintiff" className="w-full ">
                <TabsList className="flex gap-3 w-full bg-transparent">
                  <TabsTrigger
                    value="plaintiff"
                    className="data-[state=active]:bg-emerald-600/90 data-[state=active]:text-white 
               bg-slate-800/60 text-gray-300 rounded-md px-6 py-5 font-medium
               shadow hover:bg-slate-700/70 transition"
                  >
                    Plaintiff
                  </TabsTrigger>
                  <TabsTrigger
                    value="defendant"
                    className="data-[state=active]:bg-cyan-600/90 data-[state=active]:text-white 
               bg-slate-800/60 text-gray-300 rounded-md px-6 py-5 font-medium
               shadow hover:bg-slate-700/70 transition"
                  >
                    Defendant
                  </TabsTrigger>
                </TabsList>

                {/* Plaintiff Evidence */}
                <TabsContent value="plaintiff" className="mt-4 grid gap-4">
                  {initiatorEvidences &&
                    initiatorEvidences.length > 0 &&
                    initiatorEvidences
                      .slice() // copy so you don't mutate
                      .reverse()
                      .slice(0, 2) // only take the first 2 after reversing
                      .map((currentEvidence, indexFromReversed) => {
                        const originalIndex =
                          initiatorEvidences.length - 1 - indexFromReversed;
                        return (
                          <EvidenceCard
                            key={originalIndex}
                            evidence={currentEvidence}
                            index={originalIndex} // still original index
                            isJurorView={true}
                            handleRemoveEvidence={() => {}}
                            removalState={null}
                          />
                        );
                      })}
                </TabsContent>

                {/* Defendant Evidence */}
                <TabsContent value="defendant" className="mt-4 grid gap-4">
                  {againstEvidences &&
                    againstEvidences.length > 0 &&
                    againstEvidences
                      .slice() // copy so you don't mutate
                      .reverse()
                      .slice(0, 2) // only take the first 2 after reversing
                      .map((currentEvidence, indexFromReversed) => {
                        const originalIndex =
                          againstEvidences.length - 1 - indexFromReversed;
                        return (
                          <EvidenceCard
                            key={originalIndex}
                            evidence={currentEvidence}
                            index={originalIndex} // still original index
                            isJurorView={true}
                            handleRemoveEvidence={() => {}}
                            removalState={null}
                          />
                        );
                      })}
                </TabsContent>
              </Tabs>
            </div>

            <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-xl rounded-3xl overflow-hidden">
              {disputeVoteLoading || !disputeVote ? (
                <CardContent className="py-6 px-4 flex items-center justify-center">
                  <p className="text-slate-400 animate-pulse">
                    Loading vote data...
                  </p>
                </CardContent>
              ) : disputeVote?.support === zeroAddress ? (
                // show vote UI here
                <CardContent className="py-2 px-4 space-y-8">
                  {/* Title */}
                  <div className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-emerald-400 animate-pulse" />
                    <h3 className="text-xl font-bold text-white tracking-wide">
                      Cast Your Vote
                    </h3>
                  </div>

                  {/* Voting Options */}
                  <RadioGroup
                    value={selectedVote}
                    onValueChange={setSelectedVote}
                    className="grid grid-cols-1 gap-4"
                  >
                    {[
                      {
                        value: "plaintiff",
                        label: "In favor of Plaintiff",
                        color: "from-emerald-600 to-emerald-400",
                      },
                      {
                        value: "defendant",
                        label: "In favor of Defendant",
                        color: "from-cyan-600 to-cyan-400",
                      },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        htmlFor={opt.value}
                        className={`relative cursor-pointer group`}
                      >
                        <input
                          type="radio"
                          id={opt.value}
                          value={opt.value}
                          checked={selectedVote === opt.value}
                          onChange={() => setSelectedVote(opt.value)}
                          className="peer hidden"
                        />
                        <div
                          className={`
              rounded-2xl p-3 flex items-center justify-between 
              bg-slate-800/70 border border-slate-700 
              group-hover:border-emerald-400/50 transition-all 
              shadow-md group-hover:shadow-xs group-hover:shadow-emerald-500/20 
              text-slate-400
              peer-checked:bg-gradient-to-r ${opt.color} 
              peer-checked:text-white
              peer-checked:shadow-sm peer-checked:shadow-emerald-500/30
            `}
                        >
                          <span className="text-base font-semibold tracking-wide">
                            {opt.label}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full border-2 transition-colors
                ${
                  selectedVote === opt.value
                    ? "bg-white border-white"
                    : "border-gray-400"
                }`}
                          ></div>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>

                  {/* Submit */}
                  <div className="flex justify-center pt-4">
                    <Button
                      disabled={!selectedVote || voteData.loading}
                      className={`
      w-full shadow-sm px-8 py-4 rounded-2xl font-bold text-lg tracking-wide 
      flex items-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50
      ${
        !selectedVote
          ? "bg-slate-700 text-gray-400 cursor-not-allowed"
          : selectedVote === "plaintiff"
          ? "bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-700 hover:to-emerald-500 shadow-emerald-500/40"
          : "bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-700 hover:to-cyan-500 shadow-cyan-500/40"
      }
    `}
                      onClick={handleSubmitVote}
                    >
                      {selectedVote ? voteData.text : "Select a Side to Vote"}
                      {/* <ArrowRight className="w-5 h-5" /> */}
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="py-2 px-4 space-y-8">
                  <div className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-emerald-400 animate-pulse" />
                    <h3 className="text-xl font-bold text-white tracking-wide">
                      You have already voted
                    </h3>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
