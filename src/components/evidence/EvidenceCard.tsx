"use-client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileAudio2Icon,
  FileText,
  Image as LucideImage,
  Play,
  Video,
  X,
} from "lucide-react";

import { Evidence, EvidenceType } from "@/types";
import { bloomLog, formatTime } from "@/lib/utils";

const fancyEvidenceName = (index: number, timestamp: string) => {
  const base = `${timestamp}-${index}`;
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
  bloomLog("Filetype: ", fileType);

  const getFileIcon = (type: string) => {
    // Icons are slightly larger for better visual impact
    const iconClass = "h-7 w-7";
    if (type === "DOCUMENT")
      return <FileText className={`${iconClass} text-red-500`} />;
    if (type === "IMAGE")
      return <LucideImage className={`${iconClass} text-yellow-400`} />;
    if (type === "VIDEO")
      return <Video className={`${iconClass} text-purple-500`} />;
    if (type === "AUDIO")
      return <FileAudio2Icon className={`${iconClass} text-green-500`} />;
  };

  return (
    <>
      {!evidence.removed && (
        <Card
          key={index}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 shadow-lg transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 py-0 mb-4"
        >
          {/* ... remove button ... */}
          {!isJurorView && (
            <button
              onClick={() => handleRemoveEvidence(index)}
              disabled={remove.loading}
              className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-slate-800/50 text-red-500 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:!bg-red-500/30 hover:!text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Preview Section (if applicable) */}
          {/* {(fileType === "IMAGE" || fileType === "VIDEO") && (
            <div
              className="relative cursor-pointer overflow-hidden"
              onClick={() => setIsOpen(true)}
            >
              <img
                src={fileURI}
                alt="preview"
                className="aspect-video w-full max-h-44 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              {fileType === "VIDEO" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white/70 drop-shadow-lg transition-transform group-hover:scale-110" />
                </div>
              )}
            </div>
          )} */}

          {/* Content Section with better padding and structure */}
          <CardContent className="flex flex-1 flex-col gap-4 pt-0 p-5">
            {/* ... rest of the card content is the same ... */}
            <div
              className="flex cursor-pointer items-center gap-4"
              onClick={() => setIsOpen(true)}
            >
              <div className="shrink-0">{getFileIcon(fileType)}</div>
              <h3 className="flex-1 truncate text-lg font-bold text-slate-100 transition-colors group-hover:text-emerald-400">
                {evidenceName}
              </h3>
            </div>

            <div className="space-y-1 border-l-2 border-slate-700 pl-4 text-xs text-slate-400">
              <p>
                <span className="font-semibold text-slate-300">File Type:</span>{" "}
                {fileType}
              </p>
              <p>
                <span className="font-semibold text-slate-300">Deal ID:</span>{" "}
                {evidence.dealId.toString()} {/* Added .toString() for bigint */}
              </p>
              <p>
                <span className="font-semibold text-slate-300">Uploaded:</span>{" "}
                {uploadDate}
              </p>
            </div>
            
            {evidence.description && (
              <div className="mt-auto pt-4">
                <blockquote className="border-l-2 border-emerald-500/40 bg-slate-800/50 p-3 text-slate-300 rounded-r-lg text-xs">
                  {evidence.description}
                </blockquote>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fullscreen Viewer (Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          {/* ... modal code is unchanged ... */}
          <button
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-600"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="h-full w-full max-w-4xl">
            {fileType === "IMAGE" ? (
              <img
                src={fileURI}
                alt="full-preview"
                className="h-full w-full rounded-lg object-contain"
              />
            ) : fileType === "VIDEO" ? (
              <video
                controls
                className="h-full w-full rounded-lg object-contain"
              >
                <source src={fileURI} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            ) : fileType === "AUDIO" ? (
              <audio controls className="w-full">
                <source src={fileURI} type="audio/mpeg" />
                Your browser does not support audio playback.
              </audio>
            ) : fileType === "DOCUMENT" ? (
              <iframe
                src={fileURI}
                title="document-preview"
                className="h-full w-full rounded-lg border border-slate-700"
              />
            ) : fileType === "TEXT" ? (
              <div className="max-h-[90vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-800 p-4 text-gray-200">
                Loading text...
              </div>
            ) : (
              <div className="text-gray-300">Unsupported file preview</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EvidenceCard;

// "use-client";
// import React, { useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   FileAudio2Icon,
//   FileText,
//   Image as LucideImage,
//   Play,
//   Video,
//   X,
// } from "lucide-react";

// import { Evidence, EvidenceType } from "@/types";
// import { bloomLog, formatTime } from "@/lib/utils";

// const fancyEvidenceName = (index: number, timestamp: string) => {
//   const base = `${timestamp}-${index}`;
//   const hash = btoa(base).toUpperCase();
//   return `Evidence-${hash.substring(hash.length - 7, hash.length - 1)}`;
// };

// interface EvidenceCardProps {
//   evidence: Evidence;
//   index: number;
//   isJurorView: boolean;
//   handleRemoveEvidence: any;
//   removalState: any;
// }

// const EvidenceCard: React.FC<EvidenceCardProps> = ({
//   evidence,
//   index,
//   isJurorView,
//   handleRemoveEvidence,
//   removalState,
// }) => {
//   const { remove } = removalState || {};
//   const fileType = EvidenceType[evidence.evidenceType];
//   const fileURI = `https://amethyst-intimate-swallow-509.mypinata.cloud/ipfs/${evidence.uri}`;
//   const uploadDate = formatTime(evidence.timestamp);
//   const evidenceName = fancyEvidenceName(index, evidence.timestamp.toString());

//   const [isOpen, setIsOpen] = useState(false);
//   bloomLog("Filetype: ", fileType);

//   const getFileIcon = (type: string) => {
//     if (type === "DOCUMENT")
//       return <FileText className="h-6 w-6 text-red-500" />;
//     if (type === "IMAGE")
//       return <LucideImage className="h-6 w-6 text-yellow-400" />;
//     if (type === "VIDEO") return <Video className="h-6 w-6 text-purple-500" />;
//     if (type === "AUDIO")
//       return <FileAudio2Icon className="h-6 w-6 text-purple-500" />;
//   };

//   return (
//     <>
//       {!evidence.removed && (
//         <Card
//           key={index}
//           className="transform rounded-2xl border border-emerald-500/20 bg-slate-900/95 p-4 shadow-md transition-transform hover:-translate-y-1 hover:shadow-sm hover:shadow-emerald-400/20"
//         >
//           <CardContent className="flex flex-col gap-4 p-0">
//             {/* Preview Section */}
//             {(fileType === "IMAGE" || fileType === "VIDEO") && (
//               <div
//                 className="relative cursor-pointer overflow-hidden rounded-xl"
//                 onClick={() => setIsOpen(true)}
//               >
//                 {fileType === "IMAGE" ? (
//                   <img
//                     src={fileURI}
//                     alt="preview"
//                     className="aspect-video w-full max-h-40 rounded-xl object-cover transition-transform hover:scale-105" // <-- CHANGE HERE
//                   />
//                 ) : (
//                   <div className="group flex aspect-video max-h-40 flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-sm text-gray-400 transition-all duration-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10"> {/* <-- CHANGE HERE */}
//                     <Play className="mb-2 h-8 w-8 text-emerald-500 transition-transform group-hover:scale-110" />
//                     <p>Click to view video</p>
//                   </div>
//                 )}
//                 {/* File Type Badge */}
//                 <span className="absolute left-2 top-2 rounded-full bg-slate-800/60 px-2 py-0.5 text-xs text-gray-200">
//                   {fileType}
//                 </span>
//               </div>
//             )}

//             {/* File Info Row */}
//             <div className="flex flex-wrap items-start justify-between gap-4">
//               <div className="flex min-w-0 flex-1 items-start gap-4">
//                 <div className="flex shrink-0 items-center justify-center rounded-xl bg-slate-800/70 p-3 shadow-inner">
//                   {getFileIcon(fileType)}
//                 </div>
//                 <div className="flex min-w-0 flex-col gap-1">
//                   <button
//                     onClick={() => setIsOpen(true)}
//                     className="truncate text-left text-lg font-semibold text-white hover:text-emerald-400 hover:underline"
//                   >
//                     {evidenceName}
//                   </button>
//                   <div className="mt-1 flex flex-wrap gap-2">
//                     <span className="rounded-full bg-slate-800/60 px-3 py-0.5 text-xs text-gray-200">
//                       Deal ID: {evidence.dealId}
//                     </span>
//                     <span className="rounded-full bg-yellow-600/40 px-3 py-0.5 text-xs text-gray-200">
//                       Uploaded: {uploadDate}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Remove Button */}
//               {!isJurorView && (
//                 <button
//                   onClick={() => handleRemoveEvidence(index)}
//                   disabled={remove.loading}
//                   className="flex shrink-0 items-center gap-1 rounded bg-slate-800/50 px-3 py-1 text-sm font-medium text-red-500 hover:bg-slate-700 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   <span>{remove.text}</span> <X className="h-4 w-4" />
//                 </button>
//               )}
//             </div>

//             {/* Description */}
//             {evidence.description && (
//               <div className="rounded-lg border-l-2 border-emerald-500/30 bg-slate-800/50 p-3 text-xs text-gray-300 transition-all duration-300 line-clamp-3 hover:line-clamp-none">
//                 {evidence.description}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       )}

//       {/* Fullscreen Viewer (Modal) */}
//       {isOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
//           <button
//             className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-600"
//             onClick={() => setIsOpen(false)}
//           >
//             <X className="h-5 w-5" />
//           </button>

//           <div className="h-full w-full max-w-4xl">
//             {fileType === "IMAGE" ? (
//               <img
//                 src={fileURI}
//                 alt="full-preview"
//                 className="h-full w-full rounded-lg object-contain"
//               />
//             ) : fileType === "VIDEO" ? (
//               <video controls className="h-full w-full rounded-lg object-contain">
//                 <source src={fileURI} type="video/mp4" />
//                 Your browser does not support video playback.
//               </video>
//             ) : fileType === "AUDIO" ? (
//               <audio controls className="w-full">
//                 <source src={fileURI} type="audio/mpeg" />
//                 Your browser does not support audio playback.
//               </audio>
//             ) : fileType === "DOCUMENT" ? (
//               <iframe
//                 src={fileURI}
//                 title="document-preview"
//                 className="h-full w-full rounded-lg border border-slate-700"
//               />
//             ) : fileType === "TEXT" ? (
//               <div className="max-h-[90vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-800 p-4 text-gray-200">
//                 {/* You would fetch and display text content here */}
//                 Loading text...
//               </div>
//             ) : (
//               <div className="text-gray-300">Unsupported file preview</div>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default EvidenceCard;
