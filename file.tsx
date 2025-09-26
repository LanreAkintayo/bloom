"use client";

import React, { Fragment, useEffect, useState } from "react";
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
  Check,
  ChevronDown,
} from "lucide-react";
import DealCard from "@/components/escrow/DealCard"; // Import your new DealCard
import WalletCard from "@/components/escrow/WalletCard";
import HowItWorks from "@/components/escrow/HowItWorks";
import ConfirmationModal from "@/components/escrow/ConfirmationModal";
import Header from "@/components/Header";
import useDefi from "@/hooks/useDefi";
import { useAccount } from "wagmi";
import { bloomLog } from "@/lib/utils";
import { Address, isAddress } from "viem";
import { ChangeEvent } from "react";
import { Listbox, Transition } from "@headlessui/react";
import Image from "next/image";
import { bloomEscrowAbi, getChainConfig, IMAGES } from "@/constants";
import { Token } from "@/types";
import { config } from "@/lib/wagmi";
import {simulateContract, waitForTransactionReceipt, writeContract} from "@wagmi/core";


function formatWithCommas(value: string) {
  if (!value) return "";
  const parts = value.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export default function EscrowPage() {
  const { allSupportedTokens, loadAllSupportedTokens } = useDefi();
  const { address: signerAddress } = useAccount();

  const currentChain = getChainConfig("sepolia");
  const bloomEscrowAddress = currentChain.bloomEscrowAddress as Address;

  useEffect(() => {
    const setUpTokens = async () => {
      await loadAllSupportedTokens();
    };
    setUpTokens();
  }, []);

  // bloomLog("All Supported Tokens: ", allSupportedTokens);

  const [loadingDeals, setLoadingDeals] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState<{
    recipient?: string;
    amount?: string;
    description?: string;
  }>({});

  const tokens = [
    { id: 1, name: "USDC", image: "/usdc.svg" },
    { id: 2, name: "DAI", image: "/dai.svg" },
    { id: 3, name: "ETH", image: "eth.svg" },
  ];

  // This state stores the deal temporarily for confirmation
  const [pendingDeal, setPendingDeal] = useState({
    recipient: "",
    amount: "",
    token: "",
    description: "",
  });

  const handleCreateDealClick = () => {
    // store current form in pendingDeal and open modal
    setPendingDeal({ ...form });
    setModalOpen(true);
  };

  const confirmCreateDeal = () => {
    setLoadingDeals(true);

    // Call create deal here;

    // When you are done, show something 
    setTimeout(() => {
      setDeals([
        ...deals,
        {
          id: deals.length + 1,
          recipient: pendingDeal.recipient,
          sender: "You",
          amount: `${pendingDeal.amount} ${pendingDeal.token}`,
          status: "Pending" as const,
          description: pendingDeal.description,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ]);
      setForm({ recipient: "", amount: "", token: "", description: "" });
      setLoadingDeals(false);
    }, 2000);
  };

  const invalidForm = () => {
    return !form.recipient || !form.amount || !form.token || !form.description || Object.keys(errors).length > 0;
  };

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
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let newErrors = { ...errors };
    let newForm = { ...form, [name]: value };

    if (name === "recipient") {
      if (value && !isAddress(value.trim())) {
        newErrors.recipient = "Invalid wallet address";
      } else {
        delete newErrors.recipient;
      }
    }

    if (name === "amount") {
      // Remove commas and invalid chars
      const raw = value.replace(/,/g, "").replace(/[^0-9.]/g, "");
      // Prevent more than one decimal point
      const validRaw = raw.split(".").length > 2 ? raw.slice(0, -1) : raw;

      // Format display with commas
      const formatted = formatWithCommas(validRaw);

      newForm.amount = formatted;

      if (!validRaw || isNaN(Number(validRaw)) || Number(validRaw) <= 0) {
        newErrors.amount = "Enter a valid amount";
      } else {
        delete newErrors.amount;
      }
    }

    setErrors(newErrors);
    setForm(newForm);
  };

  const createDeal = async () => {
    // Call the smart contract and pass all the data to it;

    bloomLog("Creating Deal")

    //  createDeal(address sender, address receiver, address tokenAddress, uint256 amount, string calldata description)
     type TypeChainId =  1 | 11155111;
    

    const validatedSender = ""
    const validatedReceiver = ""
    const validatedTokenAddress = ""
    const validatedAmount = ""
    const validatedDescription = ""

    try {
      const {request: createDealRequest} = await simulateContract( config, {
        abi: bloomEscrowAbi,
        address: bloomEscrowAddress as Address,
        functionName: "createDeal",
        args: [validatedSender, validatedReceiver, validatedTokenAddress, validatedAmount, validatedDescription],
        chainId: currentChain.chainId as  TypeChainId,
      });
      const hash = await writeContract(config, createDealRequest);

      const transactionReceipt = await waitForTransactionReceipt(config, {hash})

      if (transactionReceipt.status === "success") {
        bloomLog("Deal created successfully!");
      }
    }
    catch (error) {
      console.error("Error creating deal: ", error);
    }

  }

  // Handlers for DealCard actions
  const handleCancelDeal = (id: number) => {
    setDeals(
      deals.map((d) => (d.id === id ? { ...d, status: "Disputed" } : d))
    );
  };

  const handleReleaseDeal = (id: number) => {
    setDeals(
      deals.map((d) => (d.id === id ? { ...d, status: "Completed" } : d))
    );
  };

  const handleClaimDeal = (id: number) => {
    alert(`Claim action for deal ID: ${id}`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg w-full max-w-4xl">
            <CardContent className="space-y-6">
              {/* Header + How It Works Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-emerald-400">
                  Create New Escrow Deal
                </h2>
             
              </div>

              {/* Create Deal Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Recipient Address
                  </label>
                  <Input
                    name="recipient"
                    placeholder="0xA1b2...3c4D"
                    value={form.recipient}
                    onChange={handleChange}
                    className="bg-slate-800 border border-slate-700 placeholder:text-white/50 text-white"
                  />
                  {errors.recipient && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.recipient}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-white mb-1">
                      Amount
                    </label>
                    <Input
                      name="amount"
                      placeholder="100"
                      value={form.amount}
                      onChange={handleChange}
                      className="bg-slate-800 border border-slate-700 placeholder:text-white/50 text-white"
                    />
                    {errors.amount && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.amount}
                      </p>
                    )}
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-white mb-1">
                      Token
                    </label>
                    <Listbox
                      value={form.token}
                      onChange={(value) => setForm({ ...form, token: value })}
                    >
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-pointer rounded bg-slate-800 border border-slate-700 py-2 pl-3 pr-10 text-left text-white focus:outline-none">
                          <span className="flex items-center gap-2">
                            {form.token ? (
                              <>
                                <Image
                                  src={IMAGES[form.token]}
                                  alt={form.token}
                                  width={20}
                                  height={20}
                                />
                                {form.token}
                              </>
                            ) : (
                              "Select"
                            )}
                          </span>
                          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-slate-800 border border-slate-700 text-white shadow-lg">
                            {allSupportedTokens?.map(
                              (token: Token, index: number) => (
                                <Listbox.Option
                                  key={index}
                                  value={
                                    token.name == "WETH" ? "ETH" : token.name
                                  }
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-8 pr-4 ${
                                      active
                                        ? "bg-slate-700 text-white"
                                        : "text-gray-300"
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <Image
                                          src={
                                            token.name == "WETH"
                                              ? IMAGES.ETH
                                              : token.image
                                          }
                                          alt={
                                            token.name == "WETH"
                                              ? "ETH"
                                              : token.name
                                          }
                                          width={20}
                                          height={20}
                                        />
                                        {token.name == "WETH"
                                          ? "ETH"
                                          : token.name}
                                      </div>
                                      {selected && (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-emerald-400">
                                          <Check className="h-4 w-4" />
                                        </span>
                                      )}
                                    </>
                                  )}
                                </Listbox.Option>
                              )
                            )}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-white mb-1">
                    Deal Description
                  </label>
                  <Textarea
                    name="description"
                    placeholder="Leave a description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={100}
                    className="bg-slate-800 border border-slate-700 placeholder:text-white/50 text-white pr-12"
                  />
                  {/* Character counter */}
                  <span className="absolute bottom-2 right-2 text-xs text-white/50">
                    {form.description.length}/100
                  </span>
                </div>

                {/* Escrow Fee and Total Fee */}
                <div className="space-y-2">
                  <div className="text-sm text-white/70">
                    Escrow Fee (2%):{" "}
                    <span className="text-emerald-400">
                      {form.amount
                        ? (
                            Number(form.amount.replace(/,/g, "")) * 0.02
                          ).toFixed(2)
                        : "0"}{" "}
                      {form.token || ""}
                    </span>
                  </div>
                  <div className="text-sm text-white/70">
                    Total Fee:{" "}
                    <span className="text-emerald-400">
                      {form.amount
                        ? (
                            Number(form.amount.replace(/,/g, "")) * 0.02 +
                            Number(form.amount.replace(/,/g, ""))
                          ).toFixed(2)
                        : "0"}{" "}
                      {form.token || ""}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCreateDealClick}
                  disabled={loadingDeals || invalidForm()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {loadingDeals ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    "Create Deal"
                  )}
                </Button>

                {/* Modal */}
                <ConfirmationModal
                  isOpen={modalOpen}
                  onClose={() => setModalOpen(false)}
                  onConfirm={confirmCreateDeal}
                  recipient={pendingDeal.recipient}
                  amount={pendingDeal.amount}
                  token={pendingDeal.token}
                  description={pendingDeal.description}
                />
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
