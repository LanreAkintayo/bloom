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


  const status =
    dispute?.winner != zeroAddress ? "Ended" : "Ongoing";


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

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Dispute for Deal #{dealId}</h1>
          <p className="text-slate-400 text-sm mt-2">
            Track juror decisions, evidence, and updates for this dispute
          </p>
        </div>

        {/* META CARD */}
        <Card className="bg-slate-900 border border-emerald-500/30 p-5 rounded-2xl shadow-md">
          <div className="flex justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold text-emerald-400">
                Dispute #{disputeId?.toString() || "—"}
              </h2>
              <p className="text-slate-400 text-sm">
                Linked Deal: {dealId || "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white text-sm font-medium">
                Status: {status && status}
              </p>
              {disputeTimer && <DisputeTimer disputeTimer={disputeTimer} />}
              {/* <p className="text-slate-500 text-xs">Time Left: 2d 14h</p> */}
            </div>
          </div>

          {deal && (
            <div className="mt-4 border-t border-slate-800 pt-4 flex justify-between">
              <div>
                <p className="text-slate-400 text-sm">Plaintiff</p>
                <p className="text-white font-medium">
                  {formatAddress(deal.sender)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Defendant</p>
                <p className="text-white font-medium">
                  {formatAddress(deal.receiver)}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* MAIN CONTENT */}
        <Tabs defaultValue="deal" className="mt-8">
          <TabsList className="bg-slate-800 border border-slate-700 rounded-xl">
            <TabsTrigger value="deal">Deal Details</TabsTrigger>
            <TabsTrigger value="jurors">Jurors</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
          </TabsList>

          {/* DEAL DETAILS */}
          <TabsContent value="deal">
            <Card className="bg-slate-900 border border-slate-800 mt-6">
              <CardContent className="space-y-3 p-5">
                {deal ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Deal ID</span>
                      <span className="text-white">{deal.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Sender</span>
                      <span className="text-white">
                        {formatAddress(deal.sender)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Receiver</span>
                      <span className="text-white">
                        {formatAddress(deal.receiver)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Amount</span>
                      <span className="text-white">
                        {inCurrencyFormat(formatUnits(deal.amount, 18))} {token.symbol}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 text-center">
                    Loading deal details...
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* JURORS TAB */}
          <TabsContent value="jurors">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {jurorAddresses && disputeId ? (
                jurorAddresses.map(async (address, i) => {
                  const candidate = await getJurorCandidate(
                    disputeId!,
                    address
                  );
                  const disputeVote = await getDisputeVote(
                    disputeId!,
                    address
                  );
                  //   const candidate = disputeData.jurorCandidates[address];
                  return (
                    <Card
                      key={i}
                      className="bg-slate-800 border border-slate-700 p-4 rounded-xl"
                    >
                      <p className="text-slate-400 text-sm mb-1">
                        Juror {i + 1}
                      </p>
                      <p className="text-white font-medium">
                        {formatAddress(address)}
                      </p>
                      {disputeVote ? (
                        <div className="mt-3 text-slate-400 text-sm space-y-1">
                          <p>
                            Has Voted:{" "}
                            {disputeVote.support != zeroAddress ? "Yes" : "No"}
                          </p>
                          <p>
                            Decision:{" "}
                            {disputeVote.support != zeroAddress
                              ? formatAddress(disputeVote.support)
                              : "Not submitted"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm mt-3">
                          Loading candidate info...
                        </p>
                      )}
                    </Card>
                  );
                })
              ) : (
                <p className="text-slate-500 mt-4">Loading jurors...</p>
              )}
            </div>
          </TabsContent>

          {/* EVIDENCE TAB */}
          <TabsContent value="evidence">
            <Card className="bg-slate-900 border border-slate-800 mt-6">
              <CardContent className="p-5 text-slate-400">
                <p>No evidence submitted yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
