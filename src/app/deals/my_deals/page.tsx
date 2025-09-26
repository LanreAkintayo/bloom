"use client";

import React, {
  Fragment,
  useTransition,
  useRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
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
  LucideChartNoAxesColumnDecreasing,
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
  // --- Hooks & constants ---
  const { allSupportedTokens, userWalletTokens, creatorDeals, loadCreatorDeals } = useDefi();
  const { address: signerAddress } = useAccount();
  const escrowFeePercentage = 100; // 1% fee

  const currentChain = getChainConfig("sepolia");
  const bloomEscrowAddress = currentChain.bloomEscrowAddress as Address;

  // --- States ---
  const [escrowFee, setEscrowFee] = useState(0);
  const [totalFee, setTotalFee] = useState(0);

  const [form, setForm] = useState({
    recipient: "",
    amount: "",
    token: "",
    description: "",
  });

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

  const [pendingDeal, setPendingDeal] = useState({
    recipient: "",
    amount: "",
    token: "",
    description: "",
  });

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

  // --- Refs & transitions ---
  const rawAmountRef = useRef<string>("");
  const recipientTimerRef = useRef<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // --- Effects ---
  useEffect(() => {
    const getCreatorDeals = async (signerAddress: Address | undefined) => {
      if (!signerAddress) return;
      await loadCreatorDeals(signerAddress);
    };

    getCreatorDeals(signerAddress);
  }, [signerAddress]);

//   bloomLog("Creator deal: ", creatorDeals)

  // --- Memos ---
  const tokenOptions = useMemo(() => {
    if (!allSupportedTokens) return [];
    return allSupportedTokens.map((token: Token) => ({
      value: token.name === "WETH" ? "ETH" : token.name,
      image: token.name === "WETH" ? IMAGES.ETH : token.image,
      name: token.name === "WETH" ? "ETH" : token.name,
    }));
  }, [allSupportedTokens]);

  const TokenOptionsList = useMemo(
    () => (
      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-slate-800 border border-slate-700 text-white shadow-lg">
        {tokenOptions.map((t: any, idx: number) => (
          <Listbox.Option
            key={idx}
            value={t.value}
            className={({ active }) =>
              `relative cursor-pointer select-none py-2 pl-8 pr-4 ${
                active ? "bg-slate-700 text-white" : "text-gray-300"
              }`
            }
          >
            {({ selected }) => (
              <>
                <div className="flex items-center gap-2">
                  <Image src={t.image} alt={t.name} width={20} height={20} />
                  {t.name}
                </div>
                {selected && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-emerald-400">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </>
            )}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    ),
    [tokenOptions]
  );

  // --- Handlers (form) ---
  // amount handler designed for speed
  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const rawTyped = e.target.value;
      // allow only digits and dot
      const cleaned = rawTyped.replace(/,/g, "").replace(/[^0-9.]/g, "");
      // prevent more than one dot
      const validRaw =
        cleaned.split(".").length > 2 ? cleaned.slice(0, -1) : cleaned;

      rawAmountRef.current = validRaw;

      // update display quickly with raw value so typing is snappy
      setForm((prev) => ({ ...prev, amount: validRaw }));

      // compute validation and fee as low priority so they don't block typing
      startTransition(() => {
        const amountNum = Number(validRaw);
        if (!validRaw || isNaN(amountNum) || amountNum <= 0) {
          setErrors((prev) => ({ ...prev, amount: "Enter a valid amount" }));
          setEscrowFee(0);
          setTotalFee(0);
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.amount;
            return next;
          });
          const fee = (escrowFeePercentage * amountNum) / MAX_PERCENT;
          setEscrowFee(fee);
          setTotalFee(fee + amountNum);
        }
      });
    },
    [escrowFeePercentage]
  );

  // format amount for display when the user leaves the input
  const handleAmountBlur = useCallback(() => {
    const formatted = formatWithCommas(rawAmountRef.current);
    setForm((prev) => ({ ...prev, amount: formatted }));
  }, []);

  // recipient handler with debounce for address check
  const handleRecipientChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setForm((prev) => ({ ...prev, recipient: val }));

      if (recipientTimerRef.current) {
        window.clearTimeout(recipientTimerRef.current);
      }

      recipientTimerRef.current = window.setTimeout(() => {
        startTransition(() => {
          if (val && !isAddress(val.trim())) {
            setErrors((prev) => ({
              ...prev,
              recipient: "Invalid wallet address",
            }));
          } else {
            setErrors((prev) => {
              const next = { ...prev };
              delete next.recipient;
              return next;
            });
          }
        });
      }, 250);
    },
    []
  );

  // token select, small update so no heavy work needed
  const handleTokenSelect = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, token: value }));
  }, []);

  // generic handler for description and similar cheap fields
  const handleGenericChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      // if description change affects errors we can handle it here cheaply
      if (name === "description") {
        startTransition(() => {
          setErrors((prev) => {
            const next = { ...prev };
            if (!value) next.description = "Enter a description";
            else delete next.description;
            return next;
          });
        });
      }
    },
    []
  );

  // quick helper to decide if form is invalid
  const invalidForm = useCallback(() => {
    const raw = rawAmountRef.current;
    return (
      !form.recipient ||
      !raw ||
      !form.token ||
      !form.description ||
      Object.keys(errors).length > 0
    );
  }, [form, errors]);

  // --- Handlers (deal actions) ---
  const handleCreateDealClick = () => {
    // store current form in pendingDeal and open modal
    setPendingDeal({ ...form });
    setModalOpen(true);
  };

  // Handlers for DealCard actions
  const handleCancelDeal = (id: number) => {
    // setDeals(
    //   deals.map((d) => (d.id === id ? { ...d, status: "Disputed" } : d))
    // );
  };

  const handleReleaseDeal = (id: number) => {
    // setDeals(
    //   deals.map((d) => (d.id === id ? { ...d, status: "Completed" } : d))
    // );
  };

  const handleClaimDeal = (id: number) => {
    alert(`Claim action for deal ID: ${id}`);
  };

  // --- Handlers (contracts) ---
  const approveByTransaction = async (
    amountToApprove: bigint,
    token: Token
  ) => {
    let isSuccessful = true;

    setButtonMessage(`Approving ${token.symbol}...`);

    try {
      const { request: approveRequest } = await simulateContract(config, {
        abi: erc20Abi,
        address: token.address as Address,
        functionName: "approve",
        args: [bloomEscrowAddress, amountToApprove],
        chainId: currentChain.chainId as TypeChainId,
      });
      const hash = await writeContract(config, approveRequest);

      const approveReceipt = await waitForTransactionReceipt(config, {
        hash,
      });
      if (approveReceipt.status == "success") {
        bloomLog("Approved");
        setButtonMessage("Creating Deal...");
      }
    } catch (error) {
      bloomLog("Error creating deal: ", error);
      setButtonMessage("Create Deal");
      setStatusType("failure");
      setStatusModalOpen(true);
      setLoadingDeals(false);
      isSuccessful = false;
    } finally {
      return isSuccessful;
    }
  };

  const confirmCreateDeal = async () => {
    setLoadingDeals(true);
    setButtonMessage("Creating Deal ...");

    // Call create deal here;
    bloomLog("Creating Deal");

    // Let me check all the form values;
    bloomLog("Form values: ", form);

    const token: Token = allSupportedTokens?.find(
      (t: Token) => t.name === form.token
    ) as Token;

    const validatedSender = signerAddress;
    const validatedReceiver = form.recipient;
    const validatedTokenAddress = token.address;
    const totalAmount = Number(form.amount) + escrowFee;
    const validatedAmount = parseUnits(
      totalAmount.toString(),
      token.decimal
    ).toString();
    const validatedDealAmount = parseUnits(
      form.amount,
      token.decimal
    ).toString();

    const validatedDescription = form.description;
    let transactionReceipt;

    try {
      if (token.name == "WETH") {
        const { request: createDealRequest } = await simulateContract(config, {
          abi: bloomEscrowAbi,
          address: bloomEscrowAddress as Address,
          functionName: "createDeal",
          args: [
            validatedSender,
            validatedReceiver,
            validatedTokenAddress,
            validatedDealAmount,
            validatedDescription,
          ],
          chainId: currentChain.chainId as TypeChainId,
        });
        const hash = await writeContract(config, createDealRequest);

        transactionReceipt = await waitForTransactionReceipt(config, {
          hash,
        });
      } else {
        // Approve the token transfer first
        const isSuccess = await approveByTransaction(
          BigInt(validatedAmount),
          token
        );
        if (!isSuccess) return;

        // Then create deal
        const { request: createDealRequest } = await simulateContract(config, {
          abi: bloomEscrowAbi,
          address: bloomEscrowAddress as Address,
          functionName: "createDeal",
          args: [
            validatedSender,
            validatedReceiver,
            validatedTokenAddress,
            validatedDealAmount,
            validatedDescription,
          ],
          chainId: currentChain.chainId as TypeChainId,
        });
        const hash = await writeContract(config, createDealRequest);

        transactionReceipt = await waitForTransactionReceipt(config, {
          hash,
        });
      }

      if (transactionReceipt.status === "success") {
        bloomLog("Deal created successfully!");
        setButtonMessage("Create Deal");
        setStatusType("success");
        setStatusModalOpen(true);
        setLoadingDeals(false);
      }
    } catch (error) {
      bloomLog("Error creating deal: ", error);
      setButtonMessage("Create Deal");

      setStatusType("failure");
      setStatusModalOpen(true);
      setLoadingDeals(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6">
        <div className="space-y-6 mx-auto flex justify-center">
          <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg w-full max-w-4xl">
            <CardContent className="space-y-6">
              {/* Header + How It Works Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-emerald-400">
                  All Deals
                </h2>
              </div>

              {/* Your Deals */}
              <div>
                <h2 className="text-xl font-bold text-cyan-400 mt-4 mb-2">
                  Your Deals
                </h2>
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <DealCard
                      currentUser={"sender"}
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
    </>
  );
}
