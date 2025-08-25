"use client";

import { ConnectButton as RKConnectButton } from "@rainbow-me/rainbowkit";
import { useWeb3 } from "@/hooks/useWeb3";

export default function ConnectButton() {
  const { isConnected, address, disconnect, chain } = useWeb3();

  return (
    <div>
      <RKConnectButton />
      {isConnected && (
        <div className="mt-2">
          <p>Address: {address?.substring(0, 6)}...{address?.slice(-4)}</p>
          <p>Network: {chain?.name}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
