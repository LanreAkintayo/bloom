"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Badge from "@/components/Badge";
import PrimaryButton from "@/components/landing/PrimaryButton";
import Link from "next/link";
import { CheckCircle2, Copy, AlertTriangle, Bitcoin, DollarSign, Hexagon } from "lucide-react";
import { motion } from "framer-motion";

/* ---------- mock tokens ---------- */
type Token = {
  symbol: string;
  name: string;
  balance: number;
  icon: React.ReactNode;
  decimals?: number;
};

// const TOKENS: Token[] = [
//   { symbol: "ETH", name: "Ethereum", balance: 1.2345, icon: "/tokens/eth.png" },
//   { symbol: "USDC", name: "USD Coin", balance: 502.12, icon: "/tokens/usdc.png" },
//   { symbol: "DAI", name: "Dai", balance: 150.0, icon: "/tokens/dai.png" },
//   { symbol: "SOL", name: "Solana", balance: 12.45, icon: "/tokens/sol.png" },
//   { symbol: "MATIC", name: "Polygon", balance: 78.0, icon: "/tokens/matic.png" },
//   { symbol: "BNB", name: "Binance Coin", balance: 50.0, icon: "/tokens/bnb.png" },
//   { symbol: "LINK", name: "Chainlink", balance: 100.0, icon: "/tokens/link.png" },
//   { symbol: "USDT", name: "Tether", balance: 320.5, icon: "/tokens/usdt.png" },
//   { symbol: "FTM", name: "Fantom", balance: 20.0, icon: "/tokens/ftm.png" },
//   { symbol: "AVAX", name: "Avalanche", balance: 10.0, icon: "/tokens/avax.png" },
// ];


