"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  SendHorizontal,
  Plus,
  Search,
  Paperclip,
  Mic,
  Sparkles,
  Pin,
  Clock,
  CheckCircle2,
  XCircle,
  Undo2,
  Bell,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Chat page with a collapsible sidebar (chat-only).
 * - Desktop: starts in MINI mode (icons only) → hover expands to FULL, toggle can lock FULL
 * - Mobile: sidebar is CLOSED by default, hamburger slides in FULL over content
 *
 * Key UX decisions:
 * - Sidebar widths: MINI = 72px, FULL = 320px
 * - Local persistence: desktop mode remembers whether user prefers mini/full
 * - Accessible toggles and keyboard '/' focus for composer
 */

/* ------------------------------ Helpers ------------------------------ */
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

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

function clsx(...arr: (string | false | null | undefined)[]) {
  return arr.filter(Boolean).join(" ");
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const nid = () => Math.random().toString(36).slice(2);

/* ------------------------------ Demo data / types ------------------------------ */
type Author = "user" | "ai";
type MsgKind = "text" | "action" | "system";
type Status = "success" | "pending" | "error" | "info";

type Message = {
  id: string;
  author: Author;
  kind: MsgKind;
  text?: string;
  createdAt: number;
  action?: {
    type: "transfer" | "schedule" | "undo";
    summary: string;
    token?: "ETH" | "USDC" | "SONIC";
    amount?: number;
    counterparty?: string;
    scheduleAt?: string;
    status?: Status;
  };
};

type Conversation = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
  pinned?: boolean;
  unread?: number;
};

const demoConvos: Conversation[] = [
  {
    id: "c1",
    title: "AI • Transfers",
    preview: "Drafted 0.05 ETH → @lanre",
    updatedAt: Date.now() - 1000 * 60 * 1,
    pinned: true,
  },
  {
    id: "c2",
    title: "Weekly Salary Bot",
    preview: "Next: 0.1 ETH in 2 days",
    updatedAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: "c3",
    title: "Support",
    preview: "How to add guardians?",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    unread: 2,
  },
];

const initialMessages: Message[] = [
  {
    id: "m1",
    author: "ai",
    kind: "system",
    createdAt: Date.now() - 1000 * 60 * 60,
    text: "You're chatting with the Bloom AI. I can send/undo transfers, create schedules, and manage SafetyNet. Try: Send 0.05 ETH to @lanre with note 'thanks'.",
  },
  {
    id: "m2",
    author: "user",
    kind: "text",
    createdAt: Date.now() - 1000 * 60 * 40,
    text: "Schedule 0.1 ETH to @team every Friday at 9am",
  },
];

/* ------------------------------ UI: message components ------------------------------ */

function StatusPill({ status }: { status?: Status }) {
  if (!status) return null;
  const map: Record<Status, string> = {
    success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    pending: "border-yellow-400/30 bg-yellow-500/10 text-yellow-200",
    error: "border-red-400/30 bg-red-500/10 text-red-200",
    info: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        map[status]
      )}
    >
      {status}
    </span>
  );
}

