"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowRight, Timer as TimerIcon, Coins, Swords } from "lucide-react";
import {
  ExtendedDispute,
  StorageParams,
  Timer,
  TypeChainId,
  Vote,
} from "@/types";
import { useAccount } from "wagmi";
import { formatUnits, zeroAddress } from "viem";
import { SUPPORTED_CHAIN_ID, TOKEN_META, addressToToken } from "@/constants";
import {
  bloomLog,
  formatAddress,
  formatCountdown,
  inCurrencyFormat,
} from "@/lib/utils";
import Link from "next/link";

interface DisputeCardProps {
  dispute: ExtendedDispute;
  disputeVote: Vote;
  disputeTimer: Timer;
  storageParams: StorageParams;
}

export default function DisputeCard({
  dispute,
  disputeVote,
  disputeTimer,
}: DisputeCardProps) {
  // --- All of your existing logic remains untouched ---
  const { address: signerAddress } = useAccount();
  const chainId = SUPPORTED_CHAIN_ID as TypeChainId;
  const tokenSymbol =
    addressToToken[chainId][dispute.feeTokenAddress.toLowerCase()];
  const tokenMeta = TOKEN_META[chainId][tokenSymbol];
  const disputeId = dispute.disputeId.toString();
  const isActive = dispute.winner === zeroAddress;
  const hasWon = disputeVote?.support === dispute.winner;
  const against =
    dispute.initiator === dispute.sender ? dispute.receiver : dispute.sender;
  const disputeFee = tokenMeta
    ? inCurrencyFormat(formatUnits(dispute.disputeFee, tokenMeta.decimal))
    : 0;
  const endTime = useMemo(() => {
    return (
      (Number(disputeTimer?.startTime ?? 0) +
        Number(disputeTimer?.standardVotingDuration ?? 0) +
        Number(disputeTimer?.extendDuration ?? 0)) *
      1000
    );
  }, [disputeTimer]);
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(endTime - Date.now(), 0)
  );
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        const next = endTime - Date.now();
        return next > 0 ? next : 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, isActive]);
  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMinutes = remainingHours * 60;
  const getStatusColor = (minutes: number) => {
    if (minutes <= remainingMinutes * (1 / 3))
      return { textColor: "text-red-400", bgColor: "bg-red-500/10" };
    if (minutes <= remainingMinutes * (2 / 3))
      return { textColor: "text-yellow-400", bgColor: "bg-yellow-500/10" };
    return { textColor: "text-emerald-400", bgColor: "bg-emerald-500/10" };
  };
  const timeLeftColors = getStatusColor(remainingMinutes);

  return (
    // --- THE MAGIC STARTS HERE: Complete JSX Overhaul ---
    <Card className="relative w-full  overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-sm py-0">
      
      {/* Dynamic Aurora Glow */}
      {/* <div className={`absolute -top-1/2 left-1/2 -z-10 h-[200%] w-[200%] -translate-x-1/2 rounded-full ${isActive ? 'bg-cyan-900/15' : hasWon ? 'bg-emerald-500/15' : 'bg-red-500/15'} blur-3xl`}></div> */}

      {/* 1. Unified Header */}
      <CardHeader className="flex-row items-center justify-between border-b border-white/10 p-4">
        <h4 className="font-bold text-white text-lg">Dispute #{disputeId}</h4>
        {isActive ? (
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            Active
          </span>
        ) : (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${hasWon ? "bg-emerald-600" : "bg-red-600"}`}>
            {hasWon ? "Won" : "Lost"}
          </span>
        )}
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* 2. Description (optional) */}
        {dispute.description && (
          <p className="text-sm text-slate-400 line-clamp-2">{dispute.description}</p>
        )}

        {/* 3. Visual 'Face-Off' for Parties */}
        <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/50 p-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <User className="h-4 w-4 shrink-0 text-cyan-400" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Initiator</p>
              <p className="truncate font-mono text-sm text-white">{formatAddress(dispute.initiator)}</p>
            </div>
          </div>
          <Swords className="h-5 w-5 shrink-0 text-slate-600" />
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Against</p>
              <p className="truncate font-mono text-sm text-white">{formatAddress(against)}</p>
            </div>
            <User className="h-4 w-4 shrink-0 text-slate-400" />
          </div>
        </div>

        {/* 4. Scannable Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-start gap-3">
            <TimerIcon className="h-5 w-5 shrink-0 text-slate-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">Time Left</p>
              {isActive ? (
                <p className={`font-semibold ${timeLeftColors.textColor}`}>{formatCountdown(remainingMs)}</p>
              ) : (
                <p className="font-semibold text-slate-500">Ended</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Coins className="h-5 w-5 shrink-0 text-slate-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">Dispute Fee</p>
              <p className="font-semibold text-white">{disputeFee} {tokenSymbol}</p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* 5. Focused Call-to-Action */}
      <CardFooter className="border-t border-white/10 bg-black/20 p-4">
        <Link href={isActive ? `/vote/${dispute.dealId}` : `/dispute/${dispute.dealId}`} className="w-full">
          <Button
            className={`w-full font-semibold text-white shadow-lg transition-all
              ${isActive
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10 hover:shadow-emerald-500/20"
                : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/10 hover:shadow-cyan-500/20"
              }`}
            disabled={isActive && disputeVote?.jurorAddress === signerAddress}
          >
            {isActive ? (
              disputeVote?.jurorAddress === signerAddress ? "Already Voted" : (
                <>
                  Vote Now <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )
            ) : "View Details"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}


// import React, { useEffect, useMemo, useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { User, ArrowRight } from "lucide-react";
// import {
//   ExtendedDispute,
//   StorageParams,
//   Timer,
//   TypeChainId,
//   Vote,
// } from "@/types";
// import { useAccount } from "wagmi";
// import { formatUnits, zeroAddress } from "viem";
// import { SUPPORTED_CHAIN_ID, TOKEN_META, addressToToken } from "@/constants";
// import {
//   bloomLog,
//   formatAddress,
//   formatCountdown,
//   inCurrencyFormat,
// } from "@/lib/utils";
// import Link from "next/link";

// interface DisputeCardProps {
//   dispute: ExtendedDispute;
//   disputeVote: Vote;
//   disputeTimer: Timer;
//   storageParams: StorageParams;
// }

// export default function DisputeCard({
//   dispute,
//   disputeVote,
//   disputeTimer,
// }: DisputeCardProps) {
//   const { address: signerAddress } = useAccount();
//   const chainId = SUPPORTED_CHAIN_ID as TypeChainId;

//   const tokenSymbol =
//     addressToToken[chainId][dispute.feeTokenAddress.toLowerCase()];
//   const tokenMeta = TOKEN_META[chainId][tokenSymbol];

//   const disputeId = dispute.disputeId.toString();
//   const isActive = dispute.winner === zeroAddress;
//   const hasWon = disputeVote?.support === dispute.winner;
//   const against =
//     dispute.initiator === dispute.sender ? dispute.receiver : dispute.sender;

//   const disputeFee = tokenMeta
//     ? inCurrencyFormat(formatUnits(dispute.disputeFee, tokenMeta.decimal))
//     : 0;

//   // Calculate end time
//   const endTime = useMemo(() => {
//     return (
//       (Number(disputeTimer?.startTime ?? 0) +
//         Number(disputeTimer?.standardVotingDuration ?? 0) +
//         Number(disputeTimer?.extendDuration ?? 0)) *
//       1000
//     );
//   }, [disputeTimer]);

//   // Countdown state
//   const [remainingMs, setRemainingMs] = useState(() =>
//     Math.max(endTime - Date.now(), 0)
//   );

//   useEffect(() => {
//     if (!isActive) return;

//     const interval = setInterval(() => {
//       setRemainingMs((prev) => {
//         const next = endTime - Date.now();
//         return next > 0 ? next : 0;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [endTime, isActive]);

//   const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
//   const remainingMinutes = remainingHours * 60;

//   const getStatusColor = (minutes: number) => {
//     if (minutes <= remainingMinutes * (1 / 3))
//       return { stripe: "bg-red-500", badge: "bg-red-500/30 text-red-500" };
//     if (minutes <= remainingMinutes * (2 / 3))
//       return {
//         stripe: "bg-yellow-400",
//         badge: "bg-yellow-400/30 text-yellow-400",
//       };
//     return { stripe: "bg-green-500", badge: "bg-green-500/30 text-green-500" };
//   };

//   const { stripe, badge } = getStatusColor(remainingMinutes);

//   // bloomLog("Disptue vote: ", disputeVote);

//   return (
//     <Card className="bg-slate-900/95 border border-cyan-500/30 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
//       {/* Status Stripe */}
//       <span
//         className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${stripe}`}
//       />

//       {/* Badge */}
//       {isActive ? (
//         <span className="absolute top-4 right-4 bg-cyan-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
//           Active
//         </span>
//       ) : (
//         <span
//           className={`absolute top-4 right-4 ${
//             hasWon ? "bg-emerald-600" : "bg-red-600"
//           } text-white text-xs px-2 py-1 rounded-full font-semibold`}
//         >
//           {hasWon ? "Won" : "Lost"}
//         </span>
//       )}

//       {/* Dispute Info */}
//       <div className="flex-1 space-y-3">
//         <h4 className="font-semibold text-white text-lg">
//           Dispute #{disputeId}
//         </h4>

//         <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-white/80">
//           <span className="flex items-center gap-1">
//             <User className="w-4 h-4 text-cyan-400" />
//             <span className="font-medium">
//               Initiator: {formatAddress(dispute.initiator)}
//             </span>
//           </span>
//           <span className="flex items-center gap-1">
//             <User className="w-4 h-4 text-emerald-400" />
//             <span className="font-medium">
//               Against: {formatAddress(against)}
//             </span>
//           </span>
//         </div>

//         <p className="text-white/70 text-sm line-clamp-2">
//           {dispute.description}
//         </p>

//         <div className="flex items-center gap-3 text-sm">
//           {isActive ? (
//             <>
//               <span className="text-white/80">Time Left:</span>
//               <span
//                 className={`px-2 py-1 rounded-full text-xs font-semibold ${badge}`}
//               >
//                 {formatCountdown(remainingMs)}
//               </span>
//             </>
//           ) : (
//             <>
//               <span className="text-white/80">Voting:</span>
//               <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-500/30 text-slate-300">
//                 Ended
//               </span>
//             </>
//           )}
//         </div>

//         <div className="flex items-center gap-3 text-sm">
//           <span className="text-white/80">Fee Paid:</span>
//           <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-500/30 text-slate-300">
//             {disputeFee} {tokenSymbol}
//           </span>
//         </div>
//       </div>

//       {/* Action */}
//       <div className="flex items-center md:justify-end mt-3 md:mt-0">
//         {isActive ? (
//           <Link href={`/vote/${dispute.dealId}`}>
//             <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all px-6 py-3 rounded-2xl font-semibold flex items-center gap-2">
//               {disputeVote?.jurorAddress === signerAddress ? (
//                 "Already Voted"
//               ) : (
//                 <>
//                   Vote Now <ArrowRight className="w-4 h-4" />
//                 </>
//               )}
//               {/* Vote Now <ArrowRight className="w-4 h-4" /> */}
//             </Button>
//           </Link>
//         ) : (
//           <Button className="bg-cyan-600 hover:bg-cyan-700 shadow-lg hover:shadow-xl transition-all px-6 py-3 rounded-2xl font-semibold flex items-center gap-2">
//             View Details
//           </Button>
//         )}
//       </div>
//     </Card>
//   );
// }
