"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

import {
  FileText,
  Image as LucideImage,
  Video,
  Lightbulb,
  UploadCloud,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  User,
  DollarSign,
  Loader2,
} from "lucide-react";
import EvidencePicker from "@/components/evidence/EvidencePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EvidenceCard from "@/components/evidence/EvidenceCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useAccount } from "wagmi";
import { Address, erc20Abi, formatUnits, parseGwei } from "viem";
import {
  SUPPORTED_CHAIN_ID,
  TOKEN_META,
  addressToToken,
  bloomEscrowAbi,
  disputeManagerAbi,
  disputeStorageAbi,
  feeControllerAbi,
  getChainConfig,
} from "@/constants";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@/lib/wagmi";
import { bloomLog, formatAddress, inCurrencyFormat } from "@/lib/utils";
import { Deal, EvidenceType, Token, TypeChainId, Evidence } from "@/types";
import { useModal } from "@/providers/ModalProvider";

const EvidencePage = () => {
  const { address: signerAddress } = useAccount();
  const currentChain = getChainConfig("sepolia");
  const disputeManagerAddress = currentChain.disputeManagerAddress as Address;
  const chainId = SUPPORTED_CHAIN_ID as TypeChainId;
  const { openModal, closeModal } = useModal();

  const [dealId, setDealId] = useState("");
  const [dealData, setDealData] = useState<any>(null);

  const [deal, setDeal] = useState<Deal | null>(null);
  const [token, setToken] = useState<any>(null);
  const [upload, setUpload] = useState<{
    loading: boolean;
    error: any;
    data: any;
    progress: number | null;
  }>({ loading: false, error: "", data: null, progress: null });
  
  const [submit, setSubmit] = useState<{
    loading: boolean;
    error: any;
    text: string;
  }>({ loading: false, error: "", text: "Submit Evidence" });

  const [remove, setRemove] = useState<{
    loading: boolean;
    error: any;
    text: string;
  }>({ loading: false, error: "", text: "Remove" });


  const [evidences, setEvidences] = useState<Evidence[] | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const evidenceRef = useRef<HTMLDivElement>(null);
  const [showRules, setShowRules] = useState(true);
  const [abortController, setAbortController] =
    React.useState<AbortController | null>(null);

  // bloomLog("Upload: ", upload);
  bloomLog("Evidences: ", evidences);

  const getDeal = async (dealId: string) => {
    try {
      const bloomEscrowAddress = currentChain.bloomEscrowAddress as Address;

      const deal = (await readContract(config, {
        abi: bloomEscrowAbi,
        address: bloomEscrowAddress,
        functionName: "getDeal",
        args: [dealId],
        chainId,
      })) as Deal;

      return deal;
    } catch (error) {
      console.error("Failed to load deal :", error);

      return null;
    }
  };

  const getEvidence = async (dealId: string) => {
    bloomLog("Inside getEvidence");
    try {
      const disputeStorageAddress =
        currentChain.disputeStorageAddress as Address;

      const evidence = (await readContract(config, {
        abi: disputeStorageAbi,
        address: disputeStorageAddress,
        functionName: "getDealEvidence",
        args: [dealId, signerAddress],
        chainId,
      })) as Evidence[];

      bloomLog("Evidence here: ", evidence);

      // setEvidences(evidences!);

      return evidence;
    } catch (error) {
      console.error("Failed to load evidence :", error);

      return null;
    }
  };

  useEffect(() => {
    if (!dealId) return;

    const fetchDealAndToken = async () => {
      // bloomLog("Getting deal");
      const deal = await getDeal(dealId);
      // bloomLog("Deal: ", deal);
      setDeal(deal);

      if (deal) {
        const tokenSymbol =
          addressToToken[chainId]?.[deal.tokenAddress.toLowerCase()];
        if (tokenSymbol) {
          const token = TOKEN_META[chainId][tokenSymbol];
          // bloomLog("Token: ", token);
          const newToken = {
            ...token,
            address: deal.tokenAddress.toLowerCase(),
          };
          setToken(newToken);
        } else {
          bloomLog("Token not found for address: ", deal.tokenAddress);
        }
      }
    };

    fetchDealAndToken();
  }, [dealId, chainId]);

  useEffect(() => {
    if (!dealId || !signerAddress) return;

    const fetchEvidence = async () => {
      bloomLog("Getting evidences");
      const evidences = await getEvidence(dealId);
      setEvidences(evidences!);
    };

    fetchEvidence();
  }, [dealId, signerAddress]);

  const handleDealChange = (id: string) => {
    setDealId(id);
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


  const mapMimeTypeToEvidenceType = (mime: string): EvidenceType => {
    if (!mime) return EvidenceType.DOCUMENT; // default fallback

    if (mime.startsWith("image/")) return EvidenceType.IMAGE;
    if (mime.startsWith("video/")) return EvidenceType.VIDEO;
    if (mime.startsWith("audio/")) return EvidenceType.AUDIO;

    // Handle text or document formats
    if (mime === "text/plain") return EvidenceType.TEXT;
    if (
      mime === "application/pdf" ||
      mime.startsWith("application/msword") ||
      mime.startsWith("application/vnd")
    ) {
      return EvidenceType.DOCUMENT;
    }

    // fallback if nothing matches
    return EvidenceType.DOCUMENT;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    // File size validation
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (isImage && file.size > 10 * 1024 * 1024) {
      // > 1MB
      setUpload({
        loading: false,
        error: "Image must be less than 1MB",
        data: null,
        progress: null,
      });
      return;
    }

    if (isVideo && file.size > 40 * 1024 * 1024) {
      // > 20MB
      setUpload({
        loading: false,
        error: "Video must be less than 20MB",
        data: null,
        progress: null,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("network", "public");

    bloomLog("We are here;");
    setSelectedFile(file);

    try {
      setUpload({ loading: true, error: "", data: null, progress: 0 });
      const controller = new AbortController();
      setAbortController(controller);

      const res = await axios.post(
        "https://uploads.pinata.cloud/v3/files",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUpload((prev) => ({ ...prev, progress: percent }));
            }
          },
          signal: controller.signal,
        }
      );

      setUpload({
        loading: false,
        error: "",
        data: res.data.data,
        progress: 100,
      });
    } catch (err: any) {
      // bloomLog("axios.isCancel(err): ", axios.isCancel(err));
      // bloomLog("err.name and err.code is", err.name, err.code);

      // if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
      if (axios.isCancel(err)) {
        setUpload({
          loading: false,
          error: "Upload cancelled",
          data: null,
          progress: null,
        });
      } else {
        setUpload({
          loading: false,
          error: err.message,
          data: null,
          progress: null,
        });
      }
      setSelectedFile(null);
    }
  };

  const addEvidenceTransaction = async (
    dealId: bigint | string,
    uri: string,
    evidenceType: EvidenceType,
    description: string
  ) => {
    try {
      const { request: addRequest } = await simulateContract(config, {
        abi: disputeManagerAbi,
        address: disputeManagerAddress as Address,
        functionName: "addEvidence",
        args: [dealId, uri, evidenceType, description],
        chainId: currentChain.chainId as TypeChainId,
      });

      const hash = await writeContract(config, addRequest);
      const receipt = await waitForTransactionReceipt(config, { hash });

      // return something meaningful
      return receipt;
    } catch (err) {
      // rethrow so handleAddEvidence can catch it
      throw err;
    }
  };

  const removeEvidenceTransaction = async (
    dealId: bigint | string,
    evidenceIndex: number
  ) => {
    try {
      const { request: removeRequest } = await simulateContract(config, {
        abi: disputeManagerAbi,
        address: disputeManagerAddress as Address,
        functionName: "removeEvidence",
        args: [dealId, evidenceIndex],
        chainId: currentChain.chainId as TypeChainId,
      });

      const hash = await writeContract(config, removeRequest);
      const receipt = await waitForTransactionReceipt(config, { hash });

      // return something meaningful
      return receipt;
    } catch (err) {
      // rethrow so handleAddEvidence can catch it
      throw err;
    }
  };

  const handleAddEvidence = () => {
    openModal({
      type: "confirm",
      title: "Submit Evidence",
      description: (
        <div className="space-y-2 text-[13px]">
          <p>You are about to submit an evidence.</p>
        </div>
      ),
      confirmText: "Yes, Submit",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        setSubmit({ loading: true, error: null, text: "Submitting..." });
        try {
          const validatedDealId = dealId;
          const validatedUri = upload.data?.cid;
          const mime = upload.data.mime_type;
          const validatedEvidenceType = mapMimeTypeToEvidenceType(mime);
          const validatedDescription = description;

          bloomLog("Validated Deal ID:", validatedDealId);
          bloomLog("Validated URI:", validatedUri);
          bloomLog("Validated Evidence Type:", validatedEvidenceType);
          bloomLog("Validated Description:", validatedDescription);

          const receipt = await addEvidenceTransaction(
            validatedDealId,
            validatedUri,
            validatedEvidenceType,
            validatedDescription
          );
          if (receipt.status == "success") {
            openModal({
              type: "success",
              title: "Submission Successful",
              description: (
                <div className="space-y-2 text-[13px]">
                  <p>You successfully submitted an evidence.</p>
                </div>
              ),
              confirmText: "Close",
            });
            const newEvidences = await getEvidence(dealId!);
            setEvidences(newEvidences!);
            // await loadUserWalletTokens(signerAddress!);
            setSubmit({
              loading: false,
              error: null,
              text: "Submit Evidence",
            });
          }
        } catch (err: any) {
          const errorMessage = (err as Error).message;

          bloomLog("Unexpected Error: ", err);
          openModal({
            type: "error",
            title: "Submission Failed",
            description: (
              <div className="space-y-2 text-[13px]">
                <p>{errorMessage}</p>
              </div>
            ),
            confirmText: "Close",
          });
          setSubmit({ loading: false, error: err, text: "Submit Evidence" });
        }
      },
    });
  };

  const handleRemoveEvidence = (evidenceIndex: number) => {
    bloomLog("Evidence Index: ", evidenceIndex);
    openModal({
      type: "confirm",
      title: "Remove Evidence",
      description: (
        <div className="space-y-2 text-[13px]">
          <p>You are about to remove an evidence.</p>
        </div>
      ),
      confirmText: "Yes, Remove",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        setRemove({ loading: true, error: null, text: "Removing..." });
        try {
          const validatedDealId = dealId;

          const receipt = await removeEvidenceTransaction(
            validatedDealId,
            evidenceIndex
          );
          if (receipt.status == "success") {
            openModal({
              type: "success",
              title: "Removeal Successful",
              description: (
                <div className="space-y-2 text-[13px]">
                  <p>You successfully removed an evidence.</p>
                </div>
              ),
              confirmText: "Close",
            });
            const newEvidences = await getEvidence(dealId!);
            setEvidences(newEvidences!);
            // await loadUserWalletTokens(signerAddress!);
            setRemove({
              loading: false,
              error: null,
              text: "Remove",
            });
          }
        } catch (err: any) {
          const errorMessage = (err as Error).message;

          bloomLog("Unexpected Error: ", err);
          openModal({
            type: "error",
            title: "Removal Failed",
            description: (
              <div className="space-y-2 text-[13px]">
                <p>{errorMessage}</p>
              </div>
            ),
            confirmText: "Close",
          });
          setRemove({ loading: false, error: err, text: "Remove" });
        }
      },
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Your Evidence</h1>
          <p className="text-gray-300 mb-6">
            Upload and manage your evidence for this dispute. Only you can see
            what you upload.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Panel - Upload Card */}
          <div className="flex-none md:w-6/12 space-y-6">
            <Card className="flex flex-col gap-4 p-4 bg-slate-900/95">
              {/* Header with mobile scroll button */}
              <div className="flex justify-between items-center mb-4">
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
              <div className="bg-slate-900/95 rounded-2xl p-5 shadow-md border border-slate-700">
                <h3 className="text-white text-lg font-semibold mb-4">
                  Deal Details
                </h3>

                {/* Deal ID */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-slate-700/50 text-gray-200 text-xs px-3 py-1 rounded-full">
                    Deal ID: {deal?.id ?? "—"}
                  </span>
                </div>

                {/* Metadata badges */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="bg-slate-700/50 text-gray-200 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <User className="w-3 h-3" /> Sender:{" "}
                    {deal?.sender ? formatAddress(deal.sender) : "-"}
                  </span>
                  <span className="bg-slate-700/50 text-gray-200 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <User className="w-3 h-3" /> Recipient:{" "}
                    {deal?.sender ? formatAddress(deal.sender) : "-"}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-semibold">
                    <DollarSign className="w-3 h-3" />
                    {deal?.amount
                      ? inCurrencyFormat(
                          formatUnits(deal.amount, token.decimal)
                        )
                      : "-"}{" "}
                    {token?.symbol}
                  </span>
                </div>

                {/* Optional description or notes */}
                {dealData?.notes && (
                  <div className="bg-slate-700/50 rounded-lg p-2 text-gray-300 text-sm italic">
                    {dealData.notes}
                  </div>
                )}
              </div>

              {/* EvidencePicker Component */}
              <div className="space-y-2">
                <Label htmlFor="dealId" className="text-slate-300">
                  Add Evidence
                </Label>
                {/* {upload.loading && (
                  <div className="text-white">
                    I a mcurrently loding at {upload!.progress}
                  </div>
                )} */}

                <EvidencePicker
                  evidenceState={{
                    selectedFile,
                    setSelectedFile,
                    description,
                    setDescription,
                    upload,
                    setUpload,
                    abortController,
                    setAbortController,
                  }}
                  handleFileChange={handleFileChange}
                />
              </div>

              {/* Submit button */}
              <Button
                onClick={handleAddEvidence}
                className="mx-auto flex bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition w-full cursor-pointer"
                disabled={submit.loading || !selectedFile || !upload.data}
              >
                {submit.loading && <Loader2 className="animate-spin mr-2" />}

                {submit.text}
              </Button>

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
                    onClick={() => {
                      bloomLog("Learn More");
                    }}
                    className="bg-slate-800 my-5 w-full border border-slate-700"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Evidence List */}

          <div className="w-full" ref={evidenceRef}>
            <Card className="flex flex-col gap-4 p-4 bg-slate-900/95 border border-slate-800/95">
              <h2 className="text-white text-xl font-semibold mb-4">
                Uploaded Evidences
              </h2>
              {evidences ? (
                <div className="grid gap-4">
                  {evidences.length === 0 ? (
                    <div className="bg-slate-800 p-6 rounded-2xl shadow-md text-center text-gray-400">
                      No evidence uploaded yet.
                    </div>
                  ) : (
                    evidences
                      .slice() // copy so you don't mutate
                      .reverse()
                      .slice(0, 2) // only take the first 2 after reversing
                      .map((currentEvidence, indexFromReversed) => {
                        const originalIndex =
                          evidences.length - 1 - indexFromReversed;
                        return (
                          <EvidenceCard
                            key={originalIndex}
                            evidence={currentEvidence}
                            index={originalIndex} // still original index
                            isJurorView={false}
                            handleRemoveEvidence={handleRemoveEvidence}
                            removalState={{ remove, setRemove }}
                          />
                        );
                      })
                  )}
                 {evidences.length > 2 &&(
                    <Button
                      variant="outline"
                      className="bg-green-900 hover:bg-green-800/70 text-white hover:text-white"
                      onClick={() => {
                        // Navigate to the dispute page
                        window.location.href = `/disputes/${
                          /* disputeId */ ""
                        }`;
                      }}
                    >
                      View All Evidences
                    </Button>
                 )}
                </div>
              ) : (
                <div className="bg-slate-800 p-6 rounded-2xl shadow-md text-center text-gray-400">
                  No evidence uploaded yet.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default EvidencePage;


