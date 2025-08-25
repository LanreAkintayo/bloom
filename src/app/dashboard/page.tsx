"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  SendHorizontal,
  Bot,
  CalendarClock,
  ShieldCheck,
  ChevronRight,
  Coins,
  Users,
  Bell,
  LifeBuoy,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  Sparkles,
  BarChart3,
  ArrowRight,
  Settings,
  CheckCircleIcon,
} from "lucide-react";
import { motion } from "framer-motion";

// --------------------------------------------------
// Tiny utilities
// --------------------------------------------------
const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-[120rem] px-4 sm:px-6 lg:px-8">
    {children}
  </div>
);

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

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/80 backdrop-blur">
    {children}
  </span>
);

// Background ambience
const Ambient = () => (
  <div className="pointer-events-none fixed inset-0 -z-10">
    <div className="absolute left-[-25%] top-[-10%] h-[34rem] w-[34rem] rounded-full bg-emerald-500/25 blur-[130px]" />
    <div className="absolute right-[-15%] top-[10%] h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-[160px]" />
    <div className="absolute bottom-[-20%] left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-emerald-600/20 blur-[180px]" />
  </div>
);

// --------------------------------------------------
// Hooks & helpers
// --------------------------------------------------
const useCountdown = (iso: string) => {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const t = new Date(iso).getTime();
    const id = setInterval(() => {
      const now = Date.now();
      const d = Math.max(0, t - now);
      const days = Math.floor(d / 86400000);
      const hours = Math.floor((d % 86400000) / 3600000);
      const minutes = Math.floor((d % 3600000) / 60000);
      const seconds = Math.floor((d % 60000) / 1000);
      setLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return left;
};

const formatFiat = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n
  );

// Sparkline component (no external charts)
const Sparkline = ({
  data,
  width = 220,
  height = 64,
}: {
  data: number[];
  width?: number;
  height?: number;
}) => {
  const { path, min, max } = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const step = width / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / span) * height;
      return `${x},${y}`;
    });
    return { path: `M${points.join(" L")}`, min, max };
  }, [data, width, height]);

  const last = data[data.length - 1];
  const first = data[0];
  const trendUp = last >= first;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="spark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#spark)" strokeWidth="2" />
      <circle
        cx={width}
        cy={(() => {
          const span = max - min || 1;
          return height - ((last - min) / span) * height;
        })()}
        r="3.5"
        fill={trendUp ? "#34d399" : "#ef4444"}
      />
    </svg>
  );
};

// Status chip
const StatusBadge = ({
  status,
}: {
  status: "completed" | "pending" | "cancelled";
}) => {
  const map = {
    completed: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      text: "Completed",
      cls: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
    },
    pending: {
      icon: <Clock className="h-3.5 w-3.5" />,
      text: "Pending",
      cls: "bg-yellow-500/10 text-yellow-300 border-yellow-400/20",
    },
    cancelled: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      text: "Cancelled",
      cls: "bg-red-500/10 text-red-300 border-red-400/20",
    },
  } as const;
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}
    >
      {s.icon}
      {s.text}
    </span>
  );
};

// --------------------------------------------------
// Demo data (replace with real data wiring later)
// --------------------------------------------------
const demoLine = [
  12, 12.5, 12.2, 12.9, 13.1, 12.8, 13.6, 13.9, 13.2, 14.1, 14.7, 15.2,
];

const RECENTS = [
  {
    id: "a1",
    kind: "send" as const,
    counterparty: "@Lanre",
    token: "ETH",
    amount: 0.2,
    ts: "2025-08-20T10:22:00Z",
    status: "completed" as const,
  },
  {
    id: "a2",
    kind: "receive" as const,
    counterparty: "@Bola",
    token: "USDC",
    amount: 150,
    ts: "2025-08-22T14:02:00Z",
    status: "completed" as const,
  },
  {
    id: "a3",
    kind: "undo" as const,
    counterparty: "0x123…09af",
    token: "ETH",
    amount: 1.0,
    ts: "2025-08-22T17:35:00Z",
    status: "cancelled" as const,
  },
  {
    id: "a4",
    kind: "claim" as const,
    counterparty: "@DevDAO",
    token: "SONIC",
    amount: 420,
    ts: "2025-08-23T09:15:00Z",
    status: "completed" as const,
  },
  {
    id: "a5",
    kind: "send" as const,
    counterparty: "@Jane",
    token: "USDC",
    amount: 50,
    ts: "2025-08-24T11:05:00Z",
    status: "pending" as const,
  },
];