function ActionCard({ action }: { action: NonNullable<Message["action"]> }) {
  const icon =
    action.type === "transfer" ? (
      <SendHorizontal className="h-5 w-5" />
    ) : action.type === "schedule" ? (
      <Clock className="h-5 w-5" />
    ) : (
      <Undo2 className="h-5 w-5" />
    );
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80">
          <span className="text-emerald-300">{icon}</span>
          <span className="capitalize">{action.type}</span>
        </div>
        <StatusPill status={action.status} />
      </div>
      <p className="text-sm text-white/90">{action.summary}</p>
      {action.type === "transfer" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/70">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
            <Pin className="h-3.5 w-3.5 text-emerald-300" /> {action.amount}{" "}
            {action.token}
          </span>
          {action.counterparty && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              To {action.counterparty}
            </span>
          )}
        </div>
      )}
      {action.type === "schedule" && action.scheduleAt && (
        <div className="mt-3 text-xs text-white/60">
          Next run: {new Date(action.scheduleAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.author === "user";
  return (
    <div
      className={clsx(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className={clsx(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-[0_0_20px_rgba(0,0,0,0.18)]",
          msg.kind === "action" && "p-0 bg-transparent shadow-none",
          isUser
            ? "bg-cyan-500/10 border border-cyan-400/20 text-cyan-50"
            : "bg-white/5 border border-white/10 text-white/90"
        )}
      >
        {msg.kind === "text" || msg.kind === "system" ? (
          <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
        ) : msg.kind === "action" && msg.action ? (
          <ActionCard action={msg.action} />
        ) : null}
        <div
          className={clsx(
            "mt-2 text-[10px]",
            isUser ? "text-cyan-200/70" : "text-white/50"
          )}
        >
          {new Date(msg.createdAt).toLocaleTimeString()}
        </div>
      </motion.div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
          <span className="text-[11px] font-bold">You</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ SidebarItem ------------------------------ */
function SidebarItem({
  c,
  active,
  mini,
  onClick,
}: {
  c: Conversation;
  active?: boolean;
  mini?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Open conversation ${c.title}`}
      title={mini ? c.title : undefined}
      className={clsx(
        "group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors",
        active
          ? "border-emerald-400/30 bg-emerald-500/10 border"
          : "border border-white/10 hover:bg-white/5"
      )}
    >
      <div
        className={clsx(
          "flex items-center gap-3 min-w-0",
          mini ? "justify-center w-full" : "flex-1"
        )}
      >
        <div
          className={clsx(
            "h-9 w-9 flex-shrink-0 rounded-xl grid place-items-center text-sm font-semibold",
            active
              ? "bg-emerald-500/20 text-emerald-200"
              : "bg-white/5 text-white/80"
          )}
        >
          {c.title
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </div>

        {!mini && (
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-semibold text-white/90">
                {c.title}
              </p>
              <span className="text-[10px] text-white/40">
                {timeAgo(c.updatedAt)}
              </span>
            </div>
            <p className="truncate text-xs text-white/50">{c.preview}</p>
          </div>
        )}
      </div>

      {!mini && (
        <div className="flex-shrink-0">
          {c.unread ? (
            <span className="inline-flex items-center justify-center rounded-full bg-cyan-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-200">
              {c.unread}
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-white/10 block" />
          )}
        </div>
      )}
    </button>
  );
}

/* ------------------------------ Toast ------------------------------ */
function Toast({ text, onClose }: { text: string; onClose: () => void }) {
  React.useEffect(() => {
    const id = setTimeout(onClose, 2000);
    return () => clearTimeout(id);
  }, [onClose]);
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="pointer-events-auto rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100 shadow-lg backdrop-blur"
    >
      {text}
    </motion.div>
  );
}

/* ------------------------------ Main Chat page ------------------------------ */
export default function ChatPage() {
  // conversations + messages
  const [convos, setConvos] = useState<Conversation[]>(demoConvos);
  const [activeId, setActiveId] = useState<string>(demoConvos[0].id);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [query, setQuery] = useState("");
  const [compose, setCompose] = useState("");
  const [toasts, setToasts] = useState<string[]>([]);

  // sidebar states:
  // - "closed" = mobile closed
  // - "full" = sidebar fully visible
  // - "mini" = desktop mini (icons / condensed)
  const [sidebarMode, setSidebarMode] = useState<"closed" | "mini" | "full">(
    "mini"
  );
  const [hoveringMini, setHoveringMini] = useState(false);

  const streamRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // detect initial mode by screen size, persist preference on desktop
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersFull = localStorage.getItem("bloom.chat.sidebarMode");
    if (window.innerWidth >= 1024) {
      // desktop default: mini unless user chose full
      setSidebarMode(prefersFull === "full" ? "full" : "mini");
    } else {
      setSidebarMode("closed");
    }

    const onResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarMode("closed");
      } else {
        const pref = localStorage.getItem("bloom.chat.sidebarMode") || "mini";
        setSidebarMode(pref === "full" ? "full" : "mini");
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // persist desktop preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 1024) {
      localStorage.setItem(
        "bloom.chat.sidebarMode",
        sidebarMode === "full" ? "full" : "mini"
      );
    }
  }, [sidebarMode]);

  // auto scroll to bottom on new messages
  useEffect(() => {
    streamRef.current?.scrollTo({
      top: streamRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  // keyboard "/" focuses composer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || e.key === "?") &&
        (document.activeElement as HTMLElement)?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredConvos = useMemo(() => {
    if (!query) return convos;
    const q = query.toLowerCase();
    return convos.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)
    );
  }, [convos, query]);

  function pushToast(t: string) {
    setToasts((s) => [...s, t]);
  }

  // message send + naive AI parsing (keeps your demo UX)
  function sendMessage() {
    const text = compose.trim();
    if (!text) return;
    const userMsg: Message = {
      id: nid(),
      author: "user",
      kind: "text",
      text,
      createdAt: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setCompose("");

    // naive parsing: produce a pending action to confirm/cancel
    const lower = text.toLowerCase();
    let ai: Message | null = null;
    if (lower.startsWith("send ") || lower.startsWith("transfer ")) {
      const amountMatch = text.match(/([0-9]*\.?[0-9]+)/);
      const tokenMatch = text.match(/\b(eth|usdc|sonic)\b/i);
      const toMatch = text.match(/to\s+(@?\w[\w.-]*)/i);
      const amount = amountMatch ? Number(amountMatch[1]) : undefined;
      const token = tokenMatch ? tokenMatch[1].toUpperCase() : "ETH";
      const who = toMatch ? toMatch[1] : "@unknown";
      ai = {
        id: nid(),
        author: "ai",
        kind: "action",
        createdAt: Date.now(),
        action: {
          type: "transfer",
          summary: `Proposed transfer: ${amount ?? "?"} ${token} → ${who}`,
          token: token as any,
          amount,
          counterparty: who,
          status: "pending",
        },
      };
    } else if (lower.startsWith("schedule ") || lower.includes("every ")) {
      ai = {
        id: nid(),
        author: "ai",
        kind: "action",
        createdAt: Date.now(),
        action: {
          type: "schedule",
          summary: `Schedule created: ${text}`,
          scheduleAt: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 3
          ).toISOString(),
          status: "info",
        },
      };
    } else if (lower.includes("undo")) {
      ai = {
        id: nid(),
        author: "ai",
        kind: "action",
        createdAt: Date.now(),
        action: {
          type: "undo",
          summary:
            "You can undo the last unclaimed transfer within the safety window",
          status: "info",
        },
      };
    } else {
      ai = {
        id: nid(),
        author: "ai",
        kind: "text",
        createdAt: Date.now(),
        text: "Got it. I can help with transfers, schedules, and SafetyNet. Try: ‘Send 0.05 ETH to @lanre’.",
      };
    }

    setTimeout(() => setMessages((m) => [...m, ai!]), 250);
  }

  function createNewChat() {
    const id = nid();
    const conv: Conversation = {
      id,
      title: "New Chat",
      preview: "Start by typing…",
      updatedAt: Date.now(),
      pinned: false,
    };
    setConvos((c) => [conv, ...c]);
    setActiveId(id);
    setMessages([
      {
        id: nid(),
        author: "ai",
        kind: "system",
        createdAt: Date.now(),
        text: "New chat created. Tip: /send, /schedule, /undo",
      },
    ]);
    pushToast("New chat created");
  }

  // confirm / cancel the latest action message (demo)
  function handleConfirmLatestAction() {
    const latestActionIndex = [...messages]
      .reverse()
      .findIndex((m) => m.kind === "action");
    if (latestActionIndex === -1) return;
    // update from end
    const idx = messages.length - 1 - latestActionIndex;
    setMessages((m: Message[]) =>
      m
        .map((mm, i) =>
          i === idx
            ? {
                ...mm,
                action: mm.action
                  ? { ...mm.action, status: "success" }
                  : undefined,
              }
            : mm
        )
        .concat({
          id: nid(),
          author: "ai",
          kind: "text",
          createdAt: Date.now(),
          text: "✅ Confirmed. Transaction prepared in escrow. Recipient may claim when ready.",
        })
    );
    pushToast("Action confirmed");
  }

  function handleCancelLatestAction() {
    const latestActionIndex = [...messages]
      .reverse()
      .findIndex((m) => m.kind === "action");
    if (latestActionIndex === -1) return;
    const idx = messages.length - 1 - latestActionIndex;
    setMessages((m: Message[]) =>
      m
        .map((mm, i) =>
          i === idx
            ? {
                ...mm,
                action: mm.action
                  ? { ...mm.action, status: "error" }
                  : undefined,
              }
            : mm
        )
        .concat({
          id: nid(),
          author: "ai",
          kind: "text",
          createdAt: Date.now(),
          text: "❌ Cancelled.",
        })
    );
    pushToast("Action cancelled");
  }

  const chips = [
    { label: "Send 0.05 ETH to @lanre", insert: "Send 0.05 ETH to @lanre" },
    {
      label: "Schedule 0.1 ETH every Friday 9am",
      insert: "Schedule 0.1 ETH to @team every Friday at 9am",
    },
    { label: "Undo last transfer", insert: "Undo last transfer" },
  ];

  /* Layout helpers */
  const MINI_W = 72;
  const FULL_W = 320;
  const isDesktop =
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true;
  const effectiveFull =
    sidebarMode === "full" || (sidebarMode === "mini" && hoveringMini);

  /* Active convo title */
  const activeTitle = convos.find((c) => c.id === activeId)?.title || "Chat";

  /* Simple auto-resize for textarea */
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handle = () => {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 220) + "px";
    };
    handle();
    el.addEventListener("input", handle);
    return () => el.removeEventListener("input", handle);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#0a0c11] text-white antialiased overflow-hidden">
      {/* Background cinematic glows (subtle) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] h-[36rem] w-[36rem] rounded-full bg-emerald-500/10 blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-8%] h-[32rem] w-[32rem] rounded-full bg-cyan-500/8 blur-[180px]" />
      </div>

      {/* Top controls (small header inside page; optional) */}
      <div className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0c11]/60 backdrop-blur-md">
        <Container className="py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* mobile hamburger */}
              <button
                aria-label="Toggle sidebar"
                className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                onClick={() =>
                  setSidebarMode((s) => (s === "closed" ? "full" : "closed"))
                }
              >
                {sidebarMode === "closed" ? (
                  <Menu className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>

              <div className="relative h-8 w-8">
                <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-emerald-400 via-emerald-300 to-cyan-300" />
                <span className="absolute inset-[2px] rounded-lg bg-[#0a0c11]" />
                <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-emerald-400 blur-[2px]" />
              </div>
              <div className="text-sm font-extrabold tracking-widest text-white/90">
                BLOOM
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80">
                <Bot className="h-3.5 w-3.5" /> Chat
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Notifications"
                className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-white/80 hover:bg-white/10"
              >
                <Bell className="h-4.5 w-4.5" />
              </button>
              <button
                aria-label="Settings"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 py-6">
          {/* Sidebar area */}
          <div className="relative">
            <AnimatePresence>
              {/* Desktop: show sidebar in mini or full; Mobile: only show when not closed */}
              {(sidebarMode !== "closed" ||
                (typeof window !== "undefined" &&
                  window.innerWidth >= 1024)) && (
                <>
                  {/* Mobile overlay when sidebar is open */}
                  {sidebarMode === "full" &&
                    typeof window !== "undefined" &&
                    window.innerWidth < 1024 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.45 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={() => setSidebarMode("closed")}
                        className="fixed inset-0 z-30 bg-black"
                      />
                    )}

                  <motion.aside
                    key="sidebar"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onMouseEnter={() => {
                      if (sidebarMode === "mini") setHoveringMini(true);
                    }}
                    onMouseLeave={() => {
                      setHoveringMini(false);
                    }}
                    className={clsx(
                      "z-40",
                      // position
                      typeof window !== "undefined" && window.innerWidth < 1024
                        ? "fixed left-4 top-[80px] bottom-6"
                        : "relative",
                      "pointer-events-auto"
                    )}
                  >
                    <motion.div
                      // animate width between mini / full. We animate the exact pixel width for crispness.
                      animate={{ width: effectiveFull ? FULL_W : MINI_W }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 28,
                      }}
                      className="rounded-3xl overflow-hidden border border-white/8 bg-white/2 shadow-lg"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {/* Sidebar content */}
                      <div className="h-full flex flex-col">
                        {/* header: search + toggle */}
                        <div className="p-3 border-b border-white/6 flex items-center gap-2">
                          {effectiveFull ? (
                            <>
                              <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                <input
                                  aria-label="Search chats"
                                  value={query}
                                  onChange={(e) => setQuery(e.target.value)}
                                  placeholder="Search chats"
                                  className="w-full rounded-xl border border-white/10 bg-[#0b0e13] pl-9 pr-3 py-2 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40"
                                />
                              </div>
                              {/* toggle mode button (desktop) */}
                              {typeof window !== "undefined" &&
                                window.innerWidth >= 1024 && (
                                  <button
                                    aria-label={
                                      sidebarMode === "full"
                                        ? "Switch to mini sidebar"
                                        : "Switch to full sidebar"
                                    }
                                    onClick={() =>
                                      setSidebarMode((s) =>
                                        s === "full" ? "mini" : "full"
                                      )
                                    }
                                    className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                                  >
                                    {sidebarMode === "full" ? (
                                      <ChevronLeft className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </button>
                                )}
                            </>
                          ) : (
                            <div className="flex w-full items-center justify-between">
                              {/* <div className="flex items-center gap-2">
                                <div className="h-9 w-9 grid place-items-center rounded-lg bg-white/5 text-white/80">
                                  C
                                </div>
                                <div className="text-sm font-semibold">
                                  Chats
                                </div>
                              </div> */}
                              {/* <div className="flex items-center gap-1">
                                <button
                                  aria-label="Open sidebar"
                                  onClick={() => setSidebarMode("full")}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div> */}
                            </div>
                          )}
                        </div>

                        {/* New chat + list */}
                        <div className="p-3 flex flex-col gap-3 h-full">
                          <div
                            className={clsx(
                              "flex items-center gap-3",
                              effectiveFull ? "" : "flex-col"
                            )}
                          >
                            <button
                              onClick={createNewChat}
                              className={clsx(
                                "inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 px-3 py-2 text-sm font-semibold",
                                effectiveFull
                                  ? "bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                                  : "bg-white/5 text-white/80"
                              )}
                            >
                              <Plus className="h-4 w-4" />
                              {effectiveFull && "New Chat"}
                            </button>

                            {effectiveFull && (
                              <div className="text-xs text-white/50 ml-auto">
                                Pinned
                              </div>
                            )}
                          </div>

                          {/* lists */}
                          <div className="flex-1 overflow-y-auto space-y-3 py-1">
                            {/* Pinned */}
                            {filteredConvos.filter((c) => c.pinned).length >
                              0 && (
                              <div>
                                {filteredConvos
                                  .filter((c) => c.pinned)
                                  .map((c) => (
                                    <SidebarItem
                                      key={c.id}
                                      c={c}
                                      active={c.id === activeId}
                                      mini={!effectiveFull}
                                      onClick={() => {
                                        setActiveId(c.id);
                                        if (
                                          typeof window !== "undefined" &&
                                          window.innerWidth < 1024
                                        )
                                          setSidebarMode("closed");
                                      }}
                                    />
                                  ))}
                              </div>
                            )}

                            {/* Recent */}
                            <div className="mt-2">
                              {effectiveFull && (
                                <div className="mb-2 text-[11px] uppercase tracking-widest text-white/40">
                                  Recent
                                </div>
                              )}
                              <div className="space-y-2">
                                {filteredConvos
                                  .filter((c) => !c.pinned)
                                  .map((c) => (
                                    <SidebarItem
                                      key={c.id}
                                      c={c}
                                      active={c.id === activeId}
                                      mini={!effectiveFull}
                                      onClick={() => {
                                        setActiveId(c.id);
                                        if (
                                          typeof window !== "undefined" &&
                                          window.innerWidth < 1024
                                        )
                                          setSidebarMode("closed");
                                      }}
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>

                          {/* footer quick info */}
                          <div className="text-xs text-white/50">
                            {effectiveFull ? (
                              "Escrow • AI • Schedules"
                            ) : (
                              <div className="text-center text-[11px]">
                                Bloom
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Chat content */}
          <div className="flex flex-1 flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">{activeTitle}</h2>
                  <p className="text-xs text-white/50">
                    AI assistant • Escrow • Schedules
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmLatestAction}
                  className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/15"
                >
                  Confirm Draft
                </button>
                <button
                  onClick={handleCancelLatestAction}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>

            <Card className="flex-1">
              <div
                ref={streamRef}
                className="relative z-10 h-[58vh] w-full space-y-4 overflow-y-auto p-4 sm:p-6 no-scrollbar"
              >
                {messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} />
                ))}
              </div>
            </Card>

            {/* Composer */}
            <div className="mt-4">
              <Card>
                <div className="relative z-10 p-3 sm:p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {chips.map((c) => (
                      <button
                        key={c.label}
                        onClick={() => setCompose(c.insert)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70 hover:bg-white/10"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* <button
                      className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                      aria-label="Attach"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button> */}

                    <div className="relative flex-1">
                      <textarea
                        ref={inputRef}
                        value={compose}
                        onChange={(e) => {
                          setCompose(e.target.value);
                          e.currentTarget.style.height = "auto"; // reset height
                          e.currentTarget.style.height =
                            e.currentTarget.scrollHeight + "px"; // grow
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        rows={1}
                        placeholder="Type a message"
                        className="w-full resize-none overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e13] px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/40"
                        aria-label="Message"
                      />
                    </div>

                    <button
                      className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                      aria-label="Voice"
                    >
                      <Mic className="h-4 w-4" />
                    </button>

                    <button
                      onClick={sendMessage}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/15"
                    >
                      <SendHorizontal className="h-4 w-4" /> Send
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
                    <div className="inline-flex items-center gap-2">
                      {/* <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                        <Sparkles className="h-3 w-3 text-emerald-300" /> Smart fill: mention people with @, tokens like ETH/USDC
                      </span> */}
                    </div>
                    {/* <div className="hidden sm:block">Press "/" to focus</div> */}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Container>

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
        <AnimatePresence>
          {toasts.map((t, i) => (
            <Toast
              key={`${t}-${i}`}
              text={t}
              onClose={() => setToasts((s) => s.filter((_, j) => j !== i))}
            />
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
