"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useAccount, useWatchContractEvent } from "wagmi";
import {
  ChainConfig,
  disputeManagerAbi,
  erc20Abi,
  getChainConfig,
  jurorManagerAbi,
} from "@/constants";
import { bloomLog } from "@/lib/utils";
import { Address } from "viem";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: any;
  currentChain: ChainConfig;
}

export default function DisputeModal({
  isOpen,
  onClose,
  token,
  currentChain,
}: DisputeModalProps) {
  const [step, setStep] = useState(0);
  const { address: signerAddress } = useAccount();

  useEffect(() => {
    if (!isOpen) setStep(0);
  }, [isOpen]);

  //   // Step 1: Approval
  //   useWatchContractEvent({
  //     address: token?.address,
  //     abi: erc20Abi,
  //     args: { owner: signerAddress, spender: currentChain.disputeManagerAddress },
  //     eventName: "Approval",
  //     onLogs(logs) {
  //       if (!isOpen) return; // only react when modal is open
  //       bloomLog("Approval event detected", logs);
  //       setStep(1);
  //     },
  //   });

  //   // Step 2: Dispute submission
  //   useWatchContractEvent({
  //     address: currentChain.disputeManagerAddress as Address,
  //     abi: disputeManagerAbi,
  //     args: { initiator: signerAddress },
  //     eventName: "DisputeOpened",
  //     onLogs(logs) {
  //       if (!isOpen) return;
  //       bloomLog("DisputeOpened event detected", logs);
  //       setStep(2);
  //     },
  //   });

  //   // Step 3: Random number request
  //   useWatchContractEvent({
  //     address: currentChain.jurorManagerAddress as Address,
  //     abi: jurorManagerAbi,
  //     eventName: "RequestSent",
  //     onLogs(logs) {
  //       if (!isOpen) return;
  //       bloomLog("Random number request event detected", logs);
  //       setStep(3);
  //     },
  //   });

  //   // Step 4: Juror selection
  //   useWatchContractEvent({
  //     address: currentChain.jurorManagerAddress as Address,
  //     abi: jurorManagerAbi,
  //     eventName: "JurorsSelected",
  //     onLogs(logs) {
  //       if (!isOpen) return;
  //       bloomLog("JurorsSelected event detected", logs);
  //       setStep(4);
  //       setStep(5);
  //     },
  //   });

  //   useEffect(() => {
  //     if (!isOpen) {
  //       setStep(0);
  //       return;
  //     }

  //     // Watchers for Step 1: Approval
  //     useWatchContractEvent({
  //       address: token.address,
  //       abi: erc20Abi,
  //       args: {
  //         owner: signerAddress,
  //         spender: currentChain.disputeManagerAddress,
  //       },
  //       eventName: "Approval",
  //       onLogs(logs) {
  //         setStep(1)
  //         bloomLog("New logs! USDC has been approved.", logs);
  //       },
  //     });

  //     // Watchers for Step 2: Submitting Dispute
  //      useWatchContractEvent({
  //       address: currentChain.disputeManagerAddress as Address,
  //       abi: disputeManagerAbi,
  //       args: {
  //         initiator: signerAddress,
  //       },
  //       eventName: "DisputeOpened",
  //       onLogs(logs) {
  //         setStep(2)
  //         bloomLog("Dispute has opened", logs);
  //       },
  //     });

  //     // Watchers for Step 3: Requesting Random Number
  //      useWatchContractEvent({
  //       address: currentChain.jurorManagerAddress as Address,
  //       abi: jurorManagerAbi,
  //       eventName: "RequestSent",
  //       onLogs(logs) {
  //         setStep(3)
  //         bloomLog("Request has been set", logs);
  //       },
  //     });

  //      // Watchers for Step 4: Selecting Jurors
  //      useWatchContractEvent({
  //       address: currentChain.jurorManagerAddress as Address,
  //       abi: jurorManagerAbi,
  //       eventName: "JurorsSelected",
  //       onLogs(logs) {
  //         setStep(4)
  //         bloomLog("Jurors have been selected. ", logs);
  //       },
  //     });

  //     const timers: NodeJS.Timeout[] = [];

  //     // timers.push(
  //     //   setTimeout(() => setStep(1), 2000), // Step 1 done
  //     //   setTimeout(() => setStep(2), 5000), // Step 2 done
  //     //   setTimeout(() => setStep(3), 8000), // Step 3 done
  //     //   setTimeout(() => setStep(4), 11000), // Step 4 done
  //     //   setTimeout(() => setStep(5), 11000) // Step 4 done
  //     // );

  //     return () => timers.forEach((t) => clearTimeout(t));
  //   }, [isOpen]);

  const steps = [
    {
      title: "Approving Arbitration Fee",
      descOngoing: "Waiting for approval confirmation...",
      descDone: "Approval confirmed",
    },
    {
      title: "Submitting Dispute",
      descOngoing: "Waiting for transaction confirmation...",
      descDone: "Transaction confirmed",
    },
    {
      title: "Requesting Random Numbers",
      descOngoing: "Generating randomness for juror selection...",
      descDone: "Random numbers received",
    },
    {
      title: "Selecting Jurors",
      descOngoing: "Selecting jurors...",
      descDone: "Jurors selected",
    },
    {
      title: "Dispute Active",
      descDone: "Your dispute is now active. Wait 48 hours for review.",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-400 text-center">
            Open Dispute
          </DialogTitle>
          <DialogDescription className="text-xs">
            Please waith for few seconds for your transaction to be processed
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 relative flex flex-col items-start pl-10">
          {/* Vertical line */}
          <div className="absolute left-[51px] -top-0 bottom-3 w-1  h-[370px] bg-slate-700 rounded">
            <div
              className="bg-emerald-500 w-1 rounded transition-all duration-500"
              style={{ height: `${(step / steps.length) * 100 + 8}%` }}
            ></div>
          </div>

          {steps.map((s, idx) => (
            <div key={idx} className="flex items-start mb-10 relative z-10">
              {/* Circle */}
              <div className="absolute left-0 top-0 w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 border-2 border-slate-700">
                {step > idx ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : step === idx ? (
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                ) : null}
              </div>

              {/* Step content */}
              <div className="ml-8">
                <div
                  className={`font-semibold ${
                    step > idx ? "text-emerald-500" : "text-white"
                  }`}
                >
                  {s.title}
                </div>
                <div className="text-white/60 text-xs mt-1">
                  {step > idx ? s.descDone : step === idx ? s.descOngoing : ""}
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex justify-end gap-3">
          {/* Only show when dispute is active */}
          {step === steps.length && (
            <Button
              variant="outline"
              className="bg-green-800 hover:bg-green-800/70 text-white hover:text-white"
              onClick={() => {
                // Navigate to the dispute page
                window.location.href = `/disputes/${/* disputeId */ ""}`;
              }}
            >
              View Dispute
            </Button>
          )}

          {/* Close button */}
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-red-800 hover:bg-red-800/70 text-white hover:text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
