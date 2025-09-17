import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Image as LucideImage, Video, X } from "lucide-react";

interface Evidence {
  id: number;
  fileName: string;
  fileType: "pdf" | "image" | "video";
  uploadDate: string;
  status: "Pending" | "Verified";
  description?: string;
  file?: File;
}

interface EvidenceCardProps {
  e: Evidence;
  index: number;
  setEvidenceList: React.Dispatch<React.SetStateAction<Evidence[]>>;
}

const EvidenceCard: React.FC<EvidenceCardProps> = ({
  e,
  index,
  setEvidenceList,
}) => {
  const getFileIcon = (type: string) => {
    if (type === "pdf") return <FileText className="w-6 h-6 text-red-500" />;
    if (type === "image")
      return <LucideImage className="w-6 h-6 text-yellow-400" />;
    if (type === "video") return <Video className="w-6 h-6 text-purple-500" />;
  };

  return (
    <Card
      key={e.id}
      className={`bg-slate-900/95 border ${
        e.status === "Verified" ? "border-cyan-500/50" : "border-emerald-500/20"
      } shadow-md hover:shadow-xl hover:shadow-emerald-400/20 transition-transform transform hover:-translate-y-1 p-4 rounded-2xl`}
    >
      <CardContent className="flex flex-col gap-3">
        {/* Preview */}
        {e.file && (
          <div className="relative rounded-xl overflow-hidden">
            {e.fileType === "image" ? (
              <img
                src={URL.createObjectURL(e.file)}
                alt={e.fileName}
                className="w-full max-h-40 object-cover rounded-xl transition-transform hover:scale-105"
              />
            ) : e.fileType === "video" ? (
              <video
                controls
                className="w-full max-h-40 object-cover rounded-xl"
              >
                <source src={URL.createObjectURL(e.file)} type={e.file.type} />
              </video>
            ) : null}

            {/* File type badge */}
            <span className="absolute top-2 left-2 bg-slate-800/60 text-xs text-gray-200 px-2 py-0.5 rounded-full">
              {e.fileType.toUpperCase()}
            </span>
          </div>
        )}

        {/* Top Row: Icon + Info + Remove Button */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-4">
            {/* File Icon */}
            <div className="p-3 bg-slate-800/70 rounded-xl flex items-center justify-center shadow-inner">
              {getFileIcon(e.fileType)}
            </div>

            {/* File Name + Metadata */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() =>
                  e.file && window.open(URL.createObjectURL(e.file), "_blank")
                }
                className="text-white font-semibold hover:text-emerald-400 hover:underline text-left text-lg truncate max-w-xs"
              >
                {`#Evidence${index + 1}`}
              </button>

              <div className="flex flex-wrap gap-2 mt-1">
                <span className="bg-slate-800/60 text-gray-200 text-xs px-3 py-0.5 rounded-full">
                  Deal ID: {e.id}
                </span>
                <span className="bg-yellow-600/40 text-gray-200 text-xs px-3 py-0.5 rounded-full">
                  Uploaded: {e.uploadDate}
                </span>
              </div>
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to remove this evidence?")) {
                setEvidenceList((prev) => prev.filter((ev) => ev.id !== e.id));
              }
            }}
            className="flex items-center gap-1 text-red-500 hover:text-red-400 bg-slate-800/50 hover:bg-slate-700 px-3 py-1 rounded text-sm font-medium"
            title="Remove Evidence"
          >
            Remove <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        {e.description && (
          <div className="bg-slate-800/50 rounded-lg p-2 text-gray-300 italic text-xs border-l-2 border-emerald-500/30 line-clamp-3 hover:line-clamp-none transition-all duration-300">
            {e.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvidenceCard;
