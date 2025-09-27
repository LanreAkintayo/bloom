import React, { useReducer } from "react";
import { Address } from "viem";
import { Token, WalletToken } from "@/types";
import DefiContext from "./defi-context";
import {
  bloomEscrowAbi,
  erc20Abi,
  IMAGES,
  SUPPORTED_CHAIN_ID,
  supportedTokens,
  TOKEN_META,
} from "@/constants";
import { config } from "@/lib/wagmi";
import { readContract, readContracts } from "@wagmi/core";
import { bloomLog } from "@/lib/utils";
import { getChainConfig } from "../constants";
import { AlignVerticalDistributeCenter } from "lucide-react";

type ChainIdType = 11155111;

const defaultDefiState = {
  userWalletTokens: null,
  allSupportedTokens: null,
  recipientDeals: null,
  creatorDeals: null,
};

const defiReducer = (
  state: any,
  action: {
    type: string;
    userWalletTokens?: WalletToken[];
    allSupportedTokens?: Token[];
    recipientDeals?: any[];
    creatorDeals?: any[];
  }
) => {
  if (action.type === "USER_WALLET_TOKENS") {
    return {
      ...state,
      userWalletTokens: action.userWalletTokens,
    };
  }
  if (action.type === "ALL_SUPPORTED_TOKENS") {
    return {
      ...state,
      allSupportedTokens: action.allSupportedTokens,
    };
  }
  if (action.type === "RECIPIENT_DEALS") {
    return {
      ...state,
      recipientDeals: action.recipientDeals,
    };
  }
  if (action.type === "CREATOR_DEALS") {
    return {
      ...state,
      creatorDeals: action.creatorDeals,
    };
  }

  return defaultDefiState;
};

