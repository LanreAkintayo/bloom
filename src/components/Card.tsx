import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>; // allow ref forwarding
}

// Wrap component in forwardRef
const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className = "" }, ref) => {
  return (
    <div
      ref={ref} // attach the ref here
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition hover:border-white/20 ${className}`}
    >
      {/* grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] bg-[length:18px_18px]" />
      {children}
    </div>
  );
});

Card.displayName = "Card"; // for dev tools
export default Card;
