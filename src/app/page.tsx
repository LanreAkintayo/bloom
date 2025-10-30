"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Network,
  Users,
  Rocket,
  Cpu,
  KeySquare,
  Globe2,
  Lock,
  Activity,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ChevronRight,
  Bot,
  Undo2,
  Clock,
  CalendarClock,
  Coins,
  Wallet,
  XCircle,
  CheckCircle2,
  AlarmClock,
  Sparkles,
  BadgeCheck,
  SendHorizontal,
  PlayCircle,
  BarChart3,
  BookOpen,
  LifeBuoy,
} from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import HeroOrb from "@/components/Orb";
import Hero from "@/components/Hero";
import DemoChatAnimated from "@/components/DemoChatAnimated";
import PrimaryButton from "@/components/landing/PrimaryButton";
import Badge from "@/components/Badge";
import ChartFlowSection from "@/components/landing/ChartFlowSection";

// --------------------------------------------------
// Tailwind helper atoms
// --------------------------------------------------
const Container = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`mx-auto w-full max-w-[120rem] px-4 sm:px-6 lg:px-8 ${className}`}
  >
    {children}
  </div>
);

const Section = ({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => (
  <section id={id} className={`relative py-16 sm:py-20 ${className}`}>
    {children}
  </section>
);

const GhostButton = ({ children }: { children: React.ReactNode }) => (
  <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10">
    {children}
  </button>
);

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition hover:border-white/20 ${className}`}
  >
    {/* grid overlay */}
    <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] bg-[length:18px_18px]" />
    {children}
  </div>
);

// --------------------------------------------------
// Decorative elements
// --------------------------------------------------
const Ambient = () => (
  <div className="pointer-events-none fixed inset-0 -z-10">
    <div className="absolute left-[-20%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-emerald-500/25 blur-[140px]" />
    <div className="absolute right-[-15%] top-[20%] h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-[160px]" />
    <div className="absolute bottom-[-20%] left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-emerald-600/20 blur-[180px]" />
  </div>
);

const GlowRing = ({ className = "" }: { className?: string }) => (
  <div
    className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_50%_0%,rgba(16,185,129,0.12),transparent),radial-gradient(40rem_20rem_at_80%_100%,rgba(6,182,212,0.10),transparent)] ${className}`}
  />
);

