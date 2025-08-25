const GlowRing = ({ className = "" }: { className?: string }) => (
  <div
    className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_50%_0%,rgba(16,185,129,0.12),transparent),radial-gradient(40rem_20rem_at_80%_100%,rgba(6,182,212,0.10),transparent)] ${className}`}
  />
);



GlowRing.displayName = "GlowRing"; // for dev tools
export default GlowRing;