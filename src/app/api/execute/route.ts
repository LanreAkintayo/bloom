import { NextResponse } from "next/server";
import { parseEther } from "viem";

// ERC-20 minimal ABI
const erc20ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
];

// Example token registry (add yours here)
const tokenRegistry: Record<string, { address: string; decimals: number }> = {
  USDC: {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // mainnet USDC
    decimals: 6,
  },
  DAI: {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
  },
};

export async function POST(req: Request) {
  const intent = await req.json();

  // ETH transfer
  if (intent.type === "eth") {
    return NextResponse.json({
      request: {
        to: intent.to,
        value: parseEther(intent.amount).toString(),
        data: "0x", // no data for ETH
      },
    });
  }

  // ERC-20 transfer
  if (intent.type === "erc20") {
    const token = tokenRegistry[intent.symbol];
    if (!token) {
      return NextResponse.json(
        { error: `Token ${intent.symbol} not supported` },
        { status: 400 }
      );
    }

    const amount = BigInt(Math.floor(parseFloat(intent.amount) * 10 ** token.decimals));

    return NextResponse.json({
      request: {
        address: token.address,
        abi: erc20ABI,
        functionName: "transfer",
        args: [intent.to, amount],
      },
    });
  }

  return NextResponse.json({ error: "Unknown intent type." }, { status: 400 });
}