const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
    className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] ${className}`}
  >
    {children}
  </motion.div>
);

function SendBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
     

      {/* Top Right Glow */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />



      {/* Bottom Right Glow */}
      <div className="absolute bottom-20 -right-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* Center Glow */}
      <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />
    </div>
  )
}

const TOKENS: Token[] = [
  { symbol: "ETH", name: "Ethereum", balance: 1.2345, icon: <AlertTriangle className="w-6 h-6" /> },
  { symbol: "BTC", name: "Bitcoin", balance: 0.45, icon: <Bitcoin className="w-6 h-6" /> },
  { symbol: "USDC", name: "USD Coin", balance: 502.12, icon: <DollarSign className="w-6 h-6" /> },
  { symbol: "DAI", name: "Dai", balance: 150.0, icon: <Hexagon className="w-6 h-6" /> },
  // add more as needed
];

/* ---------- helpers ---------- */
const isMaybeAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s.trim());
const formatNumber = (n: number) =>
  n >= 1
    ? n.toLocaleString(undefined, { maximumFractionDigits: 6 })
    : n.toString();

/* ---------- component ---------- */
export default function SendPage() {
  const [selected, setSelected] = useState<Token>(TOKENS[0]);
  const [search, setSearch] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [useMax, setUseMax] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const illustrationRef = useRef<HTMLDivElement | null>(null);

  const filteredTokens = TOKENS.filter((t) =>
    t.symbol.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  

  useEffect(() => {
    if (useMax) setAmount(String(selected.balance));
  }, [useMax, selected]);

  useEffect(() => {
    const el = illustrationRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      el.style.transform = `translate3d(${dx * 6}px, ${dy * 6}px, 0)`;
    };
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", onMove);
    }
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const numericAmount = useMemo(() => parseFloat(amount || "0"), [amount]);

  function openPreview() {
    setError(null);
    if (!recipient.trim()) return setError("Enter a recipient address or ENS.");
    if (!isMaybeAddress(recipient) && !recipient.includes(".")) {
      return setError("Invalid recipient — use 0x address or ENS.");
    }
    if (!amount || numericAmount <= 0) return setError("Amount must be > 0.");
    if (numericAmount > selected.balance) return setError("Insufficient balance.");
    setPreviewOpen(true);
  }

  async function confirmSend() {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setSelected((prev) => ({ ...prev, balance: Math.max(0, prev.balance - numericAmount) }));
    setTimeout(() => {
      setPreviewOpen(false);
      setSent(false);
      setAmount("");
      setUseMax(false);
    }, 1400);
  }

  function copyAddress() {
    navigator.clipboard?.writeText("0xExampleAddressForDemo")?.catch(() => {});
  }

  return (
    <main className="min-h-screen bg-[#0b0e13] text-white py-12 px-6">
      <SendBackground />
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Badge>Transfer</Badge>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">Send Assets</h1>
            <p className="mt-2 text-white/70 max-w-xl">
              Securely send tokens from your wallet — instant or scheduled.
            </p>
            <div className="mt-3 flex gap-3 items-center">
              <div className="text-xs text-white/60">Wallet</div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/3 border border-white/6">
                <div className="text-sm font-medium">Main • 0x...abcd</div>
                <button onClick={copyAddress} className="ml-2 inline-flex items-center gap-1 text-white/60 hover:text-white/90">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <PrimaryButton>
              <Link href="/chat">Use AI Assistant</Link>
            </PrimaryButton>
          </div>
        </header>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Token & Send Form */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            {/* Token carousel */}
            <Card className="p-6">
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Search token..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-xl bg-[#0b0e13] border border-white/8 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />

                <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                  {filteredTokens.map((t) => {
                    const active = t.symbol === selected.symbol;
                    return (
                      <button
                        key={t.symbol}
                        onClick={() => setSelected(t)}
                        className={`flex flex-col items-center p-3 rounded-2xl transition ${
                          active ? "bg-emerald-400/10 border-emerald-400 shadow-lg" : "bg-white/2 border-white/6 hover:border-emerald-400"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">{t.icon}</div>
                        <div className="mt-1 text-sm font-semibold">{t.symbol}</div>
                        <div className="text-xs text-white/50 mt-0.5">{formatNumber(t.balance)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Send form */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Prepare transfer</h3>
              <p className="text-xs text-white/60 mt-1">Enter recipient and amount. You can also use “Max”.</p>

              <div className="mt-4 grid grid-cols-1 gap-4">
                <label className="text-xs text-white/60">Recipient</label>
                <input
                  className="rounded-xl bg-[#0b0e13] border border-white/8 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="0x123... or alice.eth"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />

                <label className="text-xs text-white/60">Amount</label>
                <div className="mt-2 flex gap-3 items-center">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Amount of ${selected.symbol}`}
                    className="flex-1 rounded-xl bg-[#0b0e13] border border-white/8 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    onClick={() => {
                      setUseMax(true);
                      setAmount(String(selected.balance));
                    }}
                    className="rounded-full px-3 py-2 bg-white/3 text-sm text-white/90 hover:bg-emerald-400/12 transition"
                  >
                    Max
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-400 text-sm mt-1">
                    <AlertTriangle className="w-4 h-4" />
                    <div>{error}</div>
                  </div>
                )}

                <div className="mt-3 flex gap-3">
                  <button
                    onClick={openPreview}
                    className="flex-1 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-300 text-black px-4 py-3 font-semibold shadow-md hover:-translate-y-0.5 transition"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      setRecipient("");
                      setAmount("");
                      setUseMax(false);
                    }}
                    className="rounded-2xl border border-white/8 px-4 py-3 text-white/80 hover:bg-white/3 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </Card>
          </section>

          {/* Right: Illustration */}
          <aside className="lg:col-span-5 flex flex-col items-center gap-6">
            <div className="relative w-full max-w-md">
              <div
                ref={illustrationRef}
                className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#071014] to-[#071218] p-6 shadow-xl"
              >
                <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40">
                  <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-emerald-500/20 blur-3xl animate-float-slow" />
                  <div className="absolute right-6 bottom-6 w-32 h-32 rounded-full bg-teal-400/12 blur-2xl animate-float-fast" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-48 h-48 relative">
                    <Image
                      src="/images/chat-illustration.png"
                      alt="AI assistant illustration"
                      fill
                      sizes="(min-width:1024px) 400px, 240px"
                      className="object-contain"
                    />
                  </div>

                  <div className="text-center">
                    <h4 className="text-lg font-semibold">Bloom Assistant</h4>
                    <p className="text-xs text-white/60 mt-1 max-w-[18rem]">
                      Prefer a conversational flow? Use our AI assistant to compose sends with natural language.
                    </p>
                  </div>

                  <div className="mt-2">
                    <PrimaryButton>
                      <Link href="/chat">Open Chat Assistant</Link>
                    </PrimaryButton>
                  </div>
                </div>

                {/* floating particles */}
                <div className="pointer-events-none">
                  <div className="absolute -left-6 -top-6 w-3 h-3 rounded-full bg-emerald-400/60 animate-float-fast" />
                  <div className="absolute left-8 top-2 w-2 h-2 rounded-full bg-teal-300/50 animate-float-slow" />
                  <div className="absolute right-10 top-10 w-4 h-4 rounded-full bg-emerald-400/30 animate-float" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
          <div className="relative z-50 w-full max-w-md p-6">
            <div className="rounded-2xl bg-[#0f1219] p-6 shadow-2xl border border-white/6">
              {!sent ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">Confirm transfer</h3>
                  <div className="text-sm text-white/60 mb-4">
                    You&apos;re about to send <strong>{numericAmount} {selected.symbol}</strong> to <span className="font-mono text-xs">{recipient}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={confirmSend}
                      className="flex-1 rounded-2xl bg-emerald-400/80 px-4 py-3 font-semibold hover:scale-105 transition"
                    >
                      {sending ? "Sending..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => setPreviewOpen(false)}
                      className="flex-1 rounded-2xl border border-white/6 px-4 py-3 text-white/70 hover:bg-white/2 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-pulse" />
                  <h4 className="text-lg font-semibold">Transfer sent!</h4>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
