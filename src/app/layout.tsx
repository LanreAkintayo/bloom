"use client"

// src/app/layout.tsx
// import type { Metadata } from "next";
import Providers from "@/app/providers";
import "@/app/globals.css";
import Header from "@/components/Header";
import useDefi from "@/hooks/useDefi";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import DeFiLoader from "./loader";

// export const metadata: Metadata = { title: "Bloom" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 

  return (
    <html lang="en">
      <body>
        {/* <Header /> */}
        {/* <DeFiLoader /> */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