const SCHEDULES = [
  {
    id: "s1",
    to: "@Lanre",
    token: "ETH",
    amount: 0.05,
    nextISO: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    freq: "Weekly",
  },
  {
    id: "s2",
    to: "@DesignGuild",
    token: "USDC",
    amount: 200,
    nextISO: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    freq: "Monthly",
  },
  {
    id: "s3",
    to: "@InfraPool",
    token: "SONIC",
    amount: 1000,
    nextISO: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    freq: "Daily",
  },
];

const ALERTS = [
  {
    id: "n1",
    type: "warning" as const,
    text: "Unclaimed transfer pending (0.10 ETH) for @Bola.",
  },
  {
    id: "n2",
    type: "error" as const,
    text: "Failed transfer due to gas sponsor timeout. Retrying…",
  },
  {
    id: "n3",
    type: "info" as const,
    text: "Insurance Pool payout available for TX #0x98…ee.",
  },
];

// components/DashboardBackground.tsx
function DashboardBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Top Left Glow */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

      {/* Top Right Glow */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

      {/* Bottom Left Glow */}
      <div className="absolute bottom-20 -left-20 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />

      {/* Bottom Right Glow */}
      <div className="absolute bottom-20 -right-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* Center Glow */}
      <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[120px]" />
    </div>
  )
}


