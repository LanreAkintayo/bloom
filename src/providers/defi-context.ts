import { Token, WalletToken } from "@/types";
import React from "react";


interface IDefiContext {
  userWalletTokens: WalletToken[];
  allSupportedTokens: any;
  loadUserWalletTokens: (signerAddress: string) => Promise<WalletToken[]>;
  loadAllSupportedTokens: () => Promise<Token[]>;
}

const DefiContext = React.createContext<IDefiContext>({
  userWalletTokens: [],
  allSupportedTokens: [],
  loadUserWalletTokens: (signerAdress) => Promise.resolve([]),
  loadAllSupportedTokens: () => Promise.resolve([]),
});

export default DefiContext;
