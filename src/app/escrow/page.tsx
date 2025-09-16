"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ShieldCheck,
  Lock,
  Wallet,
  Coins,
  FileText,
} from "lucide-react";
import DealCard from "@/components/escrow/DealCard"; // Import your new DealCard

export default function EscrowPage() {
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [deals, setDeals] = useState([
    {
      id: 1,
      recipient: "0xA1b2...3c4D",
      sender: "You",
      amount: "500 USDC",
      status: "Pending" as const,
      description: "Freelance website design project",
      createdAt: "2025-09-15",
    },
    {
      id: 2,
      recipient: "0xE5f6...7g8H",
      sender: "You",
      amount: "300 DAI",
      status: "Acknowledged" as const,
      description: "Logo + Branding work",
      createdAt: "2025-09-10",
    },
  ]);

  const [form, setForm] = useState({
    recipient: "",
    amount: "",
    token: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createDeal = () => {
    setLoadingDeals(true);
    setTimeout(() => {
      setDeals([
        ...deals,
        {
          id: deals.length + 1,
          recipient: form.recipient,
          sender: "You",
          amount: `${form.amount} ${form.token}`,
          status: "Pending" as const,
          description: form.description,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ]);
      setForm({ recipient: "", amount: "", token: "", description: "" });
      setLoadingDeals(false);
    }, 2000);
  };

  // Handlers for DealCard actions
  const handleCancelDeal = (id: number) => {
    setDeals(deals.map(d => d.id === id ? { ...d, status: "Disputed" } : d));
  };

  const handleReleaseDeal = (id: number) => {
    setDeals(deals.map(d => d.id === id ? { ...d, status: "Completed" } : d));
  };

  const handleClaimDeal = (id: number) => {
    alert(`Claim action for deal ID: ${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="text-emerald-500" />
              <h2 className="text-xl font-bold text-white">
                Your Wallet Balances
              </h2>
            </div>

            <div className="text-sm text-white/70 mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-white/70" />
              <span className="truncate w-52">0xA1b2...3c4D</span>
            </div>

            <div className="mb-4 p-3 bg-slate-800/90 rounded-lg text-sm border border-emerald-600/40 text-white/70">
              <span className="font-semibold text-emerald-400">Total Balance:</span>{" "}
              1,500 USDC + 2 ETH
            </div>

            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-400" /> USDC
                </span>
                <span className="font-medium text-white">500 USDC</span>
              </li>
              <li className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-400" /> DAI
                </span>
                <span className="font-medium text-white">300 DAI</span>
              </li>
              <li className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-400" /> ETH
                </span>
                <span className="font-medium text-white">2 ETH</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/95 border border-cyan-500/30 shadow-lg">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-lg font-bold text-cyan-400">Quick Links</h3>
            <Button className="w-full bg-cyan-600/20 hover:bg-cyan-600/30 text-white/70 flex items-center gap-2">
              <Coins className="w-4 h-4" /> View All Deals
            </Button>
            <Button className="w-full bg-cyan-600/20 hover:bg-cyan-600/30 text-white/70 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Your Disputes
            </Button>
            <Button className="w-full bg-cyan-600/20 hover:bg-cyan-600/30 text-white/70 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Escrow FAQ
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg w-full max-w-4xl">
          <CardContent className="p-6 space-y-6">
            {/* Header + How It Works Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-emerald-400">
                Create New Escrow Deal
              </h2>
              <Button
                variant="secondary"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-cyan-400 hover:bg-slate-900/50  text-sm font-medium bg-slate-800/50 border border-cyan-500/30"
              >
                How it Works
              </Button>
            </div>

            {/* Create Deal Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Recipient Address</label>
                <Input
                  name="recipient"
                  placeholder="0xA1b2...3c4D"
                  value={form.recipient}
                  onChange={handleChange}
                  className="bg-slate-800 border border-slate-700 placeholder:text-white/50 text-white"
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white mb-1">Amount</label>
                  <Input
                    name="amount"
                    placeholder="100"
                    value={form.amount}
                    onChange={handleChange}
                    className="bg-slate-800 border border-slate-700 placeholder:text-white/50 text-white"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-white mb-1">Token</label>
                  <select
                    name="token"
                    value={form.token}
                    onChange={handleChange}
                    className="bg-slate-800 border border-slate-700 text-white w-full p-2 rounded"
                  >
                    <option value="">Select</option>
                    <option value="USDC">USDC</option>
                    <option value="DAI">DAI</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Deal Description</label>
                <Textarea
                  name="description"
                  placeholder="Briefly describe the deal so both parties understand the terms."
                  value={form.description}
                  onChange={handleChange}
                  className="bg-slate-800 border border-slate-700 placeholder:text-white/50 text-white"
                />
              </div>

              <div className="text-sm text-white/70">
                Escrow Fee (2%):{" "}
                <span className="text-emerald-400">
                  {form.amount ? (Number(form.amount) * 0.02).toFixed(2) : "0"}{" "}
                  {form.token || ""}
                </span>
              </div>

              <Button
                onClick={createDeal}
                disabled={loadingDeals}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loadingDeals ? <Loader2 className="animate-spin mr-2" /> : "Create Deal"}
              </Button>
            </div>

            {/* How It Works Section */}
            <div
              id="how-it-works"
              className="bg-slate-800/90 p-4 rounded-lg border border-emerald-600/30 mt-6"
            >
              <div className="flex items-center space-x-2 mb-2">
                <ShieldCheck className="text-emerald-500" />
                <h2 className="text-lg font-bold text-white">How Bloom Escrow Works</h2>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-slate-200 text-sm">
                <li>Create a deal and deposit funds</li>
                <li>Seller acknowledges and completes work</li>
                <li>Funds released when both sides agree</li>
              </ol>
              <div className="mt-2 p-2 bg-slate-700/80 rounded-lg text-xs border border-emerald-500/30 text-white/70">
                <Lock className="w-4 h-4 inline mr-1 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Escrow Fee:</span> 2% (paid by sender)
              </div>
            </div>

            {/* Your Deals */}
            <div>
              <h2 className="text-xl font-bold text-cyan-400 mt-4 mb-2">Your Deals</h2>
              <div className="space-y-4">
                {deals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onCancel={handleCancelDeal}
                    onRelease={handleReleaseDeal}
                    onClaim={handleClaimDeal}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
