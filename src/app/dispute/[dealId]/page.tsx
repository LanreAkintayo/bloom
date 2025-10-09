"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Clock,
  FileText,
  Scale,
  BookOpen,
  ArrowRight,
  CircleUser,
  Wallet,
  ArrowDown,
  Link,
  User,
  FileSearch,
} from "lucide-react";
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
  getEvidence,
} from "@/hooks/useDisputeStorage";
import { useQuery } from "@tanstack/react-query";
import DisputeTimer from "@/components/disputes/DisputeTimer";
import JurorModal from "@/components/disputes/JurorModal";
import EvidenceCard from "@/components/evidence/EvidenceCard";
import { useModal } from "@/providers/ModalProvider";
import DisputeOutcomeCard from "@/components/disputes/DisputeOutcomeCard";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "next/navigation";

interface Props {
  params: Promise<{ dealId: string }>;
}

export default function DisputePage({ params }: Props) {
  const { dealId } = use(params);

  const router = useRouter();

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
  const [submitted, setClaimted] = useState(false);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [token, setToken] = useState<any>(null);
  const [disputeFee, setDisputeFee] = useState<bigint | null>(null);
  const [selectedJurorAddress, setSelectedJurorAddress] =
    useState<Address>(zeroAddress);

  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title?: string;
    message?: string;
  }>({
    open: false,
  });

  const { openModal, closeModal } = useModal();

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

  const { data: dealEvidences, refetch: refetchEvidences } = useQuery({
    queryKey: ["dealEvidence", dealId.toString(), signerAddress],
    queryFn: () => getEvidence(dealId!, signerAddress!),
    enabled: !!dealId && !!signerAddress,
    staleTime: 60_000,
  });

  bloomLog("Deal evidences: ", dealEvidences);

  const dispute = disputeBundle?.dispute;
  const disputeTimer = disputeBundle?.disputeTimer;
  const jurorAddresses = disputeBundle?.jurorAddresses;

  const status = dispute?.winner != zeroAddress ? "Ended" : "Ongoing";
  const [isJurorModalOpen, setIsJurorModalOpen] = useState(false);

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

  const removeEvidenceTransaction = async (
    dealId: bigint | string,
    evidenceIndex: number
  ) => {
    try {
      const { request: removeRequest } = await simulateContract(config, {
        abi: disputeManagerAbi,
        address: disputeManagerAddress as Address,
        functionName: "removeEvidence",
        args: [dealId, evidenceIndex],
        chainId: currentChain.chainId as TypeChainId,
      });

      const hash = await writeContract(config, removeRequest);
      const receipt = await waitForTransactionReceipt(config, { hash });

      // return something meaningful
      return receipt;
    } catch (err) {
      // rethrow so handleAddEvidence can catch it
      throw err;
    }
  };
  const handleRemoveEvidence = (evidenceIndex: number) => {
    bloomLog("Evidence Index: ", evidenceIndex);
    openModal({
      type: "confirm",
      title: "Remove Evidence",
      description: (
        <div className="space-y-2 text-[13px]">
          <p>You are about to remove an evidence.</p>
        </div>
      ),
      confirmText: "Yes, Remove",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        setRemove({ loading: true, error: null, text: "Removing..." });
        try {
          const validatedDealId = dealId;

          const receipt = await removeEvidenceTransaction(
            validatedDealId,
            evidenceIndex
          );
          if (receipt.status == "success") {
            openModal({
              type: "success",
              title: "Removeal Successful",
              description: (
                <div className="space-y-2 text-[13px]">
                  <p>You successfully removed an evidence.</p>
                </div>
              ),
              confirmText: "Close",
            });

            refetchEvidences();
            setRemove({
              loading: false,
              error: null,
              text: "Remove",
            });
          }
        } catch (err: any) {
          const errorMessage = (err as Error).message;

          bloomLog("Unexpected Error: ", err);
          openModal({
            type: "error",
            title: "Removal Failed",
            description: (
              <div className="space-y-2 text-[13px]">
                <p>{errorMessage}</p>
              </div>
            ),
            confirmText: "Close",
          });
          setRemove({ loading: false, error: err, text: "Remove" });
        }
      },
    });
  };

  // callback when user confirms
  const handleConfirmDispute = async () => {
    setIsConfirmOpen(false);
    setIsModalOpen(true);
    // optionally set submitted state
    setClaimted(true);

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
      setClaimted(false);
    }

    // here you can also call openDispute() to trigger blockchain interaction
  };

  const plaintiff =
    dispute?.initiator == dispute?.sender ? dispute?.sender : dispute?.receiver;

  const defendant =
    dispute?.initiator == dispute?.sender ? dispute?.receiver : dispute?.sender;

  const [remove, setRemove] = useState<{
    loading: boolean;
    error: any;
    text: string;
  }>({ loading: false, error: "", text: "Remove" });

  const isWinner = dispute?.winner == signerAddress;

  const [claim, setClaim] = useState<{
    loading: boolean;
    error: any;
    text: string;
  }>({ loading: false, error: "", text: "Claim" });

  const claimFundsTransaction = async (disputeId: bigint | string) => {
    try {
      const { request: claimFundsRequest } = await simulateContract(config, {
        abi: disputeManagerAbi,
        address: disputeManagerAddress as Address,
        functionName: "releaseFundsToWinner",
        args: [disputeId],
        chainId: currentChain.chainId as TypeChainId,
      });

      const hash = await writeContract(config, claimFundsRequest);
      const receipt = await waitForTransactionReceipt(config, { hash });

      // return something meaningful
      return receipt;
    } catch (err) {
      // rethrow so handleAddEvidence can catch it
      throw err;
    }
  };

  const handleClaimFunds = () => {
    openModal({
      type: "confirm",
      title: "Claim Funds",
      description: (
        <div className="space-y-2 text-[13px]">
          <p>You are about to claim the deal funds.</p>
        </div>
      ),
      confirmText: "Yes",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        setClaim({ loading: true, error: null, text: "Claiming..." });
        try {
          const receipt = await claimFundsTransaction(disputeId!);
          if (receipt.status == "success") {
            openModal({
              type: "success",
              title: "Claming Successful",
              description: (
                <div className="space-y-2 text-[13px]">
                  <p>You successfully claimed the deal funds.</p>
                </div>
              ),
              confirmText: "Close",
            });

            const newDeal = await getDeal(dealId);
            setDeal(newDeal);

            setClaim({
              loading: false,
              error: null,
              text: "Claimed",
            });
          }
        } catch (err: any) {
          const errorMessage = (err as Error).message;

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
          setClaim({ loading: false, error: err, text: "Claim Deal Funds" });
        }
      },
    });
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
            setClaimted(false); // reset submit state if needed
          }}
          token={token}
          currentChain={currentChain}
          disputeState={disputeState}
          deal={deal!}
        />
      )}

      {signerAddress && (
        <JurorModal
          open={isJurorModalOpen}
          onClose={() => {
            setSelectedJurorAddress(zeroAddress);
            setIsJurorModalOpen(false);
          }}
          disputeId={disputeId!}
          jurorAddress={selectedJurorAddress!}
          plaintiff={plaintiff!}
          defendant={defendant!}
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
          <div className="flex flex-col md:flex-row w-full gap-8">
            {/* LEFT PANEL */}
            {dispute ? (
              <div className="space-y-6">
                {status == "Ongoing" ? (
                  <Card className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-lg backdrop-blur-sm p-0">
                    {/* Aurora Glow Effect */}
                    <div className="absolute -top-1/4 left-1/2 -z-10 h-1/2 w-full -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"></div>

                    <div className="flex flex-col gap-4 p-5 sm:p-6">
                      {/* Redesigned Header */}
                      <div className="flex gap-4 flex-row items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 shrink-0 text-emerald-400" />
                            <h2 className="text-xl font-bold text-white sm:text-2xl">
                              Dispute #{disputeId?.toString() || "—"}
                            </h2>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Link className="h-3 w-3 text-slate-500" />
                            <p className="text-xs text-slate-400">
                              Linked Deal: {dealId?.toString() || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                            {status}
                          </span>
                          {disputeTimer && (
                            <DisputeTimer disputeTimer={disputeTimer} />
                          )}
                        </div>
                      </div>

                      {/* "Plaintiff vs Defendant" Face-off Section */}
                      {dispute && (
                        <div className="mt-2 flex  items-center gap-4 rounded-xl  py-4 justify-between w-full xs:flex-row  flex-col">
                          {/* Plaintiff Info */}
                          <div className="flex w-full items-center gap-3 md:w-auto md:flex-1">
                            <User className="h-5 w-5 shrink-0 text-slate-400" />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-500">
                                Plaintiff
                              </p>
                              <p className="truncate font-mono text-sm font-medium text-white">
                                {formatAddress(plaintiff!)}
                              </p>
                            </div>
                          </div>

                          {/* Visual Separator */}
                          <div className="shrink-0 rounded-full border border-slate-700 bg-slate-800 p-2">
                            <Scale className="h-5 w-5 text-emerald-500" />
                          </div>

                          {/* Defendant Info */}
                          <div className="flex w-full items-center justify-end gap-3 text-right md:w-auto md:flex-1">
                            <div className="min-w-0">
                              <p className="text-xs text-slate-500">
                                Defendant
                              </p>
                              <p className="truncate font-mono text-sm font-medium text-white">
                                {formatAddress(defendant!)}
                              </p>
                            </div>
                            <User className="h-5 w-5 shrink-0 text-slate-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <DisputeOutcomeCard
                    isWinner={isWinner}
                    onClaimFunds={handleClaimFunds}
                    claimState={{ claim }}
                    deal={deal!}
                  />
                )}
              </div>
            ) : (
              <Card className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-0 shadow-lg backdrop-blur-sm">
                {/* Aurora Glow Effect */}
                <div className="absolute -top-1/4 left-1/2 -z-10 h-1/2 w-full -translate-x-1/2 rounded-full bg-slate-700/10 blur-3xl"></div>

                <div className="flex flex-col gap-4 p-5 sm:p-6">
                  {/* --- Skeleton for Header --- */}
                  <div className="flex animate-pulse flex-row items-start justify-between gap-4">
                    <div>
                      {/* Title */}
                      <div className="mb-3 h-7 w-48 rounded-md bg-slate-700"></div>
                      {/* Linked Deal */}
                      <div className="h-4 w-32 rounded-md bg-slate-700"></div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {/* Status Badge */}
                      <div className="h-6 w-20 rounded-full bg-slate-700"></div>
                      {/* Timer */}
                      <div className="h-5 w-24 rounded-md bg-slate-700"></div>
                    </div>
                  </div>

                  {/* --- Skeleton for "Plaintiff vs Defendant" --- */}
                  <div className="mt-2 flex flex-col items-center gap-4 rounded-xl py-4 xs:flex-row">
                    {/* Plaintiff Info */}
                    <div className="flex w-full animate-pulse items-center gap-3 md:flex-1">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-slate-700"></div>
                      <div className="w-full space-y-2">
                        <div className="h-3 w-16 rounded-md bg-slate-700"></div>
                        <div className="h-5 w-full max-w-48 rounded-md bg-slate-700"></div>
                      </div>
                    </div>

                    {/* Visual Separator */}
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-800"></div>

                    {/* Defendant Info */}
                    <div className="flex w-full animate-pulse items-center justify-end gap-3 text-right md:flex-1">
                      <div className="w-full space-y-2">
                        <div className="h-3 w-16 self-end rounded-md bg-slate-700"></div>
                        <div className="h-5 w-full max-w-48 self-end rounded-md bg-slate-700"></div>
                      </div>
                      <div className="h-8 w-8 shrink-0 rounded-full bg-slate-700"></div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* RIGHT PANEL */}
            <div className="w-full">
              <Tabs defaultValue="deal" className="w-full">
                <TabsList className="w-full bg-slate-900/60 border border-slate-800 rounded-xl flex justify-around">
                  <TabsTrigger
                    className="flex-1 py-3 text-sm font-medium text-white data-[state=active]:bg-emerald-500 hover:bg-slate-900 cursor-pointer"
                    value="deal"
                  >
                    Deal Details
                  </TabsTrigger>
                  <TabsTrigger
                    className="flex-1 py-3 text-sm font-medium text-white data-[state=active]:bg-emerald-500 hover:bg-slate-900 cursor-pointer"
                    value="jurors"
                  >
                    Jurors
                  </TabsTrigger>
                  <TabsTrigger
                    className="flex-1 py-3 text-sm font-medium text-white data-[state=active]:bg-emerald-500 hover:bg-slate-900 cursor-pointer"
                    value="evidence"
                  >
                    Evidence
                  </TabsTrigger>
                </TabsList>

                {/* DEAL TAB */}
                <TabsContent value="deal" className="mt-6">
                  {deal ? (
                    <Card className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-lg backdrop-blur-sm p-0">
                      {/* Aurora Glow Effect */}
                      <div className="absolute -top-1/2 left-1/2 -z-10 h-full w-full -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"></div>

                      <CardContent className="flex flex-col gap-6 p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate font-mono text-sm text-slate-300">
                              #{deal.id.toString()}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            <span>{status}</span>
                          </div>
                        </div>

                        {/* Hero Section */}
                        <div className="text-center">
                          <p className="text-sm text-slate-400">
                            Amount Transferred
                          </p>
                          {/* */}
                          <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-400 sm:text-4xl">
                            {inCurrencyFormat(formatUnits(deal.amount, token.decimal))}
                            <span className="ml-2 text-xl font-medium text-slate-400 sm:text-2xl">
                              {token.symbol}
                            </span>
                          </p>
                        </div>

                        {/* Transaction Flow Section */}
                        {/* */}
                        <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-900/50 p-4 sm:flex-row sm:justify-between">
                          {/* */}
                          <div className="flex min-w-0 flex-col items-center sm:flex-1 sm:items-start">
                            <span className="mb-1 text-xs text-slate-500">
                              From
                            </span>
                            <div className="flex min-w-0 items-center gap-2">
                              <CircleUser className="h-4 w-4 shrink-0 text-slate-400" />
                              <span className="truncate font-mono text-sm text-white">
                                {formatAddress(deal.sender)}
                              </span>
                            </div>
                          </div>

                          {/* */}
                          <div className="shrink-0 rounded-full bg-slate-800 p-2">
                            <ArrowDown className="block h-5 w-5 text-emerald-500 sm:hidden" />
                            <ArrowRight className="hidden h-5 w-5 text-emerald-500 sm:block" />
                          </div>

                          {/* */}
                          <div className="flex min-w-0 flex-col items-center sm:flex-1 sm:items-end">
                            <span className="mb-1 text-xs text-slate-500">
                              To
                            </span>
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="truncate font-mono text-sm text-white">
                                {formatAddress(deal.receiver)}
                              </span>
                              <CircleUser className="h-4 w-4 shrink-0 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-0 shadow-lg backdrop-blur-sm">
                      {/* Skeleton's Aurora Glow Effect */}
                      <div className="absolute -top-1/2 left-1/2 -z-10 h-full w-full -translate-x-1/2 rounded-full bg-slate-700/10 blur-3xl"></div>

                      <CardContent className="flex animate-pulse flex-col gap-6 p-4">
                        {/* === Skeleton for Header === */}
                        <div className="flex items-center justify-between">
                          {/* Deal ID placeholder */}
                          <div className="h-5 w-24 rounded-md bg-slate-700"></div>
                          {/* Status Badge placeholder */}
                          <div className="h-6 w-20 rounded-full bg-slate-700"></div>
                        </div>

                        {/* === Skeleton for Hero Section === */}
                        <div className="text-center">
                          {/* "Amount Transferred" label placeholder */}
                          <div className="mx-auto h-4 w-32 rounded-md bg-slate-700"></div>
                          {/* Amount + Symbol placeholder */}
                          <div className="mx-auto mt-2 h-10 w-48 rounded-md bg-slate-700 sm:h-12"></div>
                        </div>

                        {/* === Skeleton for Transaction Flow Section === */}
                        <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-900/50 p-4 sm:flex-row sm:justify-between">
                          {/* "From" Block placeholder */}
                          <div className="flex w-full min-w-0 flex-col items-center gap-2 sm:flex-1 sm:items-start">
                            <div className="h-3 w-12 rounded-md bg-slate-700"></div>
                            <div className="flex w-full min-w-0 items-center gap-2">
                              <div className="h-6 w-6 shrink-0 rounded-full bg-slate-700"></div>
                              <div className="h-5 w-full max-w-36 rounded-md bg-slate-700"></div>
                            </div>
                          </div>

                          {/* Arrow placeholder */}
                          <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800"></div>

                          {/* "To" Block placeholder */}
                          <div className="flex w-full min-w-0 flex-col items-center gap-2 sm:flex-1 sm:items-end">
                            <div className="h-3 w-8 rounded-md bg-slate-700"></div>
                            <div className="flex w-full min-w-0 items-center justify-end gap-2">
                              <div className="h-5 w-full max-w-36 rounded-md bg-slate-700"></div>
                              <div className="h-6 w-6 shrink-0 rounded-full bg-slate-700"></div>
                            </div>
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
                            className="relative overflow-hidden bg-slate-900  border border-slate-800 pt-4 px-4 rounded-2xl shadow-md transition-all duration-300 hover:border-emerald-500/40 hover:shadow-emerald-500/10 pb-2"
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

                            <button
                              className="flex items-center justify-between cursor-pointer hover:scale-105"
                              onClick={() => {
                                setSelectedJurorAddress(address);
                                setIsJurorModalOpen(true);
                              }}
                            >
                              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                                View Details
                              </span>
                            </button>
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
                  {dealEvidences && dealEvidences.length > 0 ? (
                    <div>
                      {dealEvidences
                        .slice() // copy so you don't mutate
                        .reverse()
                        .slice(0, 2) // only take the first 2 after reversing
                        .map((currentEvidence, indexFromReversed) => {
                          const originalIndex =
                            dealEvidences.length - 1 - indexFromReversed;
                          return (
                            <EvidenceCard
                              key={originalIndex}
                              evidence={currentEvidence}
                              index={originalIndex} // still original index
                              isJurorView={false}
                              handleRemoveEvidence={handleRemoveEvidence}
                              removalState={{ remove, setRemove }}
                            />
                          );
                        })}
                    </div>
                  ) : (
                    <EmptyState
                      Icon={FileSearch}
                      title="No Evidence Submitted"
                      description="Evidence from either party will appear in this section once uploaded."
                      actionText="Submit New Evidence"
                      onActionClick={() => {
                        router.push(`/evidence/${dealId}`);
                      }}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