// --------------------------------------------------
// Page
// --------------------------------------------------
export default function DashboardPage() {
  // portfolio totals (fake demo math)
  const portfolioUSD = useMemo(() => 8400, []);

  return (
    <main className="relative min-h-screen bg-[#0a0c11] text-white">
      <Ambient />
      <DashboardBackground />
      {/* Top utility bar (can be moved to layout if you have a global one) */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0c11]/70 backdrop-blur-xl">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8">
                <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-emerald-400 via-emerald-300 to-cyan-300" />
                <span className="absolute inset-[2px] rounded-lg bg-[#0a0c11]" />
                <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-emerald-400 blur-[2px]" />
              </div>
              <span className="text-sm font-extrabold tracking-widest text-white/90">
                BLOOM
              </span>
              <Badge>
                <Sparkles className="h-3.5 w-3.5" /> Dashboard
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Notifications"
                className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-white/80 hover:bg-white/10"
              >
                <Bell className="h-4.5 w-4.5" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10">
                <Settings className="h-4 w-4" /> Settings
              </button>
            </div>
          </div>
        </Container>
      </header>

      <Container>
        <div className="py-8 space-y-8">
          {/* ROW 1: Hero Summary */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Big Balance Card (70%) -> spans 2 columns */}
            <Card className="lg:col-span-2">
              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-white/50">
                    Total Portfolio
                  </p>
                  <div className="mt-1 flex items-end gap-3">
                    <h2 className="text-4xl font-extrabold">
                      {formatFiat(portfolioUSD)}
                    </h2>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                      +3.8% 7d
                    </span>
                  </div>

                  {/* token pills */}
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      <Wallet className="h-3.5 w-3.5 text-emerald-300" /> ETH ·
                      2.13
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      <Coins className="h-3.5 w-3.5 text-cyan-300" /> USDC ·
                      1,240
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />{" "}
                      SONIC · 9,500
                    </span>
                  </div>
                </div>

                {/* sparkline */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-widest text-white/50">
                    Balance trend
                  </p>
                  <div className="mt-2">
                    <Sparkline data={demoLine} width={260} height={72} />
                  </div>
                </div>
              </div>

              {/* glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
            </Card>

            {/* Profile Card (30%) */}
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400/20 to-cyan-400/20 text-emerald-300">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Welcome back</p>
                    <h3 className="text-lg font-semibold">Lanre Akintayo</h3>
                  </div>
                </div>
                <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10">
                  Manage Account
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/50">
                    Guardians
                  </p>
                  <p className="mt-1 text-xl font-bold">3</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/50">
                    Schedules
                  </p>
                  <p className="mt-1 text-xl font-bold">{SCHEDULES.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/50">
                    Claims
                  </p>
                  <p className="mt-1 text-xl font-bold">2</p>
                </div>
              </div>
            </Card>
          </div>

          {/* ROW 2: Activity & Quick Actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Activity (60%) */}
            <Card className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-300" />
                  <h4 className="text-sm font-semibold">Recent Activity</h4>
                </div>
                <a
                  href="/history"
                  className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:underline"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="divide-y divide-white/10">
                {RECENTS.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                        {r.kind === "send" && (
                          <SendHorizontal className="h-4 w-4 text-emerald-300" />
                        )}
                        {r.kind === "receive" && (
                          <Wallet className="h-4 w-4 text-cyan-300" />
                        )}
                        {r.kind === "undo" && (
                          <XCircle className="h-4 w-4 text-red-300" />
                        )}
                        {r.kind === "claim" && (
                          <ShieldCheck className="h-4 w-4 text-emerald-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="text-white/80 capitalize">
                            {r.kind}
                          </span>{" "}
                          {r.amount}
                          <span className="ml-1 text-white/60">
                            {r.token}
                          </span>{" "}
                          {r.kind === "send"
                            ? "to"
                            : r.kind === "receive"
                            ? "from"
                            : "•"}{" "}
                          {r.counterparty}
                        </p>
                        <p className="text-xs text-white/40">
                          {new Date(r.ts).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions (40%) */}
            <Card>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-emerald-300" /> Quick Actions
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <a
                  href="/send"
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 hover:bg-white/[0.08]"
                >
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <SendHorizontal className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold">Send Crypto</p>
                  <ChevronRight className="absolute right-3 top-3 h-4 w-4 text-white/40 transition group-hover:translate-x-0.5" />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/20 blur-2xl" />
                </a>
                <a
                  href="/chat"
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 hover:bg-white/[0.08]"
                >
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                    <Bot className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold">Chat with AI</p>
                  <ChevronRight className="absolute right-3 top-3 h-4 w-4 text-white/40 transition group-hover:translate-x-0.5" />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/20 blur-2xl" />
                </a>
                <a
                  href="/schedule"
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 hover:bg-white/[0.08]"
                >
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-300">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold">Schedule Payment</p>
                  <ChevronRight className="absolute right-3 top-3 h-4 w-4 text-white/40 transition group-hover:translate-x-0.5" />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-teal-500/20 blur-2xl" />
                </a>
                <a
                  href="/schedule"
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 hover:bg-white/[0.08]"
                >
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300">
                    <CheckCircleIcon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold">Check Claims</p>
                  <ChevronRight className="absolute right-3 top-3 h-4 w-4 text-white/40 transition group-hover:translate-x-0.5" />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-teal-500/20 blur-2xl" />
                </a>
              </div>
            </Card>
          </div>

          {/* ROW 3: Schedules & SafetyNet */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Upcoming Schedules (60%) */}
            <Card className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-emerald-300" />
                  <h4 className="text-sm font-semibold">Upcoming Schedules</h4>
                </div>
                <a
                  href="/schedule"
                  className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:underline"
                >
                  Manage <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="divide-y divide-white/10">
                {SCHEDULES.map((s) => (
                  <ScheduleRow key={s.id} {...s} />
                ))}
              </div>
            </Card>

            {/* SafetyNet Status (40%) */}
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4 text-emerald-300" />
                  <h4 className="text-sm font-semibold">SafetyNet Status</h4>
                </div>
                <a
                  href="/safetynet"
                  className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:underline"
                >
                  Configure <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Threshold</p>
                    <p className="text-xl font-bold">2 of 3 guardians</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                    Active
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  {[
                    { name: "Tayo", color: "bg-emerald-500/20" },
                    { name: "Ada", color: "bg-cyan-500/20" },
                    { name: "Mo", color: "bg-teal-500/20" },
                  ].map((g, i) => (
                    <div
                      key={i}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 ${g.color}`}
                    >
                      <span className="text-xs font-semibold text-white/80">
                        {g.name.slice(0, 2)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-white/60">
                  In case of lost access, any two guardians can approve recovery
                  to your new address.
                </p>
              </div>
            </Card>
          </div>

          {/* ROW 4: Notifications / Alerts (Full width) */}
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-300" />
              <h4 className="text-sm font-semibold">Notifications & Alerts</h4>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {ALERTS.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl border p-4 ${
                    n.type === "warning"
                      ? "border-yellow-400/20 bg-yellow-500/5"
                      : n.type === "error"
                      ? "border-red-400/20 bg-red-500/5"
                      : "border-cyan-400/20 bg-cyan-500/5"
                  }`}
                >
                  <p className="text-sm text-white/80">{n.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}

// --------------------------------------------------
// Child components
// --------------------------------------------------
function ScheduleRow({
  to,
  token,
  amount,
  nextISO,
  freq,
}: {
  to: string;
  token: string;
  amount: number | string;
  nextISO: string;
  freq: string;
}) {
  const left = useCountdown(nextISO);
  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
          <CalendarClock className="h-4 w-4 text-emerald-300" />
        </div>
        <div>
          <p className="text-sm">
            <span className="text-white/80">{amount}</span>
            <span className="ml-1 text-white/60">{token}</span>
            <span className="ml-2 text-white/50">→ {to}</span>
          </p>
          <p className="text-xs text-white/40">
            {freq} • Next: {new Date(nextISO).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
          ⏳ {left || "—"}
        </span>
        <a
          href="/schedule"
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
        >
          Manage <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
