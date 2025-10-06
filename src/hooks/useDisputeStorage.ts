import { useState, useEffect, use } from "react";
import { bloomLog, formatAddress, inCurrencyFormat } from "@/lib/utils";
import {
  SUPPORTED_CHAIN_ID,
  TOKEN_META,
  addressToToken,
  bloomEscrowAbi,
  disputeManagerAbi,
  disputeStorageAbi,
  feeControllerAbi,
  getChainConfig,
  IMAGES,
} from "@/constants";
import {
  readContract,
  readContracts,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { Address, erc20Abi, formatUnits, parseGwei, zeroAddress } from "viem";
import { config } from "@/lib/wagmi";
import {
  Candidate,
  Deal,
  Dispute,
  Juror,
  Token,
  TypeChainId,
  Vote,
  TokenPayment,
  Timer,
  StorageParams,
  ExtendedDispute,
  Evidence,
} from "@/types";

/**
 * Provides functions to read dispute-related data from the blockchain.
 * All functions are stateless and can be used anywhere in the app.
 */

const currentChain = getChainConfig("sepolia");
const chainId = SUPPORTED_CHAIN_ID as TypeChainId;
const disputeStorageAddress = currentChain.disputeStorageAddress as Address;

// -------------------------------
// Get deal
// -------------------------------
export const getDeal = async (dealId: string): Promise<Deal | null> => {
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

// -------------------------------
// Get evidence
// -------------------------------
export const getEvidence = async (
  dealId: string,
  userAddress: Address
): Promise<Evidence[] | null> => {
  bloomLog("Inside getEvidence");
  try {
    const evidence = (await readContract(config, {
      abi: disputeStorageAbi,
      address: disputeStorageAddress,
      functionName: "getDealEvidence",
      args: [dealId, userAddress],
      chainId,
    })) as Evidence[];

    return evidence;
  } catch (error) {
    console.error("Failed to load evidence :", error);

    return null;
  }
};

// -------------------------------
// Get dispute ID
// -------------------------------
export const getDisputeId = async (
  dealId: bigint | string
): Promise<bigint | null> => {
  try {
    const disputeId = (await readContract(config, {
      abi: disputeStorageAbi,
      address: disputeStorageAddress,
      functionName: "dealToDispute",
      args: [dealId],
      chainId,
    })) as bigint;

    return disputeId;
  } catch (error) {
    console.error("Failed to get dispute id:", error);
    return null;
  }
};
// -------------------------------
// Get dispute details
// -------------------------------
export const getDispute = async (
  disputeId: bigint
): Promise<(Dispute & { disputeId: bigint }) | null> => {
  try {
    const dispute = (await readContract(config, {
      abi: disputeStorageAbi,
      address: disputeStorageAddress,
      functionName: "getDispute",
      args: [disputeId],
      chainId,
    })) as Dispute;

    return { ...dispute, disputeId };
  } catch (error) {
    console.error("Failed to get dispute:", error);
    return null;
  }
};

export const getManyDisputes = async (
  disputeIds: bigint[]
): Promise<ExtendedDispute[]> => {
  const contracts = disputeIds.map((id) => ({
    abi: disputeStorageAbi,
    address: disputeStorageAddress,
    functionName: "getDispute",
    args: [id],
    chainId,
  }));

  const results = await readContracts(config, { contracts });

  return results.map((r, i) => ({
    disputeId: disputeIds[i],
    ...(r.result as Dispute),
  }));
};

// -------------------------------
// Get all juror addresses for a dispute
// -------------------------------
export const getJurorAddresses = async (
  disputeId: bigint
): Promise<Address[] | null> => {
  try {
    const jurorAddresses = (await readContract(config, {
      abi: disputeStorageAbi,
      address: disputeStorageAddress,
      functionName: "getDisputeJurors",
      args: [disputeId],
      chainId,
    })) as Address[];

    return jurorAddresses;
  } catch (error) {
    console.error("Failed to get juror addresses:", error);
    return null;
  }
};

// -------------------------------
// Get candidate details for a specific juror in a dispute
// -------------------------------
export const getJurorCandidate = async (
  disputeId: bigint,
  jurorAddress: Address
): Promise<Candidate | null> => {
  try {
    const jurorCandidate = (await readContract(config, {
      abi: disputeStorageAbi,
      address: disputeStorageAddress,
      functionName: "getDisputeCandidate",
      args: [disputeId, jurorAddress],
      chainId,
    })) as Candidate;

    return jurorCandidate;
  } catch (error) {
    console.error("Failed to get juror candidate:", error);
    return null;
  }
};

// -------------------------------
// Get candidate fee
// -------------------------------
export const getDisputeFee = async (amount: bigint): Promise<bigint | null> => {
  try {
    const feeControllerAddress = currentChain.feeControllerAddress as Address;

    const disputeFee = (await readContract(config, {
      abi: feeControllerAbi,
      address: feeControllerAddress,
      functionName: "calculateDisputeFee",
      args: [amount],
      chainId,
    })) as bigint;

    return disputeFee;
  } catch (error) {
    console.error("Failed to calculate dispute :", error);

    return null;
  }
};

// -------------------------------
// Get dispute Vote
// -------------------------------
export const getDisputeVote = async (
  disputeId: bigint,
  jurorAddress: Address
): Promise<Vote | null> => {
  try {
    const disputeVote = (await readContract(config, {
      abi: disputeStorageAbi,
      address: disputeStorageAddress,
      functionName: "getDisputeVote",
      args: [disputeId, jurorAddress],
      chainId,
    })) as Vote;

    return disputeVote;
  } catch (error) {
    console.error("Failed to get juror condidate :", error);
    return null;
  }
};
// -------------------------------
// Get dispute Vote
// -------------------------------
export const getJurorDisputeHistory = async (
  jurorAddress: Address
): Promise<bigint[] | null> => {
  try {
    const jurorDisputeHistory = (await readContract(config, {
      abi: disputeStorageAbi,
      address: disputeStorageAddress,
      functionName: "getJurorDisputeHistory",
      args: [jurorAddress],
      chainId,
    })) as bigint[];

    return jurorDisputeHistory;
  } catch (error) {
    console.error("Failed to get juror condidate :", error);
    return null;
  }
};

// -------------------------------
// Get juror
// -------------------------------
export const getJuror = async (
  jurorAddress: Address
): Promise<Juror | null> => {
  try {
    const juror = (await readContract(config, {
      abi: disputeStorageAbi,
      address: disputeStorageAddress,
      functionName: "getJuror",
      args: [jurorAddress],
      chainId,
    })) as Juror;

    return juror;
  } catch (error) {
    console.error("Failed to get juror condidate :", error);
    return null;
  }
};
// -------------------------------
// Get Juror Token Payment
// -------------------------------
export const getJurorTokenPayment = async (
  jurorAddress: Address,
  tokenAddress: Address
): Promise<bigint | null> => {
  try {
    const jurorTokenPayment = (await readContract(config, {
      abi: disputeStorageAbi,
      address: disputeStorageAddress,
      functionName: "getJurorTokenPayment",
      args: [jurorAddress, tokenAddress],
      chainId,
    })) as bigint;

    return jurorTokenPayment;
  } catch (error) {
    console.error("Failed to get juror token payment :", error);
    return null;
  }
};

export const getManyJurorPayments = async (
  juror: Address,
  tokenAddresses: string[]
): Promise<TokenPayment[]> => {
  const contracts = tokenAddresses.map((token) => ({
    abi: disputeStorageAbi,
    address: disputeStorageAddress,
    functionName: "getJurorTokenPayment",
    args: [juror, token],
    chainId,
  }));

  const results = await readContracts(config, { contracts });

  return results.map((r, i) => {
    const tokenAddress = tokenAddresses[i];
    const symbol = addressToToken[chainId]?.[tokenAddress.toLowerCase()];
    const tokenMeta = TOKEN_META[chainId][symbol];
    const image = IMAGES[symbol];

    return {
      ...tokenMeta,
      image,
      address: tokenAddress,
      payment: r.result as bigint,
    };
  });
};

export const getManyDisputeVote = async (
  disputeIds: bigint[],
  voter: Address
): Promise<Vote[]> => {
  if (!voter || !disputeIds?.length) return [];

  try {
    const contracts = disputeIds.map((disputeId) => ({
      address: disputeStorageAddress as Address,
      abi: disputeStorageAbi,
      functionName: "getDisputeVote",
      args: [disputeId, voter],
    }));

    const results = await readContracts(config, { contracts });

    return results.map((r, i) => ({
      ...(r.result as Vote), // This could be support or vote data depending on your contract
    }));
  } catch (error) {
    console.error("Error fetching many dispute votes:", error);
    return [];
  }
};

export const getDisputeTimer = async (
  disputeId: bigint
): Promise<Timer | null> => {
   try {
    const disputeTimer = (await readContract(config, {
      abi: disputeStorageAbi,
      address: disputeStorageAddress,
      functionName: "getDisputeTimer",
      args: [disputeId],
      chainId,
    })) as Timer;

    return disputeTimer;
  } catch (error) {
    console.error("Failed to get juror token payment :", error);
    return null;
  }
};

export const getManyDisputeTimer = async (
  disputeIds: bigint[]
): Promise<Timer[]> => {
  if (!disputeIds?.length) return [];

  try {
    const contracts = disputeIds.map((disputeId) => ({
      address: disputeStorageAddress as Address,
      abi: disputeStorageAbi,
      functionName: "getDisputeTimer",
      args: [disputeId],
    }));

    const results = await readContracts(config, { contracts });

    bloomLog("Inside many dispute timers: ", results);

    return results.map((r, i) => ({
      ...(r.result as Timer), // This could be support or vote data depending on your contract
    }));
  } catch (error) {
    console.error("Error fetching many dispute votes:", error);
    return [];
  }
};

export const getStorageParams = async (): Promise<StorageParams> => {
  try {
    const contracts = [
      {
        abi: disputeStorageAbi,
        address: disputeStorageAddress,
        functionName: "tieBreakingDuration",
      },
      {
        abi: disputeStorageAbi,
        address: disputeStorageAddress,
        functionName: "missedVoteThreshold",
      },
      {
        abi: disputeStorageAbi,
        address: disputeStorageAddress,
        functionName: "ongoingDisputeThreshold",
      },
    ];

    const results = await readContracts(config, { contracts });

    return {
      tieBreakingDuration: results[0].result as bigint,
      missedVoteThreshold: results[1].result as bigint,
      ongoingDisputeThreshold: results[2].result as bigint,
    };
  } catch (error) {
    console.error("Error fetching storage params:", error);
    return {
      tieBreakingDuration: BigInt(0),
      missedVoteThreshold: BigInt(0),
      ongoingDisputeThreshold: BigInt(0),
    };
  }
};
