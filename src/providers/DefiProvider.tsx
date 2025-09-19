import React, { useReducer } from "react";
import { Address } from "viem";
import { WalletToken } from "@/types";
import DefiContext from "./defi-context";
import {
  erc20Abi,
  IMAGES,
  SUPPORTED_CHAIN_ID,
  supportedTokens,
} from "@/constants";
import { config } from "@/lib/wagmi";
import { readContracts } from "@wagmi/core";
import { bloomLog } from "@/lib/utils";

const defaultDefiState = {
  userWalletToken: null,
};

const defiReducer = (
  state: any,
  action: {
    type: string;
    // userWalletTokens: WalletToken[];
    userWalletTokens: any[];
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

  const loadUserWalletTokensHandler = async (
    signerAddress: string
  ): Promise<any[]> => {
    bloomLog("Inside loadUserWalletTokensHandler");
    try {
      const tokens = supportedTokens.flatMap((_tokenAddress) => {
        const tokenAddress = _tokenAddress as Address;
        const chainId = SUPPORTED_CHAIN_ID as 1 | 11155111;
        return [
          {
            chainId,
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "name",
          },
          {
            chainId,
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "symbol",
          },
          {
            chainId,
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "decimals",
          },
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
      const walletTokens: WalletToken[] = supportedTokens.map((_token, i) => {
        const baseIndex = i * 4; // 4 calls per token
        const symbol = erc20Results[baseIndex + 1].result as string;
        return {
          name: erc20Results[baseIndex].result as string,
          symbol,
          decimal: Number(erc20Results[baseIndex + 2].result),
          balance: BigInt(erc20Results[baseIndex + 3].result as string),
          image: IMAGES[symbol],
          address: _token.address,
        };
      });

      dispatchDefiAction({
        type: "USER_WALLET_TOKENS",
        userWalletTokens: erc20Results,
      });
      return erc20Results;
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
