"use client";

import React, { useState, useEffect } from "react";
import DealCard, { DealCardSkeleton } from "@/components/escrow/DealCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import Header from "@/components/Header";
import useDefi from "@/hooks/useDefi";
import { useAccount } from "wagmi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bloomEscrowAbi } from "@/constants";
import { bloomLog } from "@/lib/utils";
import { Status, TypeChainId, DealAction } from "@/types";
import ConfirmActionModal from "@/components/deals/ConfirmationActionModal";
import StatusModal from "@/components/deals/StatusModal";
import { Address } from "viem";
import { config } from "@/lib/wagmi";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { getChainConfig } from "@/constants";
import { useWatchContractEvent } from "wagmi";

type StatusOptions =
  | "All"
  | "Pending"
  | "Acknowledged"
  | "Completed"
  | "Disputed"
  | "Finalized"
  | "Canceled";

interface Deal {
  id: number;
  receiver: string;
  sender: string;
  amount: string;
  status:
    | "Canceled"
    | "Pending"
    | "Acknowledged"
    | "Completed"
    | "Disputed"
    | "Finalized";
  description: string;
  createdAt: string;
}

export default function MyDealsPage() {
  const {
    creatorDeals,
    recipientDeals,
    loadCreatorDeals,
    loadRecipientDeals,
    loadAllSupportedTokens,
  } = useDefi();
  const { address: signerAddress } = useAccount();
  const currentChain = getChainConfig("sepolia");
  const bloomEscrowAddress = currentChain.bloomEscrowAddress as Address;

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | {
    type: DealAction;
    dealId: number;
  }>(null);

  const [loadingAction, setLoadingAction] = useState<{
    dealId: number | null;
    type: DealAction;
  }>({ dealId: null, type: null });

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    success: boolean;
    message: string;
  }>({ open: false, success: false, message: "" });

  useEffect(() => {
    const fetchDeals = async () => {
      if (!signerAddress) return;
      await loadCreatorDeals(signerAddress);
      await loadRecipientDeals(signerAddress);
    };
    fetchDeals();
  }, [signerAddress]);

  useEffect(() => {
    loadAllSupportedTokens();
  }, []);

  //   bloomLog("Creator Deals: ", creatorDeals);

  const [activeMainTab, setActiveMainTab] = useState<
    "Created Deals" | "Deals for Me"
  >("Created Deals");
  const [activeStatusFilter, setActiveStatusFilter] = useState<
    | "All"
    | "Pending"
    | "Acknowledged"
    | "Completed"
    | "Disputed"
    | "Finalized"
    | "Canceled"
  >("All");

  const dealsToDisplay =
    (activeMainTab === "Created Deals" ? creatorDeals : recipientDeals) ?? null;

  const filteredDeals =
    dealsToDisplay == null
      ? null
      : activeStatusFilter === "All"
      ? [...dealsToDisplay].reverse() // reverse order here
      : [...dealsToDisplay]
          .filter((deal) => Status[deal.status] === activeStatusFilter)
          .reverse(); // also reverse after filtering

  const statusOptions = [
    "All",
    "Pending",
    "Acknowledged",
    "Completed",
    "Disputed",
    "Finalized",
    "Canceled",
  ] as const;
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleCancel = (id: number) => console.log("Cancel deal", id);
  const handleRelease = (id: number) => console.log("Release deal", id);
  const handleClaim = (id: number) => console.log("Claim deal", id);

  const acknowledgeDeal = async (id: number) => {
    setLoadingAction({ dealId: id, type: "acknowledge" });

    try {
      const { request: createDealRequest } = await simulateContract(config, {
        abi: bloomEscrowAbi,
        address: bloomEscrowAddress as Address,
        functionName: "acknowledgeDeal",
        args: [id],
        chainId: currentChain.chainId as TypeChainId,
      });
      const hash = await writeContract(config, createDealRequest);

      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash,
      });

      if (transactionReceipt.status === "success") {
        bloomLog("Deal acknowledged successfully!");
        setStatusModal({
          open: true,
          success: true,
          message: "Action completed successfully!",
        });
        setLoadingAction({ dealId: null, type: null });
        await loadRecipientDeals(signerAddress!);
        await loadCreatorDeals(signerAddress!);
      }
    } catch (err) {
      setStatusModal({
        open: true,
        success: false,
        message: "Transaction failed. Try again.",
      });
    } finally {
      setLoadingAction({ dealId: null, type: null });
    }
  };

  const unacknowledgeDeal = async (id: number) => {
    setLoadingAction({ dealId: id, type: "unacknowledge" });

    try {
      const { request: unacknowledgeRequest } = await simulateContract(config, {
        abi: bloomEscrowAbi,
        address: bloomEscrowAddress as Address,
        functionName: "unacknowledgeDeal",
        args: [id],
        chainId: currentChain.chainId as TypeChainId,
      });
      const hash = await writeContract(config, unacknowledgeRequest);

      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash,
      });

      if (transactionReceipt.status === "success") {
        bloomLog("Deal unacknowledged successfully!");
        setStatusModal({
          open: true,
          success: true,
          message: "Action completed successfully!",
        });
        setLoadingAction({ dealId: null, type: null });
        await loadRecipientDeals(signerAddress!);
        await loadCreatorDeals(signerAddress!);
      }
    } catch (err) {
      setStatusModal({
        open: true,
        success: false,
        message: "Transaction failed. Try again.",
      });
    } finally {
      setLoadingAction({ dealId: null, type: null });
    }
  };

  const release = async (id: number) => {
    setLoadingAction({ dealId: id, type: "release" });

    try {
      const { request: releaseRequest } = await simulateContract(config, {
        abi: bloomEscrowAbi,
        address: bloomEscrowAddress as Address,
        functionName: "finalizeDeal",
        args: [id],
        chainId: currentChain.chainId as TypeChainId,
      });
      const hash = await writeContract(config, releaseRequest);

      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash,
      });

      if (transactionReceipt.status === "success") {
        bloomLog("Funds have been released successfully!");
        setStatusModal({
          open: true,
          success: true,
          message: "Funds have been released successfully!",
        });
        setLoadingAction({ dealId: null, type: null });
        await loadRecipientDeals(signerAddress!);
        await loadCreatorDeals(signerAddress!);
      }
    } catch (err) {
      setStatusModal({
        open: true,
        success: false,
        message: "Transaction failed. Try again.",
      });
    } finally {
      setLoadingAction({ dealId: null, type: null });
    }
  };

  const cancelDeal = async (id: number) => {
    bloomLog("We are here with id: ", id);
    setLoadingAction({ dealId: id, type: "cancel" });

    try {
      const { request: cancelRequest } = await simulateContract(config, {
        abi: bloomEscrowAbi,
        address: bloomEscrowAddress as Address,
        functionName: "cancelDeal",
        args: [id],
        chainId: currentChain.chainId as TypeChainId,
      });
      const hash = await writeContract(config, cancelRequest);

      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash,
      });

      if (transactionReceipt.status === "success") {
        bloomLog("Deal has been canceled successfully!");
        setStatusModal({
          open: true,
          success: true,
          message: "Deal has been canceled successfully!",
        });
        setLoadingAction({ dealId: null, type: null });
        await loadRecipientDeals(signerAddress!);
        await loadCreatorDeals(signerAddress!);
      }
    } catch (err) {
      bloomLog("Error there is an error oo.");
      setStatusModal({
        open: true,
        success: false,
        message: "Transaction failed. Try again.",
      });
    } finally {
      setLoadingAction({ dealId: null, type: null });
    }
  };
  const handleUnacknowledge = (id: number) => {
    setConfirmAction({ type: "unacknowledge", dealId: id });
    setShowConfirm(true);
  };

  const openConfirm = (type: DealAction, dealId: number) => {
    setConfirmAction({ type, dealId });
    setShowConfirm(true);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6">
        {/* Background Glows */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        {/* <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div> */}

        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white">My Deals</h1>
          <p className="text-white/70 mt-1 text-sm">
            Track all your deals and take actions quickly
          </p>
        </div>

        <div className="w-full lg:px-10 gap-6">
          {/* Right Panel */}
          <div className="space-y-6">
            {/* Main Tabs */}
            <div className="w-full flex justify-center space-x-2 ">
              {["Created Deals", "Deals for Me"].map((tab) => (
                <Button
                  key={tab}
                  onClick={() => setActiveMainTab(tab as any)}
                  className={`px-6 w-4/12 flex-1 ${
                    activeMainTab === tab
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-slate-800 hover:bg-slate-700 text-white/70"
                  }`}
                >
                  {tab} (
                  {tab === "Created Deals"
                    ? creatorDeals?.length
                    : recipientDeals?.length}
                  )
                </Button>
              ))}
            </div>

            {/* Status Dropdown */}
            <div className="mt-4 flex items-center space-x-2">
              <p className="text-white/70 text-sm">Filter by status</p>
              <Select
                value={activeStatusFilter}
                onValueChange={(val) =>
                  setActiveStatusFilter(val as typeof activeStatusFilter)
                }
              >
                <SelectTrigger className="bg-slate-800 border border-slate-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border border-slate-700">
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deals List */}
            {/* {filteredDeals?.length === 0 ? (
              <div className="text-center text-white/70 mt-10">
                <Info className="w-6 h-6 mx-auto mb-2" />
                {activeMainTab === "Created Deals"
                  ? "No created deals found"
                  : "No deals created for you"}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredDeals?.map((deal, id) => (
                  <DealCard
                    key={id}
                    deal={deal}
                    currentUser={
                      activeMainTab === "Created Deals" ? "sender" : "receiver"
                    }
                    onCancel={() => openConfirm("cancel", deal.id)}
                    onRelease={() => openConfirm("release", deal.id)}
                    onClaim={() => openConfirm("release", deal.id)}
                    onAcknowledge={() => openConfirm("acknowledge", deal.id)}
                    onUnacknowledge={() =>
                      openConfirm("unacknowledge", deal.id)
                    }
                    onDispute={() => openConfirm("dispute", deal.id)}
                    loadingAction={loadingAction}
                  />
                ))}
              </div>
            )} */}

            {!filteredDeals ? (
              // Show skeletons while loading
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <DealCardSkeleton key={index} />
                ))}
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="text-center text-white/70 mt-10">
                <Info className="w-6 h-6 mx-auto mb-2" />
                {activeMainTab === "Created Deals"
                  ? "No created deals found"
                  : "No deals created for you"}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredDeals?.map((deal, id) => (
                  <DealCard
                    key={id}
                    deal={deal}
                    currentUser={
                      activeMainTab === "Created Deals" ? "sender" : "receiver"
                    }
                    onCancel={() => openConfirm("cancel", deal.id)}
                    onRelease={() => openConfirm("release", deal.id)}
                    onClaim={() => openConfirm("release", deal.id)}
                    onAcknowledge={() => openConfirm("acknowledge", deal.id)}
                    onUnacknowledge={() =>
                      openConfirm("unacknowledge", deal.id)
                    }
                    onDispute={() => openConfirm("dispute", deal.id)}
                    loadingAction={loadingAction}
                  />
                ))}
              </div>
            )}

            {showConfirm && (
              <ConfirmActionModal
                open={showConfirm}
                action={confirmAction?.type ?? null}
                onCancel={() => setShowConfirm(false)}
                onConfirm={async () => {
                  setShowConfirm(false);
                  const dealId = confirmAction?.dealId;
                  if (dealId === null || dealId === undefined) return;

                  if (confirmAction?.type === "cancel") {
                    await cancelDeal(dealId);
                  }
                  if (confirmAction?.type === "release") {
                    await release(dealId);
                  }
                  if (confirmAction?.type === "acknowledge") {
                    await acknowledgeDeal(dealId);
                  }
                  if (confirmAction?.type === "unacknowledge") {
                    await unacknowledgeDeal(dealId);
                  }
                  // setShowConfirm(false);
                }}
              />
            )}

            <StatusModal
              open={statusModal.open}
              success={statusModal.success}
              message={statusModal.message}
              onClose={() => setStatusModal({ ...statusModal, open: false })}
            />
          </div>
        </div>
      </div>
    </>
  );
}
