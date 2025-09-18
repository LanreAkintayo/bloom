"use client";

import { useState, useEffect, Fragment } from "react";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
} from "@web3auth/modal/react";
import { useAccount, useSwitchChain } from "wagmi";
import { User, LogOut, ChevronDown } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";

export default function ConnectButton() {
  const { connect, isConnected } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address, chainId } = useAccount();
  const { switchChain, chains, data, status } = useSwitchChain();
  const SUPPORTED_CHAIN_ID = 11155111;

  
  
  const [wrongNetwork, setWrongNetwork] = useState(false);
  console.log("data: ", data);
  console.log("chainId: ", chainId);
  console.log("Chains: ", chains)

  useEffect(() => {
    if (isConnected && chainId !== SUPPORTED_CHAIN_ID) {
      setWrongNetwork(true);
    } else {
      setWrongNetwork(false);
    }
  }, [isConnected, chainId]);

  if (!isConnected) {
    return (
      <button
        onClick={() => connect()}
        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 hover:brightness-110 transition-all duration-300"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-md transition-all ${
          wrongNetwork
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-800/90"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="font-mono text-sm">
          {address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : userInfo?.email || "User"}
        </span>
        <ChevronDown className="w-4 h-4" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-slate-950/95 backdrop-blur-sm divide-y divide-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-2 text-sm text-white">
            <span className={wrongNetwork ? "text-red-400 font-medium" : ""}>
              Network: {wrongNetwork ? "Wrong Network" : "Sepolia"}
            </span>
          </div>
          <div className="px-4 py-2 flex flex-col gap-2">
            {wrongNetwork && (
              <button
                onClick={() => {
                  console.log("Switching");
                  switchChain({ chainId: SUPPORTED_CHAIN_ID });
                }}
                disabled={chainId !== SUPPORTED_CHAIN_ID}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full text-sm font-medium shadow transition-all cursor-pointer"
              >
                Switch to Sepolia
              </button>
            )}
            <button
              onClick={() => disconnect()}
              className="px-3 py-2 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium shadow transition-all"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
