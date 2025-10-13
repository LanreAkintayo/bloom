"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Menu,
  X,
  SendHorizontal,
  ShieldCheck,
  Bot,
  KeySquare,
  LifeBuoy,
  CalendarClock,
  Coins,
  Lock,
  CheckCircle2,
  Twitter,
  Github,
  Linkedin,
  Mail,
  Play,
} from "lucide-react";
// import Hero3D from "@/components/Hero3D";
import HeroGridTracer from "@/components/HeroGridTracer";

/**
 BloomLandingPage.tsx
 Single file, production minded landing page with header and footer included
 Requirements used: Tailwind CSS, framer-motion, lucide-react
 Notes:
 - Accessible controls and keyboard friendly navigation
 - Prefers reduced motion respected
 - Mobile menu included
 - Newsletter form simulated client side
 - Demo chat sandbox simulated so nothing external required
*/

// ---------- Small UI primitives ----------

function PrimaryButton({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={
        "inline-flex items-center gap-3 rounded-2xl px-5 py-3 font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 transition " +
        "bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 text-black shadow-[0_6px_24px_rgba(16,185,129,0.12)] " +
        className
      }
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/90 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 transition"
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/8 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-200/90 backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {children}
    </span>
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-md transition hover:shadow-[0_8px_32px_rgba(16,185,129,0.08)] " +
        className
      }
    >
      <div className="pointer-events-none absolute inset-0 opacity-5 [background-image:radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] bg-[length:16px_16px]" />
      {children}
    </div>
  );
}

// ---------- Ambient background and cursor parallax ----------

// function AmbientBackground() {
//   // small performance aware background with CSS and a minimal cursor parallax
//   const ref = useRef<HTMLDivElement | null>(null);
//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     let raf = 0;
//     function onMove(e: MouseEvent) {
//       cancelAnimationFrame(raf);
//       raf = requestAnimationFrame(() => {
//         const x = e.clientX / window.innerWidth;
//         const y = e.clientY / window.innerHeight;
//         el.style.setProperty("--mx", `${(x - 0.5) * 40}px`);
//         el.style.setProperty("--my", `${(y - 0.5) * 40}px`);
//       });
//     }
//     window.addEventListener("pointermove", onMove);
//     return () => {
//       cancelAnimationFrame(raf);
//       window.removeEventListener("pointermove", onMove);
//     };
//   }, []);
//   return (
//     <div
//       ref={ref}
//       aria-hidden
//       className="pointer-events-none fixed inset-0 -z-10"
//       style={
//         {
//           // css variables used by children
//         } as React.CSSProperties
//       }
//     >
//       <div
//         className="absolute left-[-20%] top-[-10%] h-[36rem] w-[36rem] rounded-full blur-[110px] opacity-90"
//         style={{
//           background:
//             "radial-gradient(closest-side, rgba(16,185,129,0.12), transparent 40%), linear-gradient(135deg, rgba(14,165,233,0.06), rgba(99,102,241,0.03))",
//           transform: "translate(var(--mx,0), var(--my,0))",
//         }}
//       />
//       <div
//         className="absolute right-[-18%] top-[15%] h-[28rem] w-[28rem] rounded-full blur-[140px] opacity-80"
//         style={{
//           background:
//             "radial-gradient(closest-side, rgba(6,182,212,0.08), transparent 40%), linear-gradient(120deg, rgba(99,102,241,0.04), rgba(236,72,153,0.02))",
//           transform:
//             "translate(calc(var(--mx,0) * -0.5), calc(var(--my,0) * -0.5))",
//         }}
//       />
//       <div
//         className="absolute bottom-[-24%] left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-[160px] opacity-70"
//         style={{
//           background:
//             "radial-gradient(closest-side, rgba(16,185,129,0.08), transparent 40%), linear-gradient(90deg, rgba(6,182,212,0.04), rgba(99,102,241,0.03))",
//         }}
//       />
//       <div className="absolute inset-0 bg-[radial-gradient(1200px_400px_at_10%_10%,rgba(255,255,255,0.01),transparent),radial-gradient(800px_300px_at_90%_90%,rgba(0,0,0,0.02),transparent)]" />
//     </div>
//   );
// }

// ---------- Header component with mobile menu ----------

