import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Parse user message to see if it's a transaction.
 * If yes, return JSON with type, amount, symbol, to.
 * If not, return { error: "Could not parse" }.
 */
export async function parseTransactionIntent(message: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are a Web3 transaction parser. The user will write in natural language asking to send ETH or ERC20 tokens. 
Output JSON ONLY in this format:

{
  "type": "eth" | "erc20",
  "amount": string,
  "symbol"?: string,
  "to": string
}

Rules:
- type must be "eth" or "erc20"
- If ETH: do not include "symbol"
- If ERC20: include "symbol"
- amount must be a string
- to must be recipient address
- If cannot parse, return {"error": "Could not parse"}

User message: "${message}"
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    console.log("Parser raw response:", text);
    // Clean extra commas or invisible chars
    text = text.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

    console.log("Parser cleaned response:", text);

    // Extract JSON
    const match = text.match(/\{[\s\S]*\}/);
    console.log("Parser JSON match:", match);
    if (!match) return { error: "Could not parse" };

    const json = JSON.parse(match[0]);
    return json;
  } catch (e) {
    console.error("Transaction parsing error:", e);
    return { error: "Could not parse" };
  }
}

/**
 * Handles any message:
 * 1. Tries transaction parsing
 * 2. Fallback chat reply
 */
export async function handleMessage(message: string) {
  const txIntent = await parseTransactionIntent(message);

  if (!txIntent.error) {
    return { type: "transaction", request: txIntent };
  }

  // Fallback chat
  const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chatPrompt = `
You are a helpful Web3 assistant. Reply naturally to the user.
User: "${message}"
`;

  try {
    const result = await chatModel.generateContent(chatPrompt);
    const text = result.response.text().trim();
    return { type: "chat", reply: text };
  } catch (e) {
    console.error("Gemini chat error:", e);
    return { type: "chat", reply: "Sorry, I couldn't generate a response." };
  }
}
