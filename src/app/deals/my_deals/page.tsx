"use client";

import React, { useState, useEffect } from "react";
import DealCard from "@/components/escrow/DealCard";
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
import {bloomLog} from "@/lib/utils";

interface Deal {
  id: number;
  receiver: string;
  sender: string;
  amount: string;
  status: "Pending" | "Acknowledged" | "Completed" | "Disputed" | "Finalized";
  description: string;
  createdAt: string;
}

export default function MyDealsPage() {
  const { creatorDeals, recipientDeals, loadCreatorDeals, loadRecipientDeals, loadAllSupportedTokens } =
    useDefi();
  const { address: signerAddress } = useAccount();

  useEffect(() => {
    const fetchDeals = async () => {
      if (!signerAddress) return;
      await loadCreatorDeals(signerAddress);
    //   await loadRecipientDeals(signerAddress);
    };
    fetchDeals();
  }, [signerAddress]);

  useEffect(() => {
    loadAllSupportedTokens();
  }, []);


  bloomLog("Creator Deals: ", creatorDeals);

  const [activeMainTab, setActiveMainTab] = useState<
    "Created Deals" | "Deals for Me"
  >("Created Deals");
  const [activeStatusFilter, setActiveStatusFilter] = useState<
    "All" | "Pending" | "Acknowledged" | "Completed" | "Disputed" | "Finalized"
  >("All");

  const dummyCreatedDeals: Deal[] = [
    {
      id: 1,
      receiver: "0xA1b2...3c4D",
      sender: "You",
      amount: "500 USDC",
      status: "Pending",
      description: "Website design",
      createdAt: "2025-09-15",
    },
    {
      id: 2,
      receiver: "0xE5f6...7g8H",
      sender: "You",
      amount: "300 DAI",
      status: "Acknowledged",
      description: "Logo + Branding",
      createdAt: "2025-09-10",
    },
  ];

  const dummyReceivedDeals: Deal[] = [
    {
      id: 3,
      receiver: "You",
      sender: "0xQ7R8...S9T0",
      amount: "900 USDC",
      status: "Completed",
      description: "Marketing campaign",
      createdAt: "2025-09-07",
    },
    {
      id: 4,
      receiver: "You",
      sender: "0xM1N2...O3P4",
      amount: "250 ETH",
      status: "Disputed",
      description: "Audit & security",
      createdAt: "2025-09-02",
    },
  ];

  const dealsToDisplay =
    activeMainTab === "Created Deals" ? dummyCreatedDeals : dummyReceivedDeals;

  const filteredDeals =
    activeStatusFilter === "All"
      ? dealsToDisplay
      : dealsToDisplay.filter((deal) => deal.status === activeStatusFilter);

  const statusOptions = [
    "All",
    "Pending",
    "Acknowledged",
    "Completed",
    "Disputed",
    "Finalized",
  ] as const;

  const handleCancel = (id: number) => console.log("Cancel deal", id);
  const handleRelease = (id: number) => console.log("Release deal", id);
  const handleClaim = (id: number) => console.log("Claim deal", id);

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

        <div className="w-full lg:px-40 gap-6">
          {/* Right Panel */}
          <div className="space-y-6 mx-auto ">
            {/* Main Tabs */}
            <div className="flex space-x-2">
              {["Created Deals", "Deals for Me"].map((tab) => (
                <Button
                  key={tab}
                  onClick={() => setActiveMainTab(tab as any)}
                  className={`flex-1 ${
                    activeMainTab === tab
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-slate-800 hover:bg-slate-700 text-white/70"
                  }`}
                >
                  {tab} (
                  {tab === "Created Deals"
                    ? dummyCreatedDeals.length
                    : dummyReceivedDeals.length}
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
            {filteredDeals.length === 0 && (
              <p className="text-white/70 text-center mt-10">
                No deals found in this category
              </p>
            )}

            {creatorDeals?.length > 0 && creatorDeals.map((deal, id) => (
              <DealCard
                key={id}
                deal={deal}
                currentUser="sender"
                onCancel={handleCancel}
                onRelease={handleRelease}
                onClaim={handleClaim}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
