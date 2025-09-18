// src/app/layout.tsx
import type { Metadata } from "next";
import Providers from "@/app/providers";
import "@/app/globals.css";
import Header from "@/components/Header";


export const metadata: Metadata = { title: "Bloom" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* <Header /> */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
