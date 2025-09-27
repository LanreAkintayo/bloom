// src/app/providers.tsx
"use client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { config } from "@/lib/wagmi";
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "@/app/web3AuthContext";
import DefiProvider from "@/providers/DefiProvider";
import DeFiLoader from "./loader";
import { ModalProvider } from "@/providers/ModalProvider";

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <WagmiProvider config={config}>
        <DefiProvider>
          <QueryClientProvider client={qc}>
            <DeFiLoader />
            <ModalProvider>{children}</ModalProvider>
          </QueryClientProvider>
        </DefiProvider>
      </WagmiProvider>
    </Web3AuthProvider>
  );
}