// --------------------------------------------------
// Small utilities
// --------------------------------------------------
const useCountdown = (targetISO: string) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  useEffect(() => {
    const target = new Date(targetISO).getTime();
    const id = setInterval(() => {
      const now = Date.now();
      const d = Math.max(0, target - now);
      const days = Math.floor(d / (1000 * 60 * 60 * 24));
      const hours = Math.floor((d / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((d / (1000 * 60)) % 60);
      const seconds = Math.floor((d / 1000) % 60);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(id);
  }, [targetISO]);
  return timeLeft;
};

const steps = [
  {
    icon: <SendHorizontal className="h-5 w-5 text-emerald-300" />,
    title: "Say It",
    desc: "'Send 0.05 ETH to @lanre every Friday.' Natural language, no friction.",
  },
  {
    icon: <SendHorizontal className="h-5 w-5 text-emerald-300" />,
    title: "Say It",
    desc: "'Send 0.05 ETH to @lanre every Friday.' Natural language, no friction.",
  },
  {
    icon: <Lock className="h-5 w-5 text-emerald-300" />,
    title: "Locked & Loaded",
    desc: "Funds stay safe until executed — with a window for undoing mistakes.",
  },
  {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-300" />,
    title: "Claim It or Bin It",
    desc: "Recipient receives when ready, or you cancel if needed.",
  },
];

// --------------------------------------------------
// Page
// --------------------------------------------------
export default function Page() {
  const countdown = useCountdown(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
  );

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  if (inView) controls.start("visible");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0c11] text-white antialiased">
      <Ambient />

      {/* NAVBAR */}
      <header className="header sticky top-0 z-50 border-b border-slate-800/30 bg-slate-900 backdrop-blur-lg shadow-md sm:px-5">
        <Container>
          <nav className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8">
                <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-emerald-400 via-emerald-300 to-cyan-300" />
                <span className="absolute inset-[2px] rounded-lg bg-[#0a0c11]" />
                <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-emerald-400 blur-[2px]" />
              </div>
              <span className="text-sm font-extrabold tracking-widest text-white/90">
                Bloom
              </span>
            </div>

            <ul className="hidden items-center gap-7 text-sm text-white/70 md:flex">
              <li className="hover:text-white">
                <a href="#features">Features</a>
              </li>
              <li className="hover:text-white">
                <a href="#how">How it works</a>
              </li>
              <li className="hover:text-white">
                <a href="#security">Security</a>
              </li>
              <li className="hover:text-white">
                <a href="#roadmap">Roadmap</a>
              </li>
              <li className="hover:text-white">
                <a href="#demo">Demo</a>
              </li>
              <li className="hover:text-white">
                <a href="#news">News</a>
              </li>
            </ul>

            <div className="flex items-center gap-3">
              {/* <GhostButton>Log in</GhostButton> */}
              {/* <PrimaryButton>Get Started</PrimaryButton> */}

              <Link href="/deals/create" className="block">
                <Button className="w-full bg-cyan-800 hover:bg-cyan-600/30 text-white/70 flex items-center gap-2">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </Container>
      </header>

      {/* HERO */}
      {/* <Hero /> */}
      <Section className="pb-10 pt-16 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        {/* <GlowRing /> */}
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div className="relative z-10">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <Badge>Secure • AI-Powered • Gasless</Badge>
                <Badge>Non‑custodial by design</Badge>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl"
              >
                <span
                  className="animate-gradient bg-gradient-to-r 
  from-emerald-300 via-cyan-400 to-blue-500 
  bg-clip-text text-transparent bg-[length:200%_200%]"
                >
                  The Safer, Smarter Way to Move Crypto
                </span>
              </motion.h1>

              <p className="mt-4 max-w-xl text-white/70">
                Escrow protection, an intelligent AI assistant, and account
                abstraction come together to make crypto transfers safe,
                intuitive, and undoable — without sacrificing decentralization.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <PrimaryButton>
                  Watch Demo <PlayCircle className="h-4 w-4" />
                </PrimaryButton>
                <GhostButton>
                  Read the Docs <BookOpen className="h-4 w-4" />
                </GhostButton>
              </div>

              {/* Hero KPIs */}
              {/* <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[{ label: "Avg. Fee", value: "~$0.002" }, { label: "Undo Window", value: "Until claimed" }, { label: "Supported", value: "ETH • USDC • SONIC" }].map((k) => (
                  <Card key={k.label} className="p-4">
                    <p className="text-[10px] uppercase tracking-widest text-white/50">{k.label}</p>
                    <p className="mt-1 text-lg font-bold">{k.value}</p>
                  </Card>
                ))}
              </div> */}
            </div>

            {/* Right visual */}
            <div className="relative">
              <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

              <HeroOrb />
            </div>
          </div>
        </Container>
      </Section>

      {/* PROBLEM → SOLUTION */}
      <Section className="pb-10 pt-16 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <Container>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 ">
            <Card>
              <span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-red-200/90 backdrop-blur transition hover:bg-red-400/20">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Problem
              </span>
              <h3 className="mt-3 text-2xl font-bold">
                Crypto is powerful — and unforgiving
              </h3>
              <ul className="mt-4 space-y-3 text-white/70">
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 text-red-400" />{" "}
                  Irreversible mistakes: one wrong address can burn funds
                  forever.
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 text-red-400" /> Onboarding
                  friction: seed phrases and gas fees block adoption.
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 text-red-400" /> No safety
                  net: recovery in emergencies is rare or impossible.
                </li>
              </ul>
            </Card>
            <Card>
              <Badge>Solution</Badge>
              <h3 className="mt-3 text-2xl font-bold">
                Bloom adds an intelligent safety layer
              </h3>
              <ul className="mt-4 space-y-3 text-white/80">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />{" "}
                  Escrow with Undo: cancel unclaimed transfers safely.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />{" "}
                  AI Assistant: catches risky patterns and automates scheduling.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />{" "}
                  Account Abstraction: gasless, keyless, non-custodial
                  onboarding.
                </li>
              </ul>
            </Card>
          </div>
        </Container>
      </Section>

      {/* FEATURE GRID */}
      <Section
        id="features"
        className="pb-10 pt-16 bg-gradient-to-br from-slate-900 via-slate-950 to-black"
      >
        <Container>
          <div className="mb-8 text-center">
            <Badge>Core Innovations</Badge>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Everything you need for safe, effortless transfers
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/65">
              A unified stack that merges escrow, AI, and account abstraction —
              designed for humans, trusted by crypto-natives.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "Reversible Payment",
                desc: "Send with confidence. If you sent to the wrong address, simply reverse the payment.",
              },
              {
                icon: <Bot className="h-5 w-5" />,
                title: "AI Transaction Assistant",
                desc: "Type naturally. Bloom checks risks, confirms details, and automates follow-ups.",
              },
              {
                icon: <KeySquare className="h-5 w-5" />,
                title: "Account Abstraction",
                desc: "Gasless, keyless onboarding with social login — fully non-custodial.",
              },
              {
                icon: <LifeBuoy className="h-5 w-5" />,
                title: "SafetyNet Contacts",
                desc: "Designate trusted contacts to help recover access or release funds in emergencies.",
              },
              {
                icon: <CalendarClock className="h-5 w-5" />,
                title: "Time-Locked & Recurring",
                desc: "Schedule salaries and subscriptions with precise release controls.",
              },
              {
                icon: <Coins className="h-5 w-5" />,
                title: "Multi-Token Support",
                desc: "Supports major digital assets, with more to be added",
              },
            ].map((f, i) => (
              <Card key={i} className="p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-white/70">{f.desc}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-300/90">
                  Learn more <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="how" className="py-16 md:py-20 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-56 h-56 md:w-72 md:h-72 bg-emerald-500/20 rounded-full blur-3xl top-[-20%] left-[-10%] animate-pulseSlow"></div>
          <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-teal-400/10 rounded-full blur-3xl bottom-[-20%] right-[-10%] animate-pulseSlow"></div>
        </div>

        <Container className="relative z-10">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <Badge>How it works</Badge>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Working With Bloom Is Easy As 1-2-3
            </h2>
            <p className="mt-4 text-white/70 max-w-md sm:max-w-xl mx-auto text-sm sm:text-base">
              Follow these simple steps and see how Bloom secures and manages
              your transactions with full transparency.
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col items-center gap-12 md:flex-row md:justify-between relative">
            {[
              {
                icon: (
                  <SendHorizontal className="h-6 w-6 md:h-8 md:w-8 text-emerald-400" />
                ),
                title: "Say It",
                desc: "‘Send 0.05 ETH to @lanre every Friday.’ Natural language, zero friction.",
              },
              {
                icon: (
                  <Lock className="h-6 w-6 md:h-8 md:w-8 text-emerald-400" />
                ),
                title: "Secured in Escrow",
                desc: "Funds remain safe until accepted, with a safety window to correct mistakes.",
              },
              {
                icon: (
                  <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-emerald-400" />
                ),
                title: "Pocket It or Scrap It",
                desc: "Recipients receive funds when ready. Full control and transparency maintained.",
              },
            ].map((step, i, steps) => (
              <div
                key={i}
                className="flex flex-col items-center text-center relative group"
              >
                {/* Icon Container */}
                <div className="flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-full bg-emerald-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] mb-3 md:mb-4 transition-transform duration-300 group-hover:scale-105">
                  {step.icon}
                </div>

                {/* Step Title */}
                <h3 className="text-base sm:text-lg md:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="mt-1 text-xs sm:text-sm md:text-base text-white/60 max-w-[220px] sm:max-w-xs md:max-w-xs">
                  {step.desc}
                </p>

                {/* Connector for Mobile (Vertical Dots) */}
                {i < steps.length - 1 && (
                  <div className="flex flex-col items-center mt-4 md:hidden">
                    <div className="w-0.5 h-6 bg-emerald-400/50 rounded-full animate-pulse"></div>
                  </div>
                )}

                {/* Connector Line for Desktop */}
                {i < steps.length - 1 && (
                  <svg className="hidden md:block absolute top-10 right-[-50%] w-1/2 h-6 overflow-visible">
                    <path
                      d="M0 3 C50 0 50 6 100 3"
                      stroke="url(#gradientConnector)"
                      strokeWidth="2"
                      fill="transparent"
                      strokeDasharray="4 2"
                    />
                    <defs>
                      <linearGradient
                        id="gradientConnector"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* LIVE DEMO */}
      <ChartFlowSection />

      {/* NEWSLETTER */}
      <Section className="pt-4">
        <Container>
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
            <h3 className="text-xl font-semibold">Stay in the loop</h3>
            <p className="mt-1 text-sm text-white/60">
              Product releases, ecosystem highlights, and invites — straight to
              your inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex flex-col items-center gap-3 sm:flex-row"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full flex-1 rounded-xl border border-white/10 bg-[#0b0e13] px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40"
              />
              <PrimaryButton>Subscribe</PrimaryButton>
            </form>
            <p className="mt-2 text-xs text-white/40">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </Container>
      </Section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12">
        <Container>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white/80">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>Wallet</li>
                <li>AI Assistant</li>
                <li>Escrow</li>
                <li>SafetyNet</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white/80">
                Developers
              </h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>Docs</li>
                <li>SDKs</li>
                <li>Examples</li>
                <li>Audit</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white/80">
                Ecosystem
              </h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>Projects</li>
                <li>Partners</li>
                <li>Validators</li>
                <li>Service Providers</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white/80">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>About</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white/80">
                Community
              </h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="inline-flex items-center gap-2">
                  <Twitter className="h-4 w-4" /> Twitter
                </li>
                <li className="inline-flex items-center gap-2">
                  <Github className="h-4 w-4" /> GitHub
                </li>
                <li className="inline-flex items-center gap-2">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </li>
                <li className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Newsletter
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
            <p>© {new Date().getFullYear()} Bloom Labs. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Cookies</span>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
}
