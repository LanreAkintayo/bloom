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
} from "@/constants";
import {
  readContract,
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
): Promise<Dispute | null> => {
  try {
    const dispute = (await readContract(config, {
      abi: disputeStorageAbi,
      address: disputeStorageAddress,
      functionName: "getDispute",
      args: [disputeId],
      chainId,
    })) as Dispute;

    return dispute;
  } catch (error) {
    console.error("Failed to get dispute:", error);
    return null;
  }
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
