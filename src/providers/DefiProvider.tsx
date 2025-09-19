import React, { useReducer } from "react";
import { Address } from "viem";
import { WalletToken } from "@/types";
import DefiContext from "./defi-context";
import {
  erc20Abi,
  IMAGES,
  SUPPORTED_CHAIN_ID,
  supportedTokens,
  TOKEN_META,
} from "@/constants";
import { config } from "@/lib/wagmi";
import { readContracts } from "@wagmi/core";
import { bloomLog } from "@/lib/utils";
import { getChainConfig } from "../constants";

const defaultDefiState = {
  userWalletTokens: null,
};

const defiReducer = (
  state: any,
  action: {
    type: string;
    userWalletTokens: WalletToken[];
  }
) => {
  if (action.type === "USER_WALLET_TOKENS") {
    return {
      ...state,
      userWalletTokens: action.userWalletTokens,
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
      const chainId = SUPPORTED_CHAIN_ID as 1 | 11155111;
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
      bloomLog("Raw ERC20 Results:", erc20Results);

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

      bloomLog("Wallet Tokens: ", walletTokens);

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


  const defiContext = {
    userWalletTokens: defiState.userWalletTokens,
    loadUserWalletTokens: loadUserWalletTokensHandler,
  };

  return (
    <DefiContext.Provider value={defiContext}>
      {props.children}
    </DefiContext.Provider>
  );
};

export default DefiProvider;
