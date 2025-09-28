// src/app/layout.tsx
import type { Metadata } from "next";
import Providers from "@/app/providers";
import "@/app/globals.css";

// optional metadata
export const metadata: Metadata = { title: "Bloom" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
