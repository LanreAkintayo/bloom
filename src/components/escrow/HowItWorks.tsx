import { ShieldCheck, Lock } from "lucide-react";
import { JSX } from "react";

/**
 * @returns {JSX.Element} A JSX element describing how Bloom Escrow works.
 */
export default function HowItWorks(): JSX.Element {
  return (
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
        <span className="font-semibold text-emerald-400">Escrow Fee:</span> 2%
        (paid by sender)
      </div>
    </div>
  );
}
