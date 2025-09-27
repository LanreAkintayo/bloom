import { Token, WalletToken } from "@/types";
import React from "react";
import { Address } from "viem";


interface IDefiContext {
  userWalletTokens: WalletToken[];
  allSupportedTokens: any;
  recipientDeals: any[];
  creatorDeals: any[];
  loadUserWalletTokens: (signerAddress: string) => Promise<WalletToken[]>;
  loadAllSupportedTokens: () => Promise<Token[]>;
  loadRecipientDeals: (signerAddress: Address) => Promise<any[]>;
  loadCreatorDeals: (signerAddress: Address) => Promise<any[]>;
}

const DefiContext = React.createContext<IDefiContext>({
  userWalletTokens: [],
  allSupportedTokens: [],
  recipientDeals: [],
  creatorDeals: [],
  loadUserWalletTokens: (signerAdress) => Promise.resolve([]),
  loadAllSupportedTokens: () => Promise.resolve([]),
  loadRecipientDeals: (signerAddress) => Promise.resolve([]),
  loadCreatorDeals: (signerAddress) => Promise.resolve([]),
});

export default DefiContext;