const DefiProvider = (props: any) => {
  const [defiState, dispatchDefiAction] = useReducer(
    defiReducer,
    defaultDefiState
  );
  const currentChain = getChainConfig("sepolia");

  const loadUserWalletTokensHandler = async (
    signerAddress: string
  ): Promise<WalletToken[]> => {
    // bloomLog("Inside loadUserWalletTokensHandler");
    try {
      const chainId = SUPPORTED_CHAIN_ID as ChainIdType;
      const supportedTokens = currentChain.supportedTokens;

      const tokens = supportedTokens.flatMap((_token) => {
        const tokenAddress = currentChain.tokenAddresses[_token] as Address;
        return [
          {
            chainId,
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [signerAddress],
          },
        ];
      });

      // Execute all reads
      const erc20Results = await readContracts(config, { contracts: tokens });
      // bloomLog("Raw ERC20 Results:", erc20Results);

      // Rebuild into WalletToken[]
      const walletTokens: WalletToken[] = supportedTokens.map((_symbol, i) => {
        const tokenMeta = TOKEN_META[chainId][_symbol];
        return {
          ...tokenMeta,
          balance: BigInt(erc20Results[i].result as string),
          image: IMAGES[_symbol],
          address: currentChain.tokenAddresses[_symbol],
        };
      });

      // bloomLog("Wallet Tokens: ", walletTokens);

      dispatchDefiAction({
        type: "USER_WALLET_TOKENS",
        userWalletTokens: walletTokens,
      });
      return walletTokens;
    } catch (error) {
      console.error("Failed to load user wallet tokens:", error);
      dispatchDefiAction({ type: "USER_WALLET_TOKENS", userWalletTokens: [] });
      return [];
    }
  };

  const loadAllSupportedTokensHandler = async (): Promise<Token[]> => {
    bloomLog("Inside loadAllSupportedTokensHandler");
    try {
      const chainId = SUPPORTED_CHAIN_ID as ChainIdType;
      const supportedTokens = currentChain.supportedTokens;
      const bloomEscrowAddress = currentChain.bloomEscrowAddress as Address;

      const allSupportedTokensResults = (await readContract(config, {
        abi: bloomEscrowAbi,
        address: bloomEscrowAddress,
        functionName: "getAllSupportedTokens",
        chainId,
      })) as any;

      // Execute all reads
      bloomLog("Bloom Escrow Results:", allSupportedTokensResults);

      // Precompute address-to-symbol map
      const addressToSymbol: Record<string, string> = {};
      for (const [symbol, addr] of Object.entries(
        currentChain.tokenAddresses
      )) {
        addressToSymbol[addr.toLowerCase()] = symbol;
      }

      // Rebuild into WalletToken[] symbol, icon.
      const allSupportedTokens: Token[] = allSupportedTokensResults.map(
        (_tokenAddress: Address, i: number) => {
          const symbol = addressToSymbol[_tokenAddress.toLowerCase()];
          const tokenMeta = TOKEN_META[chainId][symbol!];
          return {
            ...tokenMeta,
            image: IMAGES[symbol!],
            address: _tokenAddress,
          };
        }
      );

      bloomLog("All Supported Tokens: ", allSupportedTokens);

      dispatchDefiAction({
        type: "ALL_SUPPORTED_TOKENS",
        allSupportedTokens: allSupportedTokens,
      });
      return allSupportedTokens;
    } catch (error) {
      console.error("Failed to load user wallet tokens:", error);
      dispatchDefiAction({
        type: "ALL_SUPPORTED_TOKENS",
        allSupportedTokens: [],
      });
      return [];
    }
  };

  const loadRecipientDealsHandler = async (
    signerAddress: Address
  ): Promise<any[]> => {
    bloomLog("Inside load all creator deals handler");

    try {
      const chainId = SUPPORTED_CHAIN_ID as ChainIdType;
      const bloomEscrowAddress = currentChain.bloomEscrowAddress as Address;

      // Step 1: get all deal IDs for this creator
      const recipientDealsId = (await readContract(config, {
        abi: bloomEscrowAbi,
        address: bloomEscrowAddress,
        functionName: "getRecipientDeals",
        args: [signerAddress],
        chainId,
      })) as number[];

      bloomLog("Recipient Deal IDs:", recipientDealsId);

      if (!recipientDealsId.length) {
        dispatchDefiAction({
          type: "RECIPIENT_DEALS",
          recipientDeals: [],
        });
        return [];
      }

      // Step 2: fetch all deals concurrently
      const recipientDeals = await Promise.all(
        recipientDealsId.map((_dealId) =>
          readContract(config, {
            abi: bloomEscrowAbi,
            address: bloomEscrowAddress,
            functionName: "getDeal",
            args: [_dealId],
            chainId,
          })
        )
      );

      bloomLog("All recipient deals:", recipientDeals);

      // Step 3: dispatch to state
      dispatchDefiAction({
        type: "RECIPIENT_DEALS",
        recipientDeals,
      });

      return recipientDeals;
    } catch (error) {
      console.error("Failed to load recipient deals:", error);
      dispatchDefiAction({
        type: "RECIPIENT_DEALS",
        recipientDeals: [],
      });
      return [];
    }
  };

  const loadCreatorDealsHandler = async (
    signerAddress: Address
  ): Promise<any[]> => {
    bloomLog("Inside load all creator deals handler");

    try {
      const chainId = SUPPORTED_CHAIN_ID as ChainIdType;
      const bloomEscrowAddress = currentChain.bloomEscrowAddress as Address;

      // Step 1: get all deal IDs for this creator
      const creatorDealIds = (await readContract(config, {
        abi: bloomEscrowAbi,
        address: bloomEscrowAddress,
        functionName: "getCreatorDeals",
        args: [signerAddress],
        chainId,
      })) as number[];

      bloomLog("Creator Deal IDs:", creatorDealIds);

      if (!creatorDealIds.length) {
        dispatchDefiAction({
          type: "CREATOR_DEALS",
          creatorDeals: [],
        });
        return [];
      }

      // Step 2: fetch all deals concurrently
      const creatorDeals = await Promise.all(
        creatorDealIds.map((_dealId) =>
          readContract(config, {
            abi: bloomEscrowAbi,
            address: bloomEscrowAddress,
            functionName: "getDeal",
            args: [_dealId],
            chainId,
          })
        )
      );

      bloomLog("All creator deals:", creatorDeals);

      // Step 3: dispatch to state
      dispatchDefiAction({
        type: "CREATOR_DEALS",
        creatorDeals,
      });

      return creatorDeals;
    } catch (error) {
      console.error("Failed to load creator deals:", error);
      dispatchDefiAction({
        type: "CREATOR_DEALS",
        creatorDeals: [],
      });
      return [];
    }
  };

  const defiContext = {
    userWalletTokens: defiState.userWalletTokens,
    allSupportedTokens: defiState.allSupportedTokens,
    recipientDeals: defiState.recipientDeals,
    creatorDeals: defiState.creatorDeals,
    loadUserWalletTokens: loadUserWalletTokensHandler,
    loadAllSupportedTokens: loadAllSupportedTokensHandler,
    loadRecipientDeals: loadRecipientDealsHandler,
    loadCreatorDeals: loadCreatorDealsHandler,
  };

  return (
    <DefiContext.Provider value={defiContext}>
      {props.children}
    </DefiContext.Provider>
  );
};

export default DefiProvider;
