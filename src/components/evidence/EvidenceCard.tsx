"use-client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileAudio2Icon, FileText, Image as LucideImage, Video, X } from "lucide-react";

import { Evidence, EvidenceType } from "@/types";
import { bloomLog, formatTime } from "@/lib/utils";

// interface Evidence {
//   id: number;
//   fileName: string;
//   fileType: "pdf" | "image" | "video";
//   uploadDate: string;
//   status: "Pending" | "Verified";
//   description?: string;
//   file?: File;
// }

const fancyEvidenceName = (index: number, timestamp: string) => {
  // Combine timestamp and index into one string
  const base = `${timestamp}-${index}`;

  // Encode and shorten
  const hash = btoa(base).toUpperCase();

  return `Evidence-${hash.substring(hash.length - 7, hash.length - 1)}`;
};

interface EvidenceCardProps {
  evidence: Evidence;
  index: number;
  isJurorView: boolean;
  handleRemoveEvidence: any;
  removalState: any;
}

const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  index,
  isJurorView,
  handleRemoveEvidence,
  removalState,
}) => {
  const { remove } = removalState || {};
  const fileType = EvidenceType[evidence.evidenceType];
  const fileURI = `https://amethyst-intimate-swallow-509.mypinata.cloud/ipfs/${evidence.uri}`;
  const uploadDate = formatTime(evidence.timestamp);
  const evidenceName = fancyEvidenceName(index, evidence.timestamp.toString());

  const [isOpen, setIsOpen] = useState(false);
  bloomLog("Filetype: ", fileType)

  const getFileIcon = (type: string) => {
    if (type === "DOCUMENT")
      return <FileText className="w-6 h-6 text-red-500" />;
    if (type === "IMAGE")
      return <LucideImage className="w-6 h-6 text-yellow-400" />;
    if (type === "VIDEO") return <Video className="w-6 h-6 text-purple-500" />;
    if (type === "AUDIO") return <FileAudio2Icon className="w-6 h-6 text-purple-500" />;
  };

  return (
    <>
      {!evidence.removed && (
        <Card
          key={index}
          className="bg-slate-900/95 border border-emerald-500/20 shadow-md hover:shadow-sm hover:shadow-emerald-400/20 transition-transform transform hover:-translate-y-1 p-y-4 rounded-2xl"
        >
          <CardContent className="flex flex-col gap-3">
            {/* Preview */}
            <div
              className="relative rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              {fileType === "IMAGE" ? (
                <img
                  src={fileURI}
                  alt="preview"
                  className="w-full max-h-40 object-cover rounded-xl transition-transform hover:scale-105"
                />
              ) : fileType === "VIDEO" ? (
                <div className="bg-slate-800 flex items-center justify-center h-40 text-gray-400 text-sm">
                  Click to view video
                </div>
              ) : null}

              {/* File Type Badge */}
              <span className="absolute top-2 left-2 bg-slate-800/60 text-xs text-gray-200 px-2 py-0.5 rounded-full">
                {fileType}
              </span>
            </div>

            {/* File Info Row */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-800/70 rounded-xl flex items-center justify-center shadow-inner">
                  {getFileIcon(fileType)}
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setIsOpen(true)}
                    className="text-white font-semibold hover:text-emerald-400 hover:underline text-left text-lg truncate max-w-xs"
                  >
                    {evidenceName}
                  </button>

                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="bg-slate-800/60 text-gray-200 text-xs px-3 py-0.5 rounded-full">
                      Deal ID: {evidence.dealId}
                    </span>
                    <span className="bg-yellow-600/40 text-gray-200 text-xs px-3 py-0.5 rounded-full">
                      Uploaded: {uploadDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              {!isJurorView && (
                <button
                  onClick={() => handleRemoveEvidence(index)}
                  disabled={remove.loading}
                  className="flex items-center gap-1 text-red-500 hover:text-red-400 bg-slate-800/50 hover:bg-slate-700 px-3 py-1 rounded text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {remove.text} <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Description */}
            {evidence.description && (
              <div className="bg-slate-800/50 rounded-lg p-2 text-gray-300  text-xs border-l-2 border-emerald-500/30 line-clamp-3 hover:line-clamp-none transition-all duration-300">
                {evidence.description}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fullscreen Viewer */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>

          {fileType === "IMAGE" ? (
            <img
              src={fileURI}
              alt="full-preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : fileType === "VIDEO" ? (
            <video
              controls
              className="max-w-full max-h-full object-contain rounded-lg"
            >
              <source src={fileURI} type="video/mp4" />
              Your browser does not support video playback.
            </video>
          ) : fileType === "AUDIO" ? (
            <audio controls className="w-full mt-2">
              <source src={fileURI} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          ) : fileType === "DOCUMENT" ? (
            <iframe
              src={fileURI}
              title="document-preview"
              className="w-full h-full rounded-lg border border-slate-700"
            />
          ) : fileType === "TEXT" ? (
            <div className="bg-slate-800 p-4 rounded-lg text-gray-200 whitespace-pre-wrap overflow-y-auto max-h-96">
              {/* Fetch and render text file content */}
              Loading text...
            </div>
          ) : (
            <div className="text-gray-300">Unsupported file preview</div>
          )}
        </div>
      )}
    </>
  );
};

export default EvidenceCard;
