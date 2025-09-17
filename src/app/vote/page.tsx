"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User,
  FileText,
  Info,
  ArrowRight,
  Clock,
  Hash,
  Layers,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import EvidenceCard from "@/components/evidence/EvidenceCard";

export default function DisputeVotingPage() {
  const [selectedVote, setSelectedVote] = useState<string>("");

  const metaInfo = [
    {
      label: "Deal ID",
      value: "#D-29301",
      icon: Hash,
      color: "text-emerald-400",
    },
    {
      label: "Dispute ID",
      value: "#DS-9810",
      icon: Layers,
      color: "text-cyan-400",
    },
    {
      label: "Time Left",
      value: "2d 14h",
      icon: Clock,
      color: "text-amber-400 animate-pulse",
    },
  ];

  // Dummy parties
  const plaintiff = {
    name: "0xA1B2...C3D4",
    claim: "Buyer claims seller did not deliver the agreed NFT",
  };

  const defendant = {
    name: "0xE5F6...G7H8",
    defense: "Seller insists NFT was delivered as agreed",
  };

  // Dummy evidences
  const [evidenceList, setEvidenceList] = useState([
    {
      id: 1,
      fileName: "payment-proof.pdf",
      fileType: "pdf",
      uploadDate: "2025-09-15",
      status: "Verified",
      description:
        "Screenshot of transaction record showing payment made and this is not even the first time that they will be sending stuff like this. I tried my best to no to talk too much but it proved abortive. I would love if you find something to do about that. Thank you",
      submittedBy: "Plaintiff",
    },
    {
      id: 2,
      fileName: "delivery-proof.png",
      fileType: "image",
      uploadDate: "2025-09-15",
      status: "Pending",
      description: "Proof of delivery on-chain transaction link.",
      submittedBy: "Defendant",
    },
    {
      id: 3,
      fileName: "chat-logs.mp4",
      fileType: "video",
      uploadDate: "2025-09-16",
      status: "Verified",
      description: "Chat logs of conversation where seller promised delivery.",
      submittedBy: "Plaintiff",
    },
  ]);

  const handleSubmitVote = () => {
    if (!selectedVote) {
      alert("Please select an option before submitting.");
      return;
    }
    console.log("Vote submitted:", selectedVote);
    alert(`You voted: ${selectedVote}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6">
      {/* Header */}
      <div className="my-10 text-center">
        <h1 className="text-3xl font-bold text-white">Dispute #1023</h1>
        <p className="text-white/70 mt-1 text-sm">
          Review evidence and cast your vote.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Parties */}
        <div>
          <Card className="bg-slate-900/95 border border-slate-700 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {/* Meta Info Section */}
              <div className="bg-slate-800/80 border-b border-slate-700 px-5 py-6 grid grid-cols-2 gap-4 text-sm text-white/80 -mt-8">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  <span>
                    Deal ID:{" "}
                    <span className="font-semibold text-white">#D-29301</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>
                    Dispute ID:{" "}
                    <span className="font-semibold text-white">#DS-9810</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>
                    Time Left:{" "}
                    <span className="font-semibold text-white">2d 14h</span>
                  </span>
                </div>
              </div>

              {/* Parties Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                {/* Plaintiff */}
                <div className="p-5 border-r border-slate-700">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-400">
                    <User className="w-5 h-5" /> Plaintiff
                  </h3>
                  <p className="text-sm text-white/80 mt-2">{plaintiff.name}</p>
                  {/* <p className="text-sm text-white/60">{plaintiff.claim}</p> */}
                </div>

                {/* Defendant */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-cyan-400">
                    <User className="w-5 h-5" /> Defendant
                  </h3>
                  <p className="text-sm text-white/80 mt-2">{defendant.name}</p>
                  {/* <p className="text-sm text-white/60">{defendant.defense}</p> */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Evidence Tabs + Voting */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/95 border border-cyan-500/30 shadow-md rounded-2xl p-5 space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Submitted Evidence
            </h2>

            {/* Tabs Section */}
            <Tabs defaultValue="plaintiff" className="w-full ">
              <TabsList className="flex gap-3 w-full bg-transparent">
                <TabsTrigger
                  value="plaintiff"
                  className="data-[state=active]:bg-emerald-600/90 data-[state=active]:text-white 
               bg-slate-800/60 text-gray-300 rounded-md px-6 py-5 font-medium
               shadow hover:bg-slate-700/70 transition"
                >
                  Plaintiff
                </TabsTrigger>
                <TabsTrigger
                  value="defendant"
                  className="data-[state=active]:bg-cyan-600/90 data-[state=active]:text-white 
               bg-slate-800/60 text-gray-300 rounded-md px-6 py-5 font-medium
               shadow hover:bg-slate-700/70 transition"
                >
                  Defendant
                </TabsTrigger>
              </TabsList>

              {/* Plaintiff Evidence */}
              <TabsContent value="plaintiff" className="mt-4 grid gap-4">
                {evidenceList
                  .filter((e) => e.submittedBy === "Plaintiff")
                  .map((e, i) => (
                    <EvidenceCard
                      key={e.id}
                      e={e}
                      index={i}
                      setEvidenceList={setEvidenceList}
                      isJurorView={true}
                    />
                  ))}
              </TabsContent>

              {/* Defendant Evidence */}
              <TabsContent value="defendant" className="mt-4 grid gap-4">
                {evidenceList
                  .filter((e) => e.submittedBy === "Defendant")
                  .map((e, i) => (
                    <EvidenceCard
                      key={e.id}
                      e={e}
                      index={i}
                      setEvidenceList={setEvidenceList}
                      isJurorView={true}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Voting Section */}
          <Card className="bg-slate-900/95 border border-emerald-500/30 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="py-2 px-4 space-y-8">
              {/* Title */}
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-emerald-400 animate-pulse" />
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Cast Your Vote
                </h3>
              </div>

              {/* Voting Options */}
              <RadioGroup
                value={selectedVote}
                onValueChange={setSelectedVote}
                className="grid grid-cols-1 gap-4"
              >
                {[
                  {
                    value: "Plaintiff",
                    label: "In favor of Plaintiff",
                    color: "from-emerald-600 to-emerald-400",
                  },
                  {
                    value: "Defendant",
                    label: "In favor of Defendant",
                    color: "from-cyan-600 to-cyan-400",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    htmlFor={opt.value}
                    className={`relative cursor-pointer group`}
                  >
                    <input
                      type="radio"
                      id={opt.value}
                      value={opt.value}
                      checked={selectedVote === opt.value}
                      onChange={() => setSelectedVote(opt.value)}
                      className="peer hidden"
                    />
                    <div
                      className={`
              rounded-2xl p-3 flex items-center justify-between 
              bg-slate-800/70 border border-slate-700 
              group-hover:border-emerald-400/50 transition-all 
              shadow-md group-hover:shadow-xs group-hover:shadow-emerald-500/20 
              text-slate-400
              peer-checked:bg-gradient-to-r ${opt.color} 
              peer-checked:text-white
              peer-checked:shadow-sm peer-checked:shadow-emerald-500/30
            `}
                    >
                      <span className="text-base font-semibold tracking-wide">
                        {opt.label}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 transition-colors
                ${
                  selectedVote === opt.value
                    ? "bg-white border-white"
                    : "border-gray-400"
                }`}
                      ></div>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {/* Submit */}
              <div className="flex justify-center pt-4">
                <Button
                  disabled={!selectedVote}
                  className={`
      w-full shadow-sm px-8 py-4 rounded-2xl font-bold text-lg tracking-wide 
      flex items-center gap-2 transition-all 
      ${
        !selectedVote
          ? "bg-slate-700 text-gray-400 cursor-not-allowed"
          : selectedVote === "Plaintiff"
          ? "bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-700 hover:to-emerald-500 shadow-emerald-500/40"
          : "bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-700 hover:to-cyan-500 shadow-cyan-500/40"
      }
    `}
                  onClick={handleSubmitVote}
                >
                  {selectedVote ? "Submit Final Vote" : "Select a Side to Vote"}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
