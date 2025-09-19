import { Abi } from "viem";
import _erc20Abi from "./erc20Abi.json";

const erc20Abi = _erc20Abi as Abi;

export { erc20Abi };

export const IMAGES = {
  DAI: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSllrF9PNBf88kIx9USP5g73XDYjkMyRBaDig&usqp=CAU",
  WETH: "https://app.aave.com/icons/tokens/weth.svg",
  LINK: "https://app.aave.com/icons/tokens/link.svg",
  FAU: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5qUPi3Ar2dQZ2m9K5opr_h9QaQz4_G5HVYA&usqp=CAU",
  LAR: "https://app.aave.com/icons/tokens/wbtc.svg",
  WMATIC: "https://app.aave.com/icons/tokens/wmatic.svg",
  MATIC: "https://app.aave.com/icons/tokens/matic.svg ",
};

export const sepoliaConfig = {
  ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  usdcUsdPriceFeed: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
  daiUsdPriceFeed: "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19",
  usdcTokenAddress: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", //6
  daiTokenAddress: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
  wethTokenAddress: "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c",
  linkAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
  wrapperAddress: "0xab18414CD93297B0d12ac29E63Ca20f515b3DB46",
  bloomTokenAddress: "0x4138941D4b55b864ceC671E6737636107587c695",
  wrappedNativeTokenAddress: "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c",
};

export const supportedTokens = [
  sepoliaConfig.bloomTokenAddress,
  sepoliaConfig.usdcTokenAddress,
  sepoliaConfig.daiTokenAddress,
  sepoliaConfig.wrappedNativeTokenAddress,
];

export const SUPPORTED_CHAIN_ID = 11155111