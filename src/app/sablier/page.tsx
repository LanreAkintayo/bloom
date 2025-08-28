"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Shield,
  ShieldCheck,
  Lock,
  Star,
  Users,
  Clock,
  Zap,
  Wallet,
  Coins,
  Gift,
  Rocket,
  BarChart3,
  Globe2,
  Network,
  Activity,
  Layers,
  Database,
  KeyRound,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

// Tiny helpers
const SectionTitle = ({ kicker, title, subtitle }: { kicker?: string; title: string; subtitle?: string }) => (
  <div className="text-center mb-12 md:mb-16">
    {kicker && (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-widest uppercase text-white/70">
        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400" />
        {kicker}
      </div>
    )}
    <h2 className="mt-4 text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
      {title}
    </h2>
    {subtitle && <p className="mt-4 max-w-2xl mx-auto text-white/60">{subtitle}</p>}
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-xl ${className}`}>
    <div className="absolute inset-0 rounded-3xl pointer-events-none [mask-image:radial-gradient(75%_60%_at_50%_0%,black,transparent)] bg-gradient-to-b from-white/10 to-transparent" />
    <div className="relative p-6 md:p-8">{children}</div>
  </div>
);

const Glow = ({ className = "" }: { className?: string }) => (
  <div className={`pointer-events-none absolute blur-3xl opacity-40 ${className}`} />
);

export default function Landing() {
  return (
    <div className="bg-[#070B12] text-white min-h-screen w-full overflow-x-hidden selection:bg-orange-500/30">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-[#070B12]/60 border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-500 grid place-items-center shadow-[0_0_30px_rgba(251,146,60,0.6)]">
              <Clock className="w-5 h-5 text-black" />
            </div>
            <span className="font-black tracking-tight text-lg">Sablier</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a className="hover:text-white transition" href="#usecases">Use cases</a>
            <a className="hover:text-white transition" href="#why">Why Sablier</a>
            <a className="hover:text-white transition" href="#airdrop">Airdrops</a>
            <a className="hover:text-white transition" href="#pricing">Pricing</a>
            <a className="hover:text-white transition" href="#security">Security</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition">
              Docs <ExternalLink className="w-4 h-4" />
            </button>
            <button className="inline-flex items-center gap-2 px-4 md:px-5 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 text-black shadow-[0_10px_30px_-10px_rgba(251,146,60,0.7)] hover:brightness-110 transition">
              Launch App <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* grid + glow background */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,.25) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <Glow className="-top-24 -left-10 w-[40rem] h-[40rem] bg-orange-500/30" />
        <Glow className="top-10 -right-10 w-[36rem] h-[36rem] bg-purple-600/30" />

        <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-24 md:pb-40 relative">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight"
              >
                Onchain token
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">distribution</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1 }}
                className="mt-6 text-base md:text-lg text-white/70 max-w-xl"
              >
                Create streams, vesting schedules and airdrops you can trust. Transparent by default. Audited, secure, and fast across top chains.
              </motion.p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 text-black shadow-[0_15px_40px_-10px_rgba(251,146,60,0.7)] hover:scale-[1.02] active:scale-[.99] transition">
                  Start streaming <ArrowRight className="w-5 h-5" />
                </button>
                <button className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/15 hover:bg-white/5 transition">
                  View pricing <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* logos row */}
              <div className="mt-10">
                <p className="text-xs uppercase tracking-widest text-white/50 mb-3">Trusted by teams at</p>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 opacity-80">
                  {["a16z", "coinbase", "optimism", "base", "safe", "scroll"].map((n) => (
                    <div key={n} className="h-6 w-24 rounded bg-white/5 border border-white/10 grid place-items-center text-[10px] uppercase tracking-widest text-white/60">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* right visual */}
            <div className="relative h-[420px] sm:h-[520px]">
              <Card className="absolute right-0 left-0 mx-auto top-8 w-[82%] rotate-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Live Streams</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-300 grid place-items-center">
                        <Wallet className="text-black w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">DAO Treasury</p>
                        <p className="text-xs text-white/50">Streaming USDC to 124 members</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">Rate</p>
                    <p className="text-2xl font-extrabold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">$2,340/hr</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-12 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-lg bg-gradient-to-b from-orange-400/20 to-white/5 border border-white/10" />
                  ))}
                </div>
              </Card>
              <Card className="absolute right-0 left-0 mx-auto -bottom-4 w-[86%] -rotate-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 grid place-items-center">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Airdrop Campaign</p>
                      <p className="text-xs text-white/50">45,203 addresses whitelisted</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">Status</p>
                    <p className="text-sm inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Unique wallets", value: "45k" },
                    { label: "Claimed", value: "82%" },
                    { label: "Claim time", value: "~12s" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-white/60">{s.label}</p>
                      <p className="mt-1 text-xl font-bold">{s.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
              {/* floating bits */}
              <motion.div
                className="absolute -top-6 right-4 h-24 w-24 rounded-full bg-gradient-to-tr from-orange-500 to-amber-300 blur-2xl opacity-50"
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 6 }}
              />
              <motion.div
                className="absolute bottom-6 -left-2 h-20 w-20 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-600 blur-2xl opacity-50"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 7 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="usecases" className="relative py-20 md:py-28">
        <SectionTitle
          kicker="Use cases"
          title="What do people use Sablier for?"
          subtitle="Powering DAOs, L2s, and communities with flexible money primitives."
        />
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[
            { icon: Wallet, title: "Payroll", desc: "Automated continuous payroll in any ERC‑20." },
            { icon: Coins, title: "Vesting", desc: "Linear unlocks with cliffs and cancellations." },
            { icon: Gift, title: "Airdrops", desc: "Gas-optimized Merkle claims at scale." },
            { icon: Users, title: "Grants", desc: "Milestone-based streams for contributors." },
          ].map((f) => (
            <Card key={f.title}>
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl grid place-items-center bg-gradient-to-br from-white/10 to-white/0 border border-white/10">
                  <f.icon className="w-5 h-5 text-orange-300" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
              </div>
              <p className="mt-4 text-white/70">{f.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-sm text-orange-300/90">
                Learn more <ChevronRight className="w-4 h-4" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* WHY SABLIER */}
      <section id="why" className="relative py-20 md:py-28 bg-white/[0.02] border-y border-white/5">
        <SectionTitle
          kicker="Why Sablier"
          title="Conservative when it matters. Fast when it counts."
          subtitle="Battle‑tested smart contracts, granular controls, and built‑in analytics."
        />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-start">
          <Card>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Audited & Verified",
                  desc: "Multiple independent audits, formal verification, and bug bounties.",
                },
                {
                  icon: Lock,
                  title: "Granular Permissions",
                  desc: "Role‑based access with Safe and multisig workflows.",
                },
                {
                  icon: BarChart3,
                  title: "Real‑time Analytics",
                  desc: "Track stream rates, TVL, and vesting progress in one view.",
                },
                {
                  icon: Zap,
                  title: "Chain‑level Speed",
                  desc: "Optimized calldata and Merkle proofs for ~12s median claim time.",
                },
              ].map((it) => (
                <div key={it.title} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                    <it.icon className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <p className="font-semibold">{it.title}</p>
                    <p className="text-white/60 text-sm mt-1">{it.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm text-white/60">Throughput (claims/min)</p>
            <div className="mt-6 grid grid-cols-6 gap-3">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-gradient-to-b from-amber-300/30 to-white/5 border border-white/10" />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-sm text-white/60">
              <span>Base</span>
              <span>OP</span>
              <span>Arbitrum</span>
              <span>Polygon</span>
              <span>Scroll</span>
              <span>Ethereum</span>
            </div>
          </Card>
        </div>

        {/* badges */}
        <div className="max-w-7xl mx-auto px-6 mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Activity, label: "3.4m+ transactions processed" },
            { icon: Database, label: "$1.2b+ streamed TVL" },
            { icon: Network, label: "15+ chains supported" },
            { icon: KeyRound, label: "Open‑source contracts" },
          ].map((b) => (
            <div key={b.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
              <b.icon className="w-5 h-5 text-amber-300" />
              <p className="text-sm text-white/70">{b.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WORKING WITH SABLIER */}
      <section className="relative py-20 md:py-28" id="security">
        <SectionTitle
          kicker="Workflow"
          title="Working with Sablier"
          subtitle="Explore. Validate. Integrate. Move from idea to distribution without friction."
        />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              icon: Layers,
              title: "Explore",
              desc: "Prototype on testnets, import CSVs, and simulate streams before committing funds.",
            },
            {
              icon: Shield,
              title: "Validate",
              desc: "Guardrails like allowlists, cliffs, and revocation make risky mistakes unlikely.",
            },
            {
              icon: Globe2,
              title: "Integrate",
              desc: "Ship your own UI with our SDK or plug into Safe, Farcaster Frames, and more.",
            },
          ].map((s) => (
            <Card key={s.title}>
              <div className="h-11 w-11 rounded-2xl grid place-items-center bg-white/5 border border-white/10">
                <s.icon className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-white/70 text-sm">{s.desc}</p>
              <div className="mt-6 grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-8 rounded-md bg-white/[0.06] border border-white/10" />
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Security callout */}
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <Card>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-sm uppercase tracking-widest text-white/50">Audited & secure</p>
                <h3 className="mt-2 text-2xl font-bold">Multiple independent audits and an active bounty</h3>
                <ul className="mt-4 space-y-2 text-white/70 text-sm">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Formal verification where applicable</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Timelocks, pausability & role‑based permissions</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Public bug bounty with leading platforms</li>
                </ul>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-xs text-white/60 uppercase tracking-widest">Audit {i + 1}</div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* AIRDROPS INSTEAD OF VESTED DISTRIBUTIONS */}
      <section id="airdrop" className="relative py-20 md:py-28 bg-white/[0.02] border-y border-white/5 overflow-hidden">
        <SectionTitle
          kicker="New"
          title="Introducing airdrops instead of vested distributions"
          subtitle="Reduce sell‑pressure, increase participation, and keep things fair with proof‑based claims."
        />
        <Glow className="-top-10 right-0 w-[30rem] h-[30rem] bg-fuchsia-500/20" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
          <Card>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl grid place-items-center bg-gradient-to-br from-fuchsia-500 to-purple-600">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Claim once. No drip fatigue.</h3>
            </div>
            <p className="mt-4 text-white/70">
              Recipients claim their allocation with a single, gas‑efficient transaction. You define windows, caps, and merkle proofs. We handle the rest.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { label: "Avg claim time", value: "~12s" },
                { label: "Gas saved", value: "38%" },
                { label: "Failed tx", value: "< 0.3%" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/60">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <p className="text-sm text-white/60">Claim funnel</p>
            <div className="mt-4 grid grid-cols-12 gap-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-gradient-to-b from-fuchsia-400/25 to-white/5 border border-white/10" />
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
              <Clock className="w-4 h-4" /> 1‑click claims • On‑chain proofs • Anti‑sybil heuristics
            </div>
          </Card>
        </div>

        {/* Dedicated website */}
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <Card>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold">Dedicated airdrop website</h3>
                <p className="mt-3 text-white/70">Spin up a custom, branded claim site in minutes. Hosted, secured, and analytics‑ready out of the box.</p>
                <div className="mt-6 flex items-center gap-3">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition">
                    Preview <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-semibold shadow-[0_10px_30px_-10px_rgba(251,146,60,0.7)]">
                    Create campaign <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 h-24" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="relative py-20 md:py-28">
        <SectionTitle
          kicker="Integrations"
          title="Sablier is where you need it most"
          subtitle="Works with your stack: multisigs, L2s, frames, explorers, and more."
        />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/1] rounded-xl border border-white/10 bg-white/[0.04] grid place-items-center text-[10px] uppercase tracking-widest text-white/60"
            >
              Logo {i + 1}
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: Rocket, title: "Why so fast?", desc: "Optimized calldata and batched proofs keep latencies low even at peak." },
            { icon: Network, title: "Multi‑chain native", desc: "Base, OP, Arbitrum, Scroll, Polygon, Ethereum and more." },
            { icon: Layers, title: "Composable", desc: "SDK, subgraphs, and webhooks to build your own flows." },
          ].map((b) => (
            <Card key={b.title}>
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                <b.icon className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="mt-3 font-semibold">{b.title}</h3>
              <p className="mt-2 text-white/70 text-sm">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA & PRICING */}
      <section id="pricing" className="relative py-20 md:py-28 bg-white/[0.02] border-y border-white/5">
        <SectionTitle
          kicker="Pricing"
          title="Simple, usage‑based pricing"
          subtitle="No hidden fees. Scale as you grow."
        />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-6 md:gap-8">
          {[
            { name: "Starter", price: "$0", note: "Pay per Tx", features: ["Up to 100 recipients", "Basic analytics", "Email support"] },
            { name: "Pro", price: "$199/mo", highlighted: true, features: ["Unlimited recipients", "Advanced analytics", "Priority support"] },
            { name: "Enterprise", price: "Custom", features: ["SLA & DPA", "Dedicated support", "On‑prem options"] },
          ].map((p) => (
            <Card key={p.name} className={`${p.highlighted ? "ring-2 ring-amber-300/50" : ""}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold">{p.name}</h3>
                {p.highlighted && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-400 text-black font-semibold">Popular</span>
                )}
              </div>
              <p className="mt-4 text-3xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{p.price}</p>
              {p.note && <p className="text-xs text-white/50 mt-1">{p.note}</p>}
              <ul className="mt-6 space-y-2 text-sm text-white/80">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {f}</li>
                ))}
              </ul>
              <button className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition">
                Choose {p.name}
              </button>
            </Card>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 text-center">
          <button className="inline-flex items-center gap-3 px-7 py-3 rounded-2xl font-semibold bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 text-black shadow-[0_15px_40px_-10px_rgba(251,146,60,0.7)] hover:scale-[1.02] active:scale-[.99] transition">
            Launch the app <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* INVESTORS */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-widest text-white/50 mb-6">Backed by the best</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg border border-white/10 bg-white/5 grid place-items-center text-[10px] uppercase tracking-widest text-white/60">Investor {i + 1}</div>
            ))}
          </div>
        </div>
      </section>

      {/* READY TO GO FURTHER */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-5xl font-black">Ready to go further?</h3>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto">Ship your token distribution with confidence. Start free, upgrade when you need more.</p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button className="inline-flex items-center gap-3 px-7 py-3 rounded-2xl font-semibold bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 text-black shadow-[0_15px_40px_-10px_rgba(251,146,60,0.7)]">
              Get started <ArrowRight className="w-5 h-5" />
            </button>
            <button className="inline-flex items-center gap-3 px-7 py-3 rounded-2xl border border-white/10 hover:bg-white/5">
              Talk to sales
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-500 grid place-items-center shadow-[0_0_30px_rgba(251,146,60,0.6)]">
                <Clock className="w-5 h-5 text-black" />
              </div>
              <span className="font-black">Sablier</span>
            </div>
            <p className="mt-4 text-sm text-white/60">Onchain token distribution made simple, secure, and transparent.</p>
          </div>
          <div>
            <p className="font-semibold">Company</p>
            <ul className="mt-4 space-y-2 text-white/70 text-sm">
              <li>About</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Resources</p>
            <ul className="mt-4 space-y-2 text-white/70 text-sm">
              <li>Docs</li>
              <li>API</li>
              <li>Community</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Legal</p>
            <ul className="mt-4 space-y-2 text-white/70 text-sm">
              <li>Terms</li>
              <li>Privacy</li>
              <li>Security</li>
            </ul>
          </div>
        </div>
        <div className="px-6 pb-10 text-center text-xs text-white/50">© 2025 Sablier. All rights reserved.</div>
      </footer>
    </div>
  );
}
