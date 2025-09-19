import { WalletToken } from "@/types";
import React from "react";


interface IDefiContext {
//   userWalletTokens: WalletToken[];
  userWalletTokens: any[];
  loadUserWalletTokens: (signerAddress: string) => Promise<any[]>;
}

const DefiContext = React.createContext<IDefiContext>({
  userWalletTokens: [],
  loadUserWalletTokens: (signerAdress) => Promise.resolve([]),
});

export default DefiContext;
