import { Abi } from "viem";
import _erc20Abi from "./erc20Abi.json";
import _bloomEscrowAbi from "./bloomEscrowAbi.json";
import _jurorManagerAbi from "./jurorManagerAbi.json";
import _disputeStorageAbi from "./disputeStorageAbi.json";
import _disputeManagerAbi from "./disputeManagerAbi.json";
import _feeControllerAbi from "./feeControllerAbi.json";

const erc20Abi = _erc20Abi as Abi;
const bloomEscrowAbi = _bloomEscrowAbi as Abi;
const jurorManagerAbi = _jurorManagerAbi as Abi;
const disputeStorageAbi = _disputeStorageAbi as Abi;
const disputeManagerAbi = _disputeManagerAbi as Abi;
const feeControllerAbi = _feeControllerAbi as Abi;

export { erc20Abi, bloomEscrowAbi, jurorManagerAbi, disputeStorageAbi, disputeManagerAbi, feeControllerAbi };

export const MAX_PERCENT = 10000; // 100.00%

export const IMAGES: Record<string, string> = {
  DAI: "/dai.svg",
  WETH: "/weth.svg",
  ETH: "/eth.svg",
  LINK: "/link.svg",
  FAU: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5qUPi3Ar2dQZ2m9K5opr_h9QaQz4_G5HVYA&usqp=CAU",
  LAR: "https://app.aave.com/icons/tokens/wbtc.svg",
  WMATIC: "https://app.aave.com/icons/tokens/wmatic.svg",
  MATIC: "https://app.aave.com/icons/tokens/matic.svg",
  BLM: "/bloom.svg",
  USDC: "/usdc.svg",
};

export interface ChainConfig {
  chainId: number;
  name: string;
  supportedTokens: string[];
  tokenAddresses: Record<string, string>;
  priceFeeds: Record<string, string>;
  wrapperAddress: string;
  wrappedNativeTokenAddress: string;
  bloomEscrowAddress: string;
  jurorManagerAddress: string;
  disputeStorageAddress: string;
  disputeManagerAddress: string;
  feeControllerAddress: string;
}

export const CHAINS: Record<string, ChainConfig> = {
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    supportedTokens: ["WETH", "USDC", "DAI", "BLM"],
    tokenAddresses: {
      WETH: "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c",
      USDC: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
      DAI: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
      LINK: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      BLM: "0xc4E523B7d26186eC7f1dCBed8a64DaBDE795C98E",
    },
    priceFeeds: {
      ethUsd: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      usdcUsd: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
      daiUsd: "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19",
    },
    wrapperAddress: "0xab18414CD93297B0d12ac29E63Ca20f515b3DB46",
    jurorManagerAddress: "0xa501eC31CDF0B604c2769444BED60535BF0Bc5EC",
    wrappedNativeTokenAddress: "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c",
    bloomEscrowAddress: "0x1Ced6048D32cAdAb0d0A94244F67caBA2b7b6838",
    disputeStorageAddress: "0x8Ee03eDDBe18fabacbF6D6C0298F8eF618735409",
    disputeManagerAddress: "0x7f3853883c08B86406B41fFecC2A0565B52b1fE0",
    feeControllerAddress: "0x4D88364D7Cff7fD6fF4c4a484FDe4aa788dFB24B"
  },
};

export const TOKEN_META: Record<
  number,
  Record<string, { name: string; symbol: string; decimal: number }>
> = {
  1: {
    // Ethereum mainnet
    DAI: { name: "Dai Stablecoin", symbol: "DAI", decimal: 18 },
    USDC: { name: "USD Coin", symbol: "USDC", decimal: 6 },
    WETH: { name: "Wrapped Ether", symbol: "WETH", decimal: 18 },
    BLM: { name: "Bloom", symbol: "BLM", decimal: 18 },
  },
  11155111: {
    // Sepolia
    DAI: { name: "DAI", symbol: "DAI", decimal: 18 },
    USDC: { name: "USDC", symbol: "USDC", decimal: 6 },
    WETH: { name: "WETH", symbol: "WETH", decimal: 18 },
    ETH: { name: "ETH", symbol: "ETH", decimal: 18 },
    BLM: { name: "Bloom", symbol: "BLM", decimal: 18 },
  },
};


// Build address → token symbol dynamically from CHAINS
export const buildAddressToToken = (
  chains: Record<string, ChainConfig>
): Record<number, Record<string, string>> => {
  const result: Record<number, Record<string, string>> = {};
  for (const key in chains) {
    const chain = chains[key];
    result[chain.chainId] = {};
    for (const [symbol, address] of Object.entries(chain.tokenAddresses)) {
      result[chain.chainId][address.toLowerCase()] = symbol;
    }
  }
  return result;
};

export const addressToToken = buildAddressToToken(CHAINS);

// export const addressToToken: Record<number, Record<string, string>> = {
//   1: {
//     "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c": "WETH",
//     "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8": "USDC",
//     "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357": "DAI",
//     "0x779877A7B0D9E8603169DdbD7836e478b4624789": "LINK",
//     "0xc4E523B7d26186eC7f1dCBed8a64DaBDE795C98E": "BLM",
//   },
//   11155111: {
//     "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c": "WETH",
//     "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8": "USDC",
//     "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357": "DAI",
//     "0x779877A7B0D9E8603169DdbD7836e478b4624789": "LINK",
//     "0xc4E523B7d26186eC7f1dCBed8a64DaBDE795C98E": "BLM",
//   },
// };

// Pick the chain dynamically
export const getChainConfig = (chainName: string) => {
  const config = CHAINS[chainName];
  if (!config) throw new Error(`Chain ${chainName} is not supported`);
  return config;
};

// Example usage
const currentChain = getChainConfig("sepolia");
export const supportedTokens = [
  // currentChain.tokenAddresses.WETH,
  currentChain.tokenAddresses.USDC,
  currentChain.tokenAddresses.DAI,
  currentChain.wrappedNativeTokenAddress,
];
export const SUPPORTED_CHAIN_ID = currentChain.chainId;
