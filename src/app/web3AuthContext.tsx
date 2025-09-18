import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "";

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    uiConfig: {
      logoLight: "/icon.svg", // Provide a valid logo URL or path
      logoDark: "/icon.svg", // Provide a valid logo URL or path
      mode: "dark",
      appName: "Bloom",
      useLogoLoader: true,

    },
  
  },

};

export default web3AuthContextConfig;
