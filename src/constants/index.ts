import { Abi } from "viem";
import _erc20Abi from "./erc20Abi.json";

const erc20Abi = _erc20Abi as Abi;
export { erc20Abi };

export const IMAGES: Record<string, string> = {
  DAI: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSllrF9PNBf88kIx9USP5g73XDYjkMyRBaDig&usqp=CAU",
  WETH: "https://app.aave.com/icons/tokens/weth.svg",
  LINK: "https://app.aave.com/icons/tokens/link.svg",
  FAU: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5qUPi3Ar2dQZ2m9K5opr_h9QaQz4_G5HVYA&usqp=CAU",
  LAR: "https://app.aave.com/icons/tokens/wbtc.svg",
  WMATIC: "https://app.aave.com/icons/tokens/wmatic.svg",
  MATIC: "https://app.aave.com/icons/tokens/matic.svg",
};

export interface ChainConfig {
  chainId: number;
  name: string;
  tokenAddresses: Record<string, string>;
  priceFeeds: Record<string, string>;
  wrapperAddress: string;
  wrappedNativeTokenAddress: string;
}

export const CHAINS: Record<string, ChainConfig> = {
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    tokenAddresses: {
      weth: "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c",
      usdc: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
      dai: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
      link: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      blm: "0x4138941D4b55b864ceC671E6737636107587c695"
    },
    priceFeeds: {
      ethUsd: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      usdcUsd: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
      daiUsd: "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19",
    },
    wrapperAddress: "0xab18414CD93297B0d12ac29E63Ca20f515b3DB46",
    wrappedNativeTokenAddress: "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c",
  },
};

// Pick the chain dynamically
export const getChainConfig = (chainName: string) => {
  const config = CHAINS[chainName];
  if (!config) throw new Error(`Chain ${chainName} is not supported`);
  return config;
};

// Example usage
const currentChain = getChainConfig("sepolia");
export const supportedTokens = [
  currentChain.tokenAddresses.weth,
  currentChain.tokenAddresses.usdc,
  currentChain.tokenAddresses.dai,
  currentChain.wrappedNativeTokenAddress,
];
export const SUPPORTED_CHAIN_ID = currentChain.chainId;
