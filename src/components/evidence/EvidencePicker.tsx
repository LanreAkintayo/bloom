"use client";

import React, { useEffect } from "react";
import { FileText } from "lucide-react";
import { bloomLog } from "@/lib/utils";

interface EvidencePickerProps {
  evidenceState: {
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    description: string;
    setDescription: (desc: string) => void;
    upload: {
      loading: boolean;
      error: any;
      data: any;
      progress: number | null;
    };
    setUpload: React.Dispatch<
      React.SetStateAction<{
        loading: boolean;
        error: any;
        data: any;
        progress: number | null;
      }>
    >;
    abortController: AbortController | null;
    setAbortController: any;
  };
  handleFileChange: any;
  cancelUpload: (() => void) | null;
}

const EvidencePicker: React.FC<EvidencePickerProps> = ({
  evidenceState,
  handleFileChange,
  cancelUpload,
}) => {
  const {
    selectedFile,
    setSelectedFile,
    description,
    setDescription,
    upload,
    setUpload,
    abortController,
    setAbortController,
  } = evidenceState;

  // clear error after 5 seconds
  useEffect(() => {
    if (upload.error) {
      const timer = setTimeout(() => {
        setUpload((prev) => ({
          ...prev,
          error: null,
        }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [upload.error, setUpload]);

  bloomLog(
    "IPFS URL: ",
    `https://amethyst-intimate-swallow-509.mypinata.cloud/ipfs/${upload.data?.cid}`
  );

  return (
    <div className="flex flex-col gap-4">
      <label className="relative border-2 border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer w-full h-48 overflow-hidden">
        {!selectedFile && !upload.data && (
          <p className="text-gray-400 text-center z-10 text-xs">
            Drag & drop your file here or click anywhere in this box. Video
            should be less 40MB. Image must be less than 10MB
          </p>
        )}
        <input type="file" onChange={handleFileChange} className="hidden" />

        {(selectedFile || upload.data?.cid) && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            {/* If upload finished, show from Pinata */}
            {upload.data?.cid ? (
              upload.data.mime_type.includes("image") ? (
                <img
                  src={`https://amethyst-intimate-swallow-509.mypinata.cloud/ipfs/${upload.data.cid}`}
                  alt="uploaded-preview"
                  className="object-contain max-h-full max-w-full"
                />
              ) : upload.data.mime_type.includes("video") ? (
                <video
                  controls
                  className="max-h-full max-w-full object-contain"
                >
                  <source
                    src={`https://amethyst-intimate-swallow-509.mypinata.cloud/ipfs/${upload.data.cid}`}
                    type={upload.data.mime_type}
                  />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center gap-2 text-gray-200">
                  <FileText className="w-6 h-6 text-red-500" />
                  {upload.data.name}
                </div>
              )
            ) : (
              <>
                {selectedFile?.type.includes("image") ? (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="preview"
                    className="object-contain max-h-full max-w-full"
                  />
                ) : selectedFile?.type.includes("video") ? (
                  <video
                    controls
                    className="max-h-full max-w-full object-contain"
                  >
                    <source
                      src={URL.createObjectURL(selectedFile)}
                      type={selectedFile.type}
                    />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex items-center gap-2 text-gray-200">
                    <FileText className="w-6 h-6 text-red-500" />
                    {selectedFile?.name}
                  </div>
                )}
              </>
            )}

            {/* Loading with progress */}
            {upload.loading && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 z-20">
                <div className="w-3/4 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 transition-all duration-300"
                    style={{ width: `${upload.progress || 0}%` }}
                  />
                </div>
                <p className="text-gray-200 text-sm">{upload.progress || 0}%</p>
                <button
                  onClick={(e) => {
                    bloomLog("This has been clicked;");
                    e.preventDefault();
                    if (abortController) {
                      abortController.abort();
                      setAbortController(null);
                      setSelectedFile(null);
                      setDescription("");
                      setUpload({
                        loading: false,
                        error: "",
                        data: null,
                        progress: null,
                      });
                    }
                  }}
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm"
                >
                  Cancel Upload
                </button>
              </div>
            )}

            {!upload.loading && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedFile(null);
                  setDescription("");
                  setUpload({
                    loading: false,
                    error: "",
                    data: null,
                    progress: null,
                  });
                }}
                className="absolute top-2 right-2 bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-600 z-10"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </label>

      {/* Error message */}
      {upload.error && <p className="text-red-300 text-xs">{upload.error}</p>}

      {/* Description input */}
      {(selectedFile || upload.data) && !upload.loading && (
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
            className="p-2 w-full rounded-md border border-gray-600 bg-slate-900 text-white text-sm min-h-[6rem] resize-none bg-slate-800 border border-slate-700 placeholder:text-white/50"
          />
        </div>
      )}
    </div>
  );
};

export default EvidencePicker;
