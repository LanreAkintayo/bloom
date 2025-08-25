// src/lib/contracts.ts
export const ERC20_ABI = [
  {
    "type": "function",
    "name": "transfer",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "type": "bool" }]
  },
  {
    "type": "function",
    "name": "decimals",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "type": "uint8" }]
  }
];

export const registry = [
  {
    name: "USDC",
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111),
    address: "0xYourUSDCAddressOnSepolia", // replace with actual token contract
    abi: ERC20_ABI,
    allowedFunctions: ["transfer"],
  },
  {
    name: "DAI",
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111),
    address: "0xYourDAIAddressOnSepolia", // replace with actual token contract
    abi: ERC20_ABI,
    allowedFunctions: ["transfer"],
  },
];
