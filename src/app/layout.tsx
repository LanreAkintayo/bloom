// src/app/layout.tsx
import type { Metadata } from "next";
import Providers from "@/app/providers";
import "@/app/globals.css";
import Header from "@/components/Header";
import useDefi from "@/hooks/useDefi";
import { useAccount } from "wagmi";
import { useEffect } from "react";

export const metadata: Metadata = { title: "Bloom" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loadUserWalletTokens, userWalletTokens } = useDefi();

  const { address: signerAddress, chainId } = useAccount();

  // Load all DeFi data in parallel when signerAddress changes
  useEffect(() => {
    const loadAllDefiData = async () => {
      if (!signerAddress) return;

      try {
        await Promise.all([loadUserWalletTokens(signerAddress)]);
      } catch (error) {
        console.error("Failed to load DeFi data:", error);
        // TODO: Update UI to show error
      }
    };

    loadAllDefiData();
  }, [signerAddress]);

  return (
    <html lang="en">
      <body>
        {/* <Header /> */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
