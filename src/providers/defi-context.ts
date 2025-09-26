import { Token, WalletToken } from "@/types";
import React from "react";


interface IDefiContext {
  userWalletTokens: WalletToken[];
  allSupportedTokens: any;
  recipientDeals: any[];
  creatorDeals: any[];
  loadUserWalletTokens: (signerAddress: string) => Promise<WalletToken[]>;
  loadAllSupportedTokens: () => Promise<Token[]>;
  loadRecipientDeals: (signerAddress: string) => Promise<any[]>;
  loadCreatorDeals: (signerAddress: string) => Promise<any[]>;
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
