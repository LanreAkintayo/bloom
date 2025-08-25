import { ArrowRight } from "lucide-react";

export default function PrimaryButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-300 px-5 py-3 text-sm font-bold text-black shadow-[0_0_0_0_rgba(16,185,129,0.6)] transition will-change-transform hover:-translate-y-0.5 hover:shadow-[0_0_40px_12px_rgba(6,182,212,0.35)] focus:outline-none ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </button>
  );
}
