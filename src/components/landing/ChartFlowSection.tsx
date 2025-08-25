import { useRef } from "react";
import DemoChatAnimated from "@/components/DemoChatAnimated";
import PrimaryButton from "./PrimaryButton";
import Badge from "@/components/Badge";
import Image from "next/image";

export default function ChatFlowAnimated() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative py-16">
      <div
        ref={containerRef}
        className="container w-full mx-auto flex flex-col lg:flex-row items-start gap-12"
      >
        {/* Left: Chat */}
        <div className="relative lg:w-1/2">
          <div className="mb-4 flex items-center gap-3">
            <Badge>Chat Preview</Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <h3 className="text-2xl font-bold sm:text-3xl">
              Try the AI assistant
            </h3>
            <PrimaryButton className="flex items-center gap-2">
              Go to Chat Page
            </PrimaryButton>
          </div>
          <p className="mt-2 max-w-xl text-white/70">
            No wallet needed. This is a safe mock so you can feel the flow.
          </p>
          <div className="mt-5">
            <DemoChatAnimated />
          </div>
        </div>

        {/* Right: Animated Illustration */}
        <div className="relative lg:w-1/2 flex justify-center items-center">
          <div className="relative w-80 h-80 lg:w-[600px] lg:h-[600px]">
            {/* Floating main illustration */}
            <Image
              src="/images/chat-illustration.png"
              alt="Chat Illustration"
              fill
              className="relative animate-float"
            />

            {/* Floating decorative particles */}
            <div className="absolute -top-5 -left-5 w-6 h-6 bg-emerald-400/30 rounded-full animate-float-slow"></div>
            <div className="absolute bottom-10 right-10 w-4 h-4 bg-teal-400/30 rounded-full animate-float-fast"></div>
            <div className="absolute top-20 right-32 w-3 h-3 bg-emerald-400/20 rounded-full animate-float-slow"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
