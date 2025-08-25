import { useAccount, useDisconnect } from "wagmi";

export const useWeb3 = () => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  return {
    address,
    isConnected,
    disconnect,
    chain
  };
};
