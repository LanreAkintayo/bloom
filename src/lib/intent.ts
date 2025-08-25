// src/lib/intent.ts
import { z } from "zod";
import { registry } from "./contracts";

export const IntentSchema = z.object({
  kind: z.literal("token_transfer"),
  chainId: z.number(),
  contract: z.string(),          // token contract address
  functionName: z.literal("transfer"),
  args: z.tuple([
    z.string(),                  // recipient
    z.string(),                  // amount (will be converted later)
  ]),
  readOnly: z.literal(false),
  reason: z.string().optional(),
});
export type Intent = z.infer<typeof IntentSchema>;

export function parseTokenTransfer(message: string, chainId: number) {
  const m = message.match(/send\s+(\d+(?:\.\d+)?)\s*(\w+)\s+to\s+(0x[a-fA-F0-9]{40})/i);
  if (!m) {
    throw new Error("Could not understand transfer request. Try: send 5 USDC to 0xabc...");
  }

  const amount = m[1];     // e.g. "5"
  const symbol = m[2].toUpperCase(); // e.g. "USDC"
  const to = m[3];         // e.g. recipient

  const token = registry.find(t => t.name.toUpperCase() === symbol && t.chainId === chainId);
  if (!token) throw new Error("Token not supported");

  return IntentSchema.parse({
    kind: "token_transfer",
    chainId,
    contract: token.address,
    functionName: "transfer",
    args: [to, amount], // amount in human number, we’ll convert later
    readOnly: false,
    reason: `User wants to send ${amount} ${symbol} to ${to}`,
  });
}
