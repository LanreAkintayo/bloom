
"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { injected, useAccount, useConnect, useDisconnect, useSendTransaction, useWriteContract } from "wagmi";

export default function HomePage() {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [pendingTx, setPendingTx] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

    const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((m) => [...m, { role: "user", text: input }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      if (data.type === "transaction") {
        setPendingTx(data.request);
      } else if (data.type === "chat") {
        setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: "Error processing message." }]);
    } finally {
      setInput("");
      setIsLoading(false);
    }
  };


async function confirmTx() {
  if (!pendingTx) return;
  try {
    let hash: any;
    console.log("Pending TX:", pendingTx);

    if (pendingTx.type === "erc20") {
      // ERC-20 transfer
      hash = await writeContractAsync(pendingTx.request);
    } else if (pendingTx.type === "eth") {
      // ETH transfer
      hash = await sendTransactionAsync({
        to: pendingTx.to,
        value: parseEther(pendingTx.amount), // convert ETH to wei
      });
    }

    setMessages((m) => [
      ...m,
      { role: "assistant", text: `✅ Sent! Tx hash: ${hash}` },
    ]);
  } catch (e: any) {
    setMessages((m) => [
      ...m,
      { role: "assistant", text: `❌ Failed: ${e.message}` },
    ]);
  } finally {
    setPendingTx(null);
  }
}
  // const confirmTx = () => {
  //   setMessages((m) => [
  //     ...m,
  //     {
  //       role: "assistant",
  //       text: `Transaction confirmed: Sending ${pendingTx.amount} ${pendingTx.symbol || "ETH"} to ${pendingTx.to}`,
  //     },
  //   ]);
  //   setPendingTx(null);
  // };

  return (
    <div className="h-screen bg-gray-50 flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Web3 Chat Assistant</h1>
        {isConnected ? (
          <div className="flex items-center gap-2">
            <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button
              onClick={() => disconnect()}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => connect({connector: injected()})}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Chat Box */}
      <div className="flex-1 overflow-y-auto bg-white rounded shadow p-4 mb-4 h-2/3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-3 p-2 rounded max-w-[70%] ${
              m.role === "user" ? "bg-blue-100 self-end ml-auto" : "bg-gray-100"
            }`}
          >
            {m.text}
          </div>
        ))}

        {pendingTx && (
          <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-3">
            <p className="text-yellow-800">
              You are about to send {pendingTx.amount} {pendingTx.symbol || "ETH"} to {pendingTx.to}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={confirmTx}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setPendingTx(null)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading && <p className="text-gray-500 text-sm">Processing your message...</p>}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

