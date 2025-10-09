// components/DisputeOutcomeCard.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ShieldX, Loader, Loader2 } from "lucide-react";
import React from "react";
import { Deal, Status } from "@/types";
import { bloomLog } from "@/lib/utils";

// 1. Define the interface for the component's props
interface DisputeOutcomeCardProps {
  isWinner: boolean;
  onClaimFunds: () => void;
  claimState?: any;
  deal: Deal;
}

// 2. Type the component with React.FC and the props interface
const DisputeOutcomeCard: React.FC<DisputeOutcomeCardProps> = ({
  isWinner,
  onClaimFunds,
  claimState,
  deal,
}) => {
  const { claim } = claimState || {};
  const status = Status[deal?.status];

  bloomLog("Status: ", status)
  const isResolved = status === "Resolved";
  return (
    <Card className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-center shadow-lg backdrop-blur-sm sm:p-8">
      {/* Dynamic Aurora Glow Effect */}
      <div
        className={`absolute -top-1/4 left-1/2 -z-10 h-1/2 w-full -translate-x-1/2 rounded-full ${
          isWinner ? "bg-emerald-500/15" : "bg-slate-700/20"
        } blur-3xl`}
      ></div>

      <div className="flex flex-col items-center gap-4">
        {isWinner ? (
          <>
            {/* --- WINNER'S VIEW --- */}
            <div className="rounded-full bg-emerald-500/10 p-4">
              <Trophy className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Verdict: In Your Favor
            </h2>
            <p className="max-w-sm text-xs text-slate-400">
              Congratulations! The jurors have concluded the review. You can now
              claim the funds from the deal.
            </p>
            <Button
              onClick={onClaimFunds}
              disabled={claim?.loading || isResolved}
              size="lg"
              className="mt-4 w-full max-w-xs bg-emerald-600 text-base font-semibold text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              {claim?.loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isResolved ? "Claimed" : claim.text}
            </Button>
          </>
        ) : (
          <>
            {/* --- LOSER'S VIEW --- */}
            <div className="rounded-full border border-slate-700 bg-slate-800 p-4">
              <ShieldX className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              The Dispute Has Concluded
            </h2>
            <p className="max-w-sm text-sm text-slate-400">
              The jurors have ruled in favor of the other party. The funds will
              be released to them accordingly.
            </p>
          </>
        )}
      </div>
    </Card>
  );
};

export default DisputeOutcomeCard;
