"use client";

import React from "react";
import { FileText, Image as LucideImage, Video } from "lucide-react";


interface EvidencePickerProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  description: string;
  setDescription: (desc: string) => void;
}

const EvidencePicker: React.FC<EvidencePickerProps> = ({
  selectedFile,
  setSelectedFile,
  description,
  setDescription,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files.length === 1 ? e.target.files[0] : null;
    setSelectedFile(file);
    if (e.target.files.length > 1) setDescription(""); // reset description
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drag & Drop / Clickable Box */}
      <label className="relative border-2 border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer w-full h-48 overflow-hidden">
        {!selectedFile && (
          <p className="text-gray-400 text-center z-10">
            Drag & drop your file here or click anywhere in this box
          </p>
        )}
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Preview inside box */}
        {selectedFile && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            {selectedFile.type.includes("image") ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="preview"
                className="object-contain max-h-full max-w-full"
              />
            ) : selectedFile.type.includes("video") ? (
              <video controls className="max-h-full max-w-full object-contain">
                <source
                  src={URL.createObjectURL(selectedFile)}
                  type={selectedFile.type}
                />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center gap-2 text-gray-200">
                <FileText className="w-6 h-6 text-red-500" />{" "}
                {selectedFile.name}
              </div>
            )}

            {/* Cancel button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setSelectedFile(null);
                setDescription("");
              }}
              className="absolute top-2 right-2 bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-600 z-10"
            >
              ✕
            </button>
          </div>
        )}
      </label>

      {/* Description input (only if 1 file selected) */}
      {selectedFile && (
        <div className="flex flex-col gap-1 mt-2">
          <label
            htmlFor="evidence-description"
            className="text-gray-300 text-sm font-medium"
          >
            Enter Description
          </label>
          <textarea
            id="evidence-description"
            placeholder="Add a description for this evidence"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 w-full rounded-md p-2  border border-gray-600 bg-slate-900 text-white text-sm min-h-[6rem] resize-none bg-slate-800 border border-slate-700 placeholder:text-white/50 text-white"
          />
        </div>
      )}
    </div>
  );
};

export default EvidencePicker;
