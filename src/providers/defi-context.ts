import { Juror, StorageParams, Token, WalletToken } from "@/types";
import React from "react";
import { Address } from "viem";


interface IDefiContext {
  userWalletTokens: WalletToken[];
  allSupportedTokens: any;
  recipientDeals: any[];
  creatorDeals: any[];
  juror: Juror | null;
  storageParams: StorageParams | null;
  loadUserWalletTokens: (signerAddress: string) => Promise<WalletToken[]>;
  loadAllSupportedTokens: () => Promise<Token[]>;
  loadRecipientDeals: (signerAddress: Address) => Promise<any[]>;
  loadCreatorDeals: (signerAddress: Address) => Promise<any[]>;
  loadJuror: (signerAddress: Address) => Promise<Juror | null>;
  loadStorageParams: () => Promise<StorageParams | null>;
}

const DefiContext = React.createContext<IDefiContext>({
  userWalletTokens: [],
  allSupportedTokens: [],
  recipientDeals: [],
  creatorDeals: [],
  juror: null,
  storageParams: null,
  loadUserWalletTokens: (signerAdress) => Promise.resolve([]),
  loadAllSupportedTokens: () => Promise.resolve([]),
  loadRecipientDeals: (signerAddress) => Promise.resolve([]),
  loadCreatorDeals: (signerAddress) => Promise.resolve([]),
  loadJuror: (signerAddress) => Promise.resolve(null),
  loadStorageParams: () => Promise.resolve(null),

});

export default DefiContext;
