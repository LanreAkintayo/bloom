"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, ChevronDown, ChevronUp, Coins } from "lucide-react";
import WalletCard from "@/components/escrow/WalletCard";

export default function RegisterJuror() {
  const [signerAddress, setSignerAddress] = useState("");
  const [stake, setStake] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(true);

  const dummyBalance = 1500; // dummy BLM balance

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      alert(
        `Successfully registered as juror with ${stake} BLM staked from address ${signerAddress}!`
      );
      setSignerAddress("");
      setStake("");
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel */}
      <div className="lg:col-span-1 space-y-6">
        <WalletCard />

        {/* Staked Info Card */}
        <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/80 to-slate-900 border border-emerald-500/30 shadow-lg hover:shadow-emerald-500/50 transition-transform transform hover:-translate-y-1 p-4">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-emerald-400 flex items-center gap-2">
                <Coins className="w-5 h-5 text-cyan-400" />
                Your Staked BLM
              </h3>
              <Button
                as="a"
                href="https://example.com/purchase-blm"
                target="_blank"
                className="bg-cyan-800 hover:bg-cyan-900 text-sm"
              >
                Purchase BLM
              </Button>
            </div>

            <div className="text-white text-2xl font-bold">
              {dummyBalance} BLM
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Register + Rules Card */}
        <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">
              Register as a Juror
            </h2>

            {/* Signer Address Input */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Signer Address
                </label>
                <Input
                  placeholder="Enter your wallet address"
                  value={signerAddress}
                  onChange={(e) => setSignerAddress(e.target.value)}
                  className="bg-slate-800 border border-slate-700 placeholder:text-white/50 text-white"
                />
              </div>

              {/* Stake Input with Purchase Button */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white mb-1">
                    Amount to Stake (BLM)
                  </label>
                  <Input
                    placeholder="Enter BLM amount"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="bg-slate-800 border border-slate-700 placeholder:text-white/50 text-white"
                  />
                </div>
                <Button
                  as="a"
                  href="https://example.com/purchase-blm"
                  target="_blank"
                  className="bg-cyan-800 hover:bg-cyan-900 mt-6"
                >
                  Purchase BLM
                </Button>
              </div>

              {/* Register Button */}
              {/* <div className="w-full flex items-center justify-center"> */}
              <Button
                onClick={handleRegister}
                disabled={loading || !stake || !signerAddress}
                className=" bg-emerald-600 hover:bg-emerald-700 w-full"
              >
                {loading ? "Registering..." : "Register as Juror"}
              </Button>
            </div>
            {/* </div> */}

            {/* Learn More / Rules Section */}
            <div className="mt-4 border-t border-slate-700 pt-4">
              <button
                onClick={() => setShowRules(!showRules)}
                className="flex items-center justify-between w-full text-white/80 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium">Rules and Guidelines</span>
                </div>
                {showRules ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  showRules ? "max-h-96 mt-3" : "max-h-0"
                }`}
              >
                <ul className="list-disc list-inside text-white/70 space-y-2 text-sm">
                  <li>You must stake BLM tokens to become a juror.</li>
                  <li>
                    The more BLM you stake, the higher your chance of being
                    selected.
                  </li>
                  <li>
                    Maintain a good reputation to continue getting deals
                    assigned.
                  </li>
                  <li>
                    Once registered, you can be called upon to review disputes
                    in the system.
                  </li>
                  <li>Unstaking is only allowed after a cooldown period.</li>
                </ul>

                <Button
                  as="a"
                  href="https://example.com/juror-docs"
                  target="_blank"
                  className="bg-slate-800 my-5 w-full border border-slate-700 "
                >
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
