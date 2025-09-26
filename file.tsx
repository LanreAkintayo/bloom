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

import useDefi from "@/hooks/useDefi";
import { useAccount } from "wagmi";
import { bloomLog } from "@/lib/utils";
import { Address, isAddress } from "viem";
import { ChangeEvent } from "react";
import { Listbox, Transition } from "@headlessui/react";
import Image from "next/image";
import {
  bloomEscrowAbi,
  erc20Abi,
  getChainConfig,
  IMAGES,
  TOKEN_META,
} from "@/constants";
import { Token } from "@/types";
import { config } from "@/lib/wagmi";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import StatusModal from "@/components/escrow/StatusModal";
import { parseUnits } from "viem";
import { MAX_PERCENT } from "@/constants";

function formatWithCommas(value: string) {
  if (!value) return "";
  const parts = value.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

type TypeChainId = 1 | 11155111;

export default function EscrowPage() {
  const { allSupportedTokens, loadAllSupportedTokens } = useDefi();
  const { address: signerAddress } = useAccount();
  const escrowFeePercentage = 100; // 1% fee

  const currentChain = getChainConfig("sepolia");
  const bloomEscrowAddress = currentChain.bloomEscrowAddress as Address;

  const [escrowFee, setEscrowFee] = useState(0);
  const [totalFee, setTotalFee] = useState(0);

  useEffect(() => {
    const setUpTokens = async () => {
      await loadAllSupportedTokens();
    };
    setUpTokens();
  }, []);

  // bloomLog("All Supported Tokens: ", allSupportedTokens);

  const [loadingDeals, setLoadingDeals] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusType, setStatusType] = useState<"success" | "failure">(
    "success"
  );
  const [buttonMessage, setButtonMessage] = useState("Create Deal");

  const [errors, setErrors] = useState<{
    recipient?: string;
    amount?: string;
    description?: string;
  }>({});

  // This state stores the deal temporarily for confirmation
  const [pendingDeal, setPendingDeal] = useState({
    recipient: "",
    amount: "",
    token: "",
    description: "",
  });

  const approveByTransaction = async (
    amountToApprove: bigint,
    token: Token
  ) => {};

  const confirmCreateDeal = async () => {
    setLoadingDeals(true);
    setButtonMessage("Creating Deal ...");

    // THe logic here;
  };

  const invalidForm = () => {
    return (
      !form.recipient ||
      !form.amount ||
      !form.token ||
      !form.description ||
      Object.keys(errors).length > 0
    );
  };

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
      // bloomLog("Raw amount:", raw);
      const escrowFee = (escrowFeePercentage * Number(raw)) / MAX_PERCENT;

      setEscrowFee(escrowFee);
      setTotalFee(escrowFee + Number(raw));

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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg w-full max-w-4xl">
            <CardContent className="space-y-6">
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
                    Escrow Fee ({escrowFeePercentage / 100}%):{" "}
                    <span className="text-emerald-400">
                      {form.amount ? escrowFee.toFixed(2) : "0"}{" "}
                      {form.token || ""}
                    </span>
                  </div>
                  <div className="text-sm text-white/70">
                    Total Fee:{" "}
                    <span className="text-emerald-400">
                      {form.amount
                        ? (
                            escrowFee + Number(form.amount.replace(/,/g, ""))
                          ).toFixed(2)
                        : "0"}{" "}
                      {form.token || ""}
                    </span>
                  </div>
                </div>

                <Button>abcd</Button>

                {/* Modal */}
                <ConfirmationModal
                
                />

                <StatusModal
                  isOpen={statusModalOpen}
                  onClose={() => setStatusModalOpen(false)}
                  status={statusType}
                  message={
                    statusType == "success"
                      ? `You created a deal of ${pendingDeal.amount} ${pendingDeal.token}`
                      : `Unable to create deal. Please check your wallet and try again.`
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
