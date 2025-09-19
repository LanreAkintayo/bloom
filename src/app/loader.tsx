"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import useDefi from "@/hooks/useDefi";

export default function DeFiLoader() {
  const { loadUserWalletTokens } = useDefi();
  const { address: signerAddress } = useAccount();

  useEffect(() => {
    if (!signerAddress) return;
    loadUserWalletTokens(signerAddress).catch((err) =>
      console.error("Failed to load DeFi data:", err)
    );
  }, [signerAddress]);

  return null; // doesn't render anything, just runs effects
}