function Header({ onCreate }: { onCreate?: () => void }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/6 bg-[#0a0c11]/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="flex items-center gap-3"
              aria-label="Bloom home"
            >
              <div className="relative h-9 w-9 rounded-lg" aria-hidden>
                <span className="absolute inset-0 rounded-lg bg-gradient-to-tr from-emerald-400 via-cyan-400 to-blue-400" />
                <span className="absolute inset-[2px] rounded-md bg-[#0a0c11]" />
                <span className="absolute left-2 top-2 block h-2 w-2 rounded-full bg-emerald-400 blur-sm" />
              </div>
              <span className="font-extrabold tracking-wider text-white/95 text-sm">
                Bloom
              </span>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a
              className="hover:text-white focus:outline-none focus-visible:underline"
              href="#features"
            >
              Features
            </a>
            <a
              className="hover:text-white focus:outline-none focus-visible:underline"
              href="#how"
            >
              How it Works
            </a>
            <a
              className="hover:text-white focus:outline-none focus-visible:underline"
              href="#demo"
            >
              Demo
            </a>
            <a
              className="hover:text-white focus:outline-none focus-visible:underline"
              href="#pricing"
            >
              Pricing
            </a>
            <a
              className="hover:text-white focus:outline-none focus-visible:underline"
              href="#faq"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <GhostButton onClick={() => alert("Log in flow placeholder")}>
                Connect Wallet
              </GhostButton>
            </div>

            <div className="hidden md:block">
              <PrimaryButton onClick={onCreate}>Get Started</PrimaryButton>
            </div>

            <div className="md:hidden">
              <button
                aria-expanded={open}
                aria-label="Open menu"
                onClick={() => setOpen((s) => !s)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/3 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40"
              >
                {open ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={
          open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
        }
        transition={{ duration: 0.22 }}
        className="md:hidden overflow-hidden border-t border-white/4"
      >
        <div className="px-4 pb-6 pt-4">
          <div className="flex flex-col gap-4">
            <a href="#features" onClick={() => setOpen(false)} className="py-2">
              Features
            </a>
            <a href="#how" onClick={() => setOpen(false)} className="py-2">
              How it Works
            </a>
            <a href="#demo" onClick={() => setOpen(false)} className="py-2">
              Demo
            </a>
            <a href="#pricing" onClick={() => setOpen(false)} className="py-2">
              Pricing
            </a>
            <a href="#faq" onClick={() => setOpen(false)} className="py-2">
              FAQ
            </a>
            <div className="pt-2">
              <PrimaryButton
                onClick={() => {
                  setOpen(false);
                  onCreate?.();
                }}
              >
                Create Deal
              </PrimaryButton>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  );
}

// ---------- Hero section with animated headline and KPIs ----------

// dynamic import prevents server side render errors
// const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false, loading: () => <div className="w-full h-64 rounded-2xl bg-[#071018]/60" /> });

// HeroGrid.tsx

function BloomLine() {
  return (
    <div className="relative w-full max-w-md flex items-center justify-center">
      <svg
        viewBox="0 0 600 200"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M50 150 Q100 50, 150 150 T250 150 
             M280 150 Q330 50, 380 150 T480 150 
             M500 150 Q550 50, 600 150"
          stroke="url(#gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ strokeDasharray: 2000, strokeDashoffset: 2000 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Glow effect */}
      <div className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400"></div>
    </div>
  );
}

function TracerGrid() {
  const size = 12; // 8x8 grid
  const cellSize = 40; // px per cell
  const [path, setPath] = useState<string[]>([]);

  useEffect(() => {
    let x = 0,
      y = 0;
    const points: string[] = [`${x},${y}`];

    const interval = setInterval(() => {
      const direction = Math.floor(Math.random() * 4);
      if (direction === 0 && x < size - 1) x++;
      else if (direction === 1 && x > 0) x--;
      else if (direction === 2 && y < size - 1) y++;
      else if (direction === 3 && y > 0) y--;

      points.push(`${x * cellSize},${y * cellSize}`);
      if (points.length > 20) points.shift(); // trail length

      setPath([...points]);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      width={size * cellSize}
      height={size * cellSize}
      className="bg-black/30 rounded-2xl"
    >
      {/* grid lines */}
      {[...Array(size)].map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1={0}
          x2={i * cellSize}
          y2={size * cellSize}
          stroke="rgba(255,255,255,0.08)"
        />
      ))}
      {[...Array(size)].map((_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * cellSize}
          x2={size * cellSize}
          y2={i * cellSize}
          stroke="rgba(255,255,255,0.08)"
        />
      ))}

      {/* blurred glow (underneath line) */}
      <motion.polyline
        points={path.join(" ")}
        fill="none"
        stroke="url(#glow)"
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ filter: "blur(12px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.3 }}
      />

      {/* main tracer line */}
      <motion.polyline
        points={path.join(" ")}
        fill="none"
        stroke="url(#glow)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* glowing gradient */}
      <defs>
        <linearGradient id="glow" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
function HeroGrid() {
  const gridSize = 6; // rows and columns
  const cells = Array.from({ length: gridSize * gridSize });

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-black/40 to-black/10">
      {/* grid lines */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
        {cells.map((_, i) => (
          <div key={i} className="border border-white/10" />
        ))}
      </div>

      {/* glowing particle */}
      <motion.div
        className="absolute w-8 h-8 rounded-full bg-cyan-400/80 blur-xl"
        animate={{
          x: ["0%", "80%", "80%", "0%", "0%"],
          y: ["0%", "0%", "80%", "80%", "0%"],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

function Hero({ onDemo }: { onDemo?: () => void }) {
  const reduced = useReducedMotion();

  return (
    <section className="relative py-20 sm:py-28" aria-label="Hero">
    <div className="absolute z-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl animate-blob top-0 left-1/4" />
   
      <div className="absolute z-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/3" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6 z-10">
          {/* <div className="flex items-center gap-3">
            <Badge>Secure</Badge>
          </div> */}

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400"
          >
             Safe, Smart, and Simple Crypto Payments
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="max-w-xl text-white/70"
          >
            Escrow protection that releases funds only when delivery is
            confirmed. Built-in AI assistant for faster transaction, optional juried disputes, and reversible  transfer in case of wrong wallet address or mistakes.
          </motion.p>

          <div className="flex flex-wrap gap-4 mt-6">
            <PrimaryButton onClick={() => alert("Create Deal clicked")}>
              Create Deal
              <SendHorizontal className="h-4 w-4 text-black" />
            </PrimaryButton>

            <GhostButton onClick={onDemo}>
              <Play className="h-4 w-4" />
              Watch Demo
            </GhostButton>
          </div>

          {/* <div className="mt-6 flex gap-6 text-sm">
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold text-white/90">100+</div>
              <div className="text-xs text-white/60">beta users</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold text-white/90">500+</div>
              <div className="text-xs text-white/60">secure deals</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold text-white/90">0.002</div>
              <div className="text-xs text-white/60">avg fee USD approx</div>
            </div>
          </div> */}
        </div>

        <div className="relative flex items-center justify-center">
          {/* 3D scene component */}
          <div className="relative w-full max-w-md aspect-[1.05] rounded-3xl p-0">
            <TracerGrid />
            {/* <HeroGridTracer /> */}
            {/* <BloomLine /> */}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Features grid ----------

function Features() {
  const features = [
    {
      title: "Reversible Payment",
      desc: "Send with confidence. Reverse if needed.",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      title: "AI Transaction Assistant",
      desc: "Natural language checks and scheduling.",
      icon: <Bot className="h-5 w-5" />,
    },
    {
      title: "Account Abstraction",
      desc: "Gasless, keyless onboarding for users.",
      icon: <KeySquare className="h-5 w-5" />,
    },
    {
      title: "SafetyNet Contacts",
      desc: "Trusted contacts can help recover access.",
      icon: <LifeBuoy className="h-5 w-5" />,
    },
    {
      title: "Time Locked & Recurring",
      desc: "Schedule salaries and subscriptions easily.",
      icon: <CalendarClock className="h-5 w-5" />,
    },
    {
      title: "Multi Token Support",
      desc: "ETH, USDC and more tokens supported.",
      icon: <Coins className="h-5 w-5" />,
    },
  ];
  return (
    <section id="features" className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-8">
          <Badge>Core innovations</Badge>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold">
            Everything you need for safe transfers
          </h2>
          <p className="mt-2 text-white/70 max-w-2xl mx-auto">
            A unified stack combining escrow, AI and account abstraction. Built
            for humans and trusted by builders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <GlassCard key={i} className="hover:scale-[1.01]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center text-emerald-300">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="text-sm text-white/70 mt-1">{f.desc}</p>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-300 cursor-pointer select-none">
                Learn more <ChevronIcon />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------- How it works with optional dispute ----------

function HowItWorks() {
  const steps = [
    {
      title: "Create Deal",
      desc: "Deposit funds into Bloom escrows using natural language or UI.",
      icon: <SendHorizontal className="h-6 w-6 text-emerald-300" />,
    },
    {
      title: "Deliver and Confirm",
      desc: "Buyer or recipient confirms delivery and funds release.",
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-300" />,
    },
    {
      title: "Dispute is optional",
      desc: "If something goes wrong, jurors review evidence and smart contract executes outcome.",
      icon: <Lock className="h-6 w-6 text-amber-300" />,
      optional: true,
    },
  ];
  return (
    <section id="how" className="py-16">
      <div className="mx-auto max-w-7xl px-4 text-center mb-8">
        <Badge>How it works</Badge>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold">
          Working with Bloom is easy as 1 2 3
        </h2>
        <p className="mt-2 text-white/70 max-w-xl mx-auto">
          Steps 1 and 2 are the main flow. Step 3 only happens when a dispute is
          opened.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className={
              "flex flex-col items-center gap-4 p-6 rounded-2xl " +
              (s.optional
                ? "bg-white/3 border border-amber-400/10 text-white/90"
                : "bg-white/4 border border-white/8")
            }
          >
            <div
              className={
                "h-16 w-16 flex items-center justify-center rounded-full " +
                (s.optional ? "bg-amber-400/12" : "bg-emerald-400/12")
              }
            >
              {s.icon}
            </div>
            <h3 className="text-lg font-semibold">{s.title}</h3>
            <p className="text-sm text-white/70 text-center max-w-sm">
              {s.desc}
            </p>
            {s.optional && (
              <span className="mt-2 text-xs text-amber-300/90">
                Optional step if dispute happens
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ---------- DemoChatAnimated simplified sandbox ----------

function DemoChatAnimated() {
  const [messages, setMessages] = useState<
    { id: number; who: "user" | "ai"; text: string }[]
  >([
    {
      id: 1,
      who: "ai",
      text: "Welcome to Bloom demo. Try typing a command like Send 0.05 ETH to @lanre",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(3);

  useEffect(() => {
    boxRef.current?.scrollTo({
      top: boxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  function simulateResponse(text: string) {
    setTyping(true);
    setTimeout(() => {
      const reply = generateDemoReply(text);
      setMessages((m) => [
        ...m,
        { id: idRef.current++, who: "ai", text: reply },
      ]);
      setTyping(false);
    }, 900 + Math.random() * 700);
  }

  function send() {
    if (!input.trim()) return;
    const t = input.trim();
    setMessages((m) => [...m, { id: idRef.current++, who: "user", text: t }]);
    setInput("");
    simulateResponse(t);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge>Live Demo</Badge>
            <div className="text-sm text-white/70">
              Play with simulated commands
            </div>
          </div>
          <div className="text-xs text-white/50">Simulated sandbox</div>
        </div>

        <div
          ref={boxRef}
          className="h-64 overflow-y-auto rounded-lg bg-gradient-to-b from-[#07080a] to-[#0b0d11] p-4 space-y-3"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                "flex items-start gap-3 " +
                (m.who === "user" ? "justify-end" : "justify-start")
              }
            >
              {m.who === "ai" && (
                <div className="h-8 w-8 rounded-full bg-emerald-300 flex items-center justify-center text-black">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={
                  "rounded-2xl p-3 max-w-[75%] text-sm " +
                  (m.who === "user"
                    ? "bg-emerald-400/20 text-white"
                    : "bg-white/5 text-white/90")
                }
              >
                {m.text}
              </div>
              {m.who === "user" && (
                <div className="h-8 w-8 rounded-full bg-emerald-400 flex items-center justify-center text-black">
                  <SendHorizontal className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-300 flex items-center justify-center text-black">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl p-3 bg-white/5 text-white/80 flex items-center gap-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce animation-delay-200">•</span>
                <span className="animate-bounce animation-delay-400">•</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3 items-center">
          <input
            aria-label="Type demo command"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Type a command like Send 0.05 ETH to @lanre"
            className="flex-1 rounded-xl border border-white/8 bg-[#071018] px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-emerald-300/30"
          />
          <button
            onClick={send}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-400/90 px-4 py-2 text-sm font-medium text-black"
          >
            Send
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

// small simulated reply generator for demo
function generateDemoReply(text: string) {
  const t = text.toLowerCase();
  if (t.includes("send") && t.includes("eth"))
    return "Ok. I scheduled 0.05 ETH. Funds will be held in escrow until confirmed.";
  if (t.includes("cancel") || t.includes("undo"))
    return "You can undo until the recipient claims. Undo window active.";
  if (t.includes("balance"))
    return "Your wallet shows 1.35 ETH and 200 USDC in supported balances.";
  return "That looks good. Bloom will verify details and prevent risky transfers. Want to create a deal now?";
}

// ---------- CTA section ----------

function CTASection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 text-center rounded-2xl bg-gradient-to-tr from-emerald-400/8 via-cyan-300/6 to-blue-300/6 p-10 border border-white/6">
        <h2 className="text-3xl md:text-4xl font-bold">
          Start your first deal today
        </h2>
        <p className="mt-2 text-white/70 max-w-2xl mx-auto">
          No crypto experience needed. Bloom handles the hard parts so you can
          focus on the work.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <PrimaryButton onClick={() => alert("Create Deal clicked")}>
            Create First Deal
          </PrimaryButton>
          <GhostButton onClick={() => alert("Docs link placeholder")}>
            Read Docs
          </GhostButton>
        </div>
      </div>
    </section>
  );
}

// ---------- Footer ----------

function Footer() {
  return (
    <footer className="mt-12 border-t border-white/6 bg-[#08090c]/40">
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <a href="#" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-emerald-400 via-cyan-400 to-blue-400" />
            <div>
              <div className="font-extrabold text-white/95">Bloom</div>
              <div className="text-xs text-white/60">
                Safe crypto escrow and AI assistant
              </div>
            </div>
          </a>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/90 mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>Wallet</li>
            <li>AI Assistant</li>
            <li>Escrow</li>
            <li>SafetyNet</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/90 mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>About</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/90 mb-3">
            Community
          </h4>
          <div className="flex items-center gap-3 text-white/60 mb-4">
            <a aria-label="Twitter" className="hover:text-white">
              <Twitter />
            </a>
            <a aria-label="GitHub" className="hover:text-white">
              <Github />
            </a>
            <a aria-label="LinkedIn" className="hover:text-white">
              <Linkedin />
            </a>
            <a aria-label="Newsletter" className="hover:text-white">
              <Mail />
            </a>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks. Newsletter subscription simulated.");
            }}
            className="flex gap-2"
          >
            <input
              aria-label="Email"
              type="email"
              placeholder="Your email"
              required
              className="flex-1 rounded-lg border border-white/6 bg-[#071018] px-3 py-2 text-sm outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-400 px-3 py-2 text-black text-sm font-semibold"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-white/50 border-t border-white/4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>© {new Date().getFullYear()} Bloom Labs. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <a className="text-white/60 hover:text-white">Privacy</a>
          <a className="text-white/60 hover:text-white">Terms</a>
          <a className="text-white/60 hover:text-white">Cookies</a>
        </div>
      </div>
    </footer>
  );
}

// ---------- Main landing page wrapper ----------

export default function BoomLanding() {
  const [showDemo, setShowDemo] = useState(false);
  const [tracerPaths, setTracerPaths] = useState<{ x: number; y: number }[][]>(
    []
  );
  const tracerCount = 1; // number of tracers
  const speed = 0.0005; // speed of tracers
  const margin = 50; // margin around screen

  useEffect(() => {
    const width = window.innerWidth - margin * 2;
    const height = window.innerHeight - margin * 2;

    // Define corners
    const corners = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];

    // Initialize tracers with offset positions
    const tracers = Array.from({ length: tracerCount }, (_, i) => ({
      index: 0,
      t: i / tracerCount,
      path: [] as { x: number; y: number }[],
    }));

    const animate = () => {
      tracers.forEach((tracer) => {
        const nextIndex = (tracer.index + 1) % corners.length;
        const start = corners[tracer.index];
        const end = corners[nextIndex];

        const x = start.x + (end.x - start.x) * tracer.t;
        const y = start.y + (end.y - start.y) * tracer.t;

        tracer.path.push({ x: x + margin, y: y + margin });
        if (tracer.path.length > 100) tracer.path.shift(); // trail length

        tracer.t += speed;
        if (tracer.t >= 1) {
          tracer.t = 0;
          tracer.index = nextIndex;
        }
      });

      setTracerPaths(tracers.map((t) => t.path));
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0c11] text-white relative antialiased">
      {/* <AmbientBackground /> */}
      <Header onCreate={() => alert("Create Deal flow placeholder")} />

      {/* Hero Section */}

      <Hero />

      {/* Other Sections */}
      <Features />
      <HowItWorks />

      <section id="demo" className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Live demo sandbox</h2>
              <p className="text-white/70">
                Try commands and see how Bloom would behave
              </p>
            </div>
            <div>
              <GhostButton onClick={() => setShowDemo((s) => !s)}>
                {showDemo ? "Hide" : "Open"} demo
              </GhostButton>
            </div>
          </div>

          {showDemo && <DemoChatAnimated />}
          {!showDemo && (
            <div className="rounded-2xl border border-white/6 bg-white/4 p-6 text-center">
              <p className="text-white/70">
                Click open demo to interact with the simulated assistant
              </p>
            </div>
          )}
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
