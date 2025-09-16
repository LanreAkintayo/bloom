"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Image as LucideImage,
  Video,
  Lightbulb,
  UploadCloud,
  ArrowDown,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import EvidencePicker from "@/components/evidence/EvidencePicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Evidence {
  id: number;
  fileName: string;
  fileType: "pdf" | "image" | "video";
  uploadDate: string;
  status: "Pending" | "Verified";
  description?: string;
}

const EvidencePage = () => {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([
    {
      id: 1,
      fileName: "contract.pdf",
      fileType: "pdf",
      uploadDate: "2025-09-16",
      status: "Pending",
      description: "Signed agreement",
    },
    {
      id: 2,
      fileName: "screenshot.png",
      fileType: "image",
      uploadDate: "2025-09-15",
      status: "Verified",
      description: "Proof of communication",
    },
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const evidenceRef = useRef<HTMLDivElement>(null);
  const [showRules, setShowRules] = useState(true);

  const handleUpload = () => {
    if (!selectedFile) return;

    const newEvidence: Evidence = {
      id: Date.now(),
      fileName: selectedFile.name,
      fileType: selectedFile.name.endsWith(".pdf")
        ? "pdf"
        : selectedFile.type.includes("image")
        ? "image"
        : "video",
      uploadDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      description: description || undefined,
    };

    setEvidenceList([newEvidence, ...evidenceList]);
    setSelectedFile(null);
    setDescription("");
  };

  const getFileIcon = (type: string) => {
    if (type === "pdf") return <FileText className="w-6 h-6 text-red-500" />;
    if (type === "image")
      return <LucideImage className="w-6 h-6 text-yellow-400" />;
    if (type === "video") return <Video className="w-6 h-6 text-purple-500" />;
  };

  const scrollToEvidence = () => {
    if (evidenceRef.current) {
      evidenceRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6">
      <h1 className="text-3xl font-bold text-white mb-2">Your Evidence</h1>
      <p className="text-gray-300 mb-6">
        Upload and manage your evidence for this dispute. Only you can see what
        you upload.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel - Upload Card */}
        <div className="flex-none md:w-1/3 space-y-6">
          <Card className="flex flex-col gap-4 p-4 bg-gray-900/95">
            {/* Header with mobile scroll button */}
            <div className="flex justify-between items-center">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <UploadCloud className="w-5 h-5" /> Upload Your Evidence
              </h2>
              {/* Mobile-only button */}
              <button
                onClick={scrollToEvidence}
                className="md:hidden bg-cyan-500 text-black px-3 py-1 rounded hover:bg-cyan-600 transition flex items-center gap-1 text-sm"
              >
                <ArrowDown className="w-4 h-4" /> View Evidence
              </button>
            </div>

            {/* EvidencePicker Component */}
            <EvidencePicker
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              description={description}
              setDescription={setDescription}
            />

            {/* Submit button */}
            <button
              onClick={handleUpload}
              className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition w-full"
              disabled={!selectedFile}
            >
              Submit Evidence
            </button>

            {/* Learn More / Tips & Guidelines Section */}
            <div className="mt-4 border-t border-slate-700 pt-4">
              <button
                onClick={() => setShowRules(!showRules)}
                className="flex items-center justify-between w-full text-white/80 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium">Tips and Guidelines</span>
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
                  <li>Allowed formats: PDF, JPG, PNG, MP4</li>
                  <li>Max file size: 20MB</li>
                  <li>Use clear file names</li>
                  <li>Provide a short description for clarity</li>
                </ul>

                <Button
                  target="_blank"
                  className="bg-slate-800 my-5 w-full border border-slate-700"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Evidence List */}
        <div className="flex-1" ref={evidenceRef}>
          {evidenceList.length === 0 ? (
            <div className="bg-slate-800 p-6 rounded-2xl shadow-md text-center text-gray-400">
              No evidence uploaded yet. Use the panel on the left to upload your
              evidence.
            </div>
          ) : (
            <ul className="space-y-4">
              {evidenceList.map((e) => (
                <li
                  key={e.id}
                  className="bg-gradient-to-r from-slate-800 via-slate-850 to-slate-800 p-4 rounded-2xl shadow-md flex flex-col gap-2 hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(e.fileType)}
                    <div>
                      <p className="font-semibold text-white">{e.fileName}</p>
                      <p className="text-sm text-gray-400">{e.uploadDate}</p>
                    </div>
                  </div>
                  {e.description && (
                    <p className="text-gray-300 text-sm italic">
                      {e.description}
                    </p>
                  )}
                  <span
                    className={`px-2 py-1 text-sm rounded-full w-max ${
                      e.status === "Verified"
                        ? "bg-cyan-500 text-black"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    {e.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidencePage;
