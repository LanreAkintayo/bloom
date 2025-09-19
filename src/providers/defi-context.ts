import { WalletToken } from "@/types";
import React from "react";


interface IDefiContext {
  userWalletTokens: WalletToken[];
  loadUserWalletTokens: (signerAddress: string) => Promise<WalletToken[]>;
}

const DefiContext = React.createContext<IDefiContext>({
  userWalletTokens: [],
  loadUserWalletTokens: (signerAdress) => Promise.resolve([]),
});

export default DefiContext;
