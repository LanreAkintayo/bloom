import { ChainNamespaceType, WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "";

const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "";

type ProviderConfig = {
  chainNamespace: ChainNamespaceType;
  /**
   * Block explorer url for the chain
   * @example https://ropsten.etherscan.io
   */
  blockExplorerUrl: string;
  /**
   * Logo url for the base token
   */
  logo: string;
  /**
   * Name for ticker
   * @example 'Binance Token', 'Ethereum', 'Polygon Ecosystem Token'
   */
  tickerName: string;
  /**
   * Symbol for ticker
   * @example BNB, ETH
   */
  ticker: string;
  /**
   * RPC target Url for the chain
   * @example https://ropsten.infura.io/v3/YOUR_API_KEY
   */
  rpcTarget: string;
  /**
   * websocket target Url for the chain
   */
  wsTarget?: string;
  /**
   * Chain Id parameter(hex with 0x prefix) for the network. Mandatory for all networks. (assign one with a map to network identifier for platforms)
   * @example 0x1 for mainnet, 'loading' if not connected to anything yet or connection fails
   * @defaultValue 'loading'
   */
  chainId: string;
  /**
   * Display name for the network
   */
  displayName: string;
  /**
   * Whether the network is testnet or not
   */
  isTestnet?: boolean;
  /**
   * Number of decimals for the currency ticker (e.g: 18)
   */
  decimals?: number;
};

const sepoliaChain: ProviderConfig = {
  chainNamespace: "eip155",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  logo: "/icon.svg",
  tickerName: "Sepolia",
  ticker: "ETH",
  rpcTarget: sepoliaRpcUrl,
  chainId: "0xaa36a7",
  displayName: "Sepolia Testnet",
  isTestnet: true,
  decimals: 18,
};

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,

    defaultChainId: "0xaa36a7", // Sepolia's chain ID not in Hex is 11155111
    chains: [sepoliaChain],
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
