"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Scale, BookOpen } from "lucide-react";

// Dummy deal data
const dummyDeals: Record<string, any> = {
  "123": {
    sender: "0xA1B2...C3D4",
    recipient: "0xE5F6...G7H8",
    token: "USDC",
    amount: 500,
    arbitrationFee: 20,
  },
  "456": {
    sender: "0xI9J0...K1L2",
    recipient: "0xM3N4...O5P6",
    token: "ETH",
    amount: 1.2,
    arbitrationFee: 0.05,
  },
};

export default function DisputePage() {
  const [dealId, setDealId] = useState("");
  const [dealData, setDealData] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleDealChange = (id: string) => {
    setDealId(id);
    if (dummyDeals[id]) {
      setDealData(dummyDeals[id]);
    } else {
      setDealData(null);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    // simulate blockchain approval delay
    setTimeout(() => {
      setApproved(true);
      setApproving(false);
    }, 1500);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6">
      <div className="my-10 text-center">
        <h1 className="text-3xl font-bold text-white">Dispute</h1>
        <p className="text-white/70 mt-1 text-sm">
          Open a dispute and get it reviewed by jurors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8">
        {/* Left Panel - Dispute Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-lg w-full">
            {/* <CardHeader /> */}
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between">
                  <h2 className="text-2xl font-bold text-emerald-400">
                    Open A Dispute
                  </h2>
                  {/* <div className="border-b border-slate-700 mt-2 mb-6"></div> */}
                  <Button
                    variant="outline"
                    className="w-48 bg-slate-800 border border-cyan-500/30 text-cyan-400 hover:bg-slate-700 flex items-center gap-2 lg:hidden"
                    onClick={() =>
                      document
                        .getElementById("how-it-works")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    How It Works -{">"}
                  </Button>
                </div>
                <div className="-mx-6 border-b border-emerald-500/30 mt-2 mt-5"></div>
              </div>

              {/* Deal ID Input */}
              <div className="space-y-2">
                <Label htmlFor="dealId" className="text-slate-300">
                  Deal ID
                </Label>
                <Input
                  id="dealId"
                  placeholder="Enter deal ID"
                  value={dealId}
                  onChange={(e) => handleDealChange(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Deal Details */}
              <div className="bg-slate-800 rounded-xl p-5 shadow-md border border-slate-700">
                <h3 className="text-white text-lg font-semibold mb-4">
                  Deal Details
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Sender", value: dealData?.sender },
                    { label: "Recipient", value: dealData?.recipient },
                    { label: "Token", value: dealData?.token },
                    { label: "Amount", value: dealData?.amount },
                    {
                      label: "Arbitration Fee",
                      value: dealData?.arbitrationFee,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">
                        {item.label}
                      </span>
                      <span className="text-white font-medium">
                        {item.value ?? (
                          <div className="w-24 h-4 bg-slate-700 rounded"></div>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispute Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">
                  Dispute Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue clearly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[120px]"
                />
              </div>

              {/* Approve + Submit Flow */}
              <div className="space-y-3">
                {!approved ? (
                  <Button
                    className="mx-auto flex justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md"
                    disabled={!dealData || !description || approving}
                    onClick={handleApprove}
                  >
                    {approving ? "Approving..." : "Approve Arbitration Fee"}
                  </Button>
                ) : (
                  <Button
                    className="mx-auto flex justify-center  bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md"
                    disabled={!dealData || !description || submitted}
                    onClick={handleSubmit}
                  >
                    {submitted ? "Submitting..." : "Submit Dispute"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - How Disputes Work */}
        <div id="how-it-works" className="lg:col-span-5 mx-auto lg:mx-0 my-8 lg:my-0">
          <Card className="bg-slate-900/95 border border-cyan-500/30 shadow-md">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white text-center mb-4">
                How Disputes Work
              </h2>
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-600 text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      1. Submit Your Dispute
                    </p>
                    <p className="text-white/60 text-sm">
                      Enter the deal ID, provide a description, and submit the
                      case.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">2. Jurors Review</p>
                    <p className="text-white/60 text-sm">
                      A panel of jurors is assigned to review your evidence and
                      claims.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-600 text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      3. Finalized in 48 Hours
                    </p>
                    <p className="text-white/60 text-sm">
                      A decision is reached within 48 hours and outcomes are
                      enforced.
                    </p>
                  </div>
                </div>
              </div>

              {/* Learn More Button */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="mx-auto w-48 bg-slate-800 border border-cyan-500/30 text-cyan-400 hover:bg-slate-700 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
