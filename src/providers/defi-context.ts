import { Juror, Token, WalletToken } from "@/types";
import React from "react";
import { Address } from "viem";


interface IDefiContext {
  userWalletTokens: WalletToken[];
  allSupportedTokens: any;
  recipientDeals: any[];
  creatorDeals: any[];
  juror: Juror;
  loadUserWalletTokens: (signerAddress: string) => Promise<WalletToken[]>;
  loadAllSupportedTokens: () => Promise<Token[]>;
  loadRecipientDeals: (signerAddress: Address) => Promise<any[]>;
  loadCreatorDeals: (signerAddress: Address) => Promise<any[]>;
  loadJuror: (signerAddress: Address) => Promise<Juror | null>;
}

const DefiContext = React.createContext<IDefiContext>({
  userWalletTokens: [],
  allSupportedTokens: [],
  recipientDeals: [],
  creatorDeals: [],
  juror: null,
  loadUserWalletTokens: (signerAdress) => Promise.resolve([]),
  loadAllSupportedTokens: () => Promise.resolve([]),
  loadRecipientDeals: (signerAddress) => Promise.resolve([]),
  loadCreatorDeals: (signerAddress) => Promise.resolve([]),
  loadJuror: (signerAddress) => Promise.resolve(null),
});

export default DefiContext;
