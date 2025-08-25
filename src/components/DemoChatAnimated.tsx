import { useEffect, useState, useRef } from "react";
import { SendHorizontal, Bot, Badge } from "lucide-react";
import Card from "./Card";
import PrimaryButton from "./landing/PrimaryButton";

const chatFlow = [
  { user: "Send 0.05 ETH to @lanre every Friday", delay: 1200 },
  { ai: "Got it! I will schedule the transfer for Friday.", delay: 1800 },
  { user: "Can I cancel if needed?", delay: 1200 },
  { ai: "Yes! You can undo anytime within the safety window.", delay: 1800 },
];

type ChatMessage = { user?: string; ai?: string; delay: number };

export default function DemoChatAnimatedCard() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Intersection Observer to detect visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisible(true);
          else setVisible(false);
        });
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Chat animation effect
  useEffect(() => {
    if (!visible) {
      // Reset if scrolled out of view
      setMessages([]);
      setCurrentIndex(0);
      setTyping(false);
      return;
    }

    if (currentIndex >= chatFlow.length) return;

    const nextMessage = chatFlow[currentIndex];
    setTyping(true);

    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, nextMessage]);
      setTyping(false);
      setCurrentIndex((prev) => prev + 1);

      // Scroll to bottom
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, nextMessage.delay);

    return () => clearTimeout(timer);
  }, [currentIndex, visible]);

  return (
    <Card ref={containerRef} className="p-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
        <Badge>
          <Bot className="h-3.5 w-3.5" /> Live AI Demo
        </Badge>
      </div>

      {/* Chat Body */}
      <div ref={listRef} className="h-64 overflow-y-auto px-5 py-4 flex flex-col gap-2 bg-gradient-to-b from-[#0b0e13] to-[#0f1219]">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${msg.user ? "justify-end" : "justify-start"}`}
          >
            {/* Avatar */}
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${msg.user ? "bg-emerald-400" : "bg-teal-400"}`}>
              {msg.user ? <SendHorizontal className="h-4 w-4 text-black" /> : <Bot className="h-4 w-4 text-black" />}
            </div>

            {/* Message Bubble */}
            <div className={`p-3 rounded-2xl max-w-[75%] text-sm leading-relaxed ${msg.user ? "bg-emerald-400/20 text-white" : "bg-white/5 text-white/90"}`}>
              {msg.user ?? msg.ai}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-400">
              <Bot className="h-4 w-4 text-black" />
            </div>
            <div className="p-3 rounded-2xl bg-white/5 text-white flex items-center gap-1">
              <span className="animate-bounce">•</span>
              <span className="animate-bounce animation-delay-200">•</span>
              <span className="animate-bounce animation-delay-400">•</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Commands / Quick Hints */}
      <div className="px-5 py-3 border-t border-white/10 flex flex-wrap gap-2 bg-[#0b0e13]/50">
        {["Send 0.05 ETH to @lanre", "Undo last transfer", "Check my balance"].map((hint, idx) => (
          <button
            key={idx}
            className="px-3 py-1 rounded-full bg-emerald-400/20 text-white text-xs hover:bg-emerald-400/30 transition"
            onClick={() => {
              setMessages((prev) => [...prev, { user: hint, delay: 0 }]);
              setTyping(true);
              setTimeout(() => {
                setMessages((prev) => [...prev, { ai: "Simulated response for: " + hint, delay: 0 }]);
                setTyping(false);
                listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
              }, 1200);
            }}
          >
            {hint}
          </button>
        ))}
      </div>

      {/* Static Input + CTA */}
      <div className="flex items-center gap-2 border-t border-white/10 p-3">
        <input
          placeholder="Type a command..."
          disabled
          className="flex-1 rounded-xl border border-white/10 bg-[#0b0e13] px-3 py-2 text-sm text-white placeholder:text-white/40 cursor-not-allowed"
        />
        <PrimaryButton className="">
          Go to Full Chat <SendHorizontal className="h-4 w-4" />
        </PrimaryButton>
      </div>
    </Card>
  );
}
