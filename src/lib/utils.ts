import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Address } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const bloomLog = (...args: any[]) => console.log("[Bloom] ", ...args);

export const formatAddress = (address: string | Address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const inCurrencyFormat = (amount: string) => {
  const pretty = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
  }).format(Number(amount));

  return pretty;
};

export const formatTime = (timestamp: string | bigint): string => {
  if (!timestamp) return "";

  // convert to number (milliseconds)
  const ts = Number(timestamp) * 1000;
  const date = new Date(ts);

  // Format it to something readable
  return date.toLocaleString("en-US", {
    weekday: "short",  // e.g. Mon
    year: "numeric",   // e.g. 2025
    month: "short",    // e.g. Oct
    day: "numeric",    // e.g. 2
    hour: "2-digit",
    minute: "2-digit",
    // second: "2-digit",
    hour12: true,      // 12hr format, change to false for 24hr
  });
};

  export const formatCountdown = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };


  export function formatLargeNumber(num: bigint, decimals: number = 2): string {
  const number = Number(num);
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" }, // Thousand
    { value: 1e6, symbol: "M" }, // Million
    { value: 1e9, symbol: "B" }, // Billion
    { value: 1e12, symbol: "T" }, // Trillion
    { value: 1e15, symbol: "P" }, // Quadrillion
    { value: 1e18, symbol: "E" }, // Quintillion
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (number >= si[i].value) {
      break;
    }
  }
  return (number / si[i].value).toFixed(decimals).replace(rx, "$1") + si[i].symbol;
}
