"use client";

import { Fragment, useState, useEffect } from "react";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
} from "@web3auth/modal/react";
import { useAccount, useSwitchChain } from "wagmi";
import { User, LogOut, ChevronDown, AlertTriangle, LoaderCircle } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";

export default function ConnectButton() {
  const { connect, isConnected, loading:isConnecting } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const SUPPORTED_CHAIN_ID = 11155111;

  // Add loading state for network switch
  const [isSwitching, setIsSwitching] = useState(false);

  const isWrongNetwork = () => chainId !== SUPPORTED_CHAIN_ID;

  // Sync Web3Auth and wagmi state
  useEffect(() => {
    if (isPending) {
      setIsSwitching(true);
    } else {
      setIsSwitching(false);
    }
  }, [isPending]);

  if (!isConnected) {
    return (
      <button
        onClick={() => connect()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-md bg-slate-900/95 backdrop-blur-md text-white hover:bg-slate-800/90 transition-all border border-slate-800/95 cursor-pointer"
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <LoaderCircle className="w-5 h-5 animate-spin" />
            Connecting...
          </>
        ) : (
          "Connect Wallet"
        )}
      </button>
    );
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-md bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-800/90 transition-all border border-slate-800/95 cursor-pointer">
        <User className="w-5 h-5" />
        <span className="font-mono text-sm">
          {address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : userInfo?.email || "User"}
        </span>

        {(isWrongNetwork() || isSwitching || isConnecting) && (
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
        )}

        {(isSwitching || isConnecting) ? (
          <LoaderCircle className="w-4 h-4 animate-spin" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
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
        <div className="absolute right-0 mt-2 w-60 origin-top-right bg-slate-900 backdrop-blur-sm divide-y divide-slate-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-3 text-sm text-white flex justify-between items-center">
            <span>Network</span>
            <span
              className={
                isWrongNetwork()
                  ? "text-amber-400 font-semibold"
                  : "text-emerald-400"
              }
            >
              {isSwitching ? "Switching..." : isWrongNetwork() ? "Wrong Network" : "Sepolia"}
            </span>
          </div>

          <div className="p-3 space-y-3">
            {isWrongNetwork() && (
              <button
                onClick={() => {
                  setIsSwitching(true);
                  switchChain({ chainId: SUPPORTED_CHAIN_ID });
                }}
                disabled={isSwitching}
                className={`px-3 py-2 rounded-md font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-900 shadow text-sm md:text-base transition-all whitespace-nowrap w-full ${
                  isSwitching ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSwitching ? "Switching..." : "Switch to Sepolia"}
              </button>
            )}

            <button
              onClick={() => disconnect()}
              className="px-3 py-2 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-medium shadow transition-all w-full mx-auto"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      </Transition>
    </Menu>
  );
}