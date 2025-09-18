"use client";

import { useState, useEffect, JSX } from "react";
import Link from "next/link";
import {
  Bot,
  ClipboardList,
  CreditCard,
  FileText,
  Goal,
  HandCoins,
  LayoutDashboard,
  SignpostBig,
  Users,
} from "lucide-react";
import ConnectButton from "./web3/ConnectButton";

type HeaderItem = {
  label: string;
  type: "link" | "dropdown" | "button";
  href?: string;
  dropdownItems?: { label: string; href: string }[];
  visible?: boolean;
};

const mobileIcons: Record<string, JSX.Element> = {
  Dashboard: <LayoutDashboard className="w-5 h-5" />,
  Deals: <ClipboardList className="w-5 h-5" />,
  Disputes: <SignpostBig className="w-5 h-5" />,
  Jurors: <Users className="w-5 h-5" />,
  Payments: <CreditCard className="w-5 h-5" />,
  "AI Assistant": <Bot className="w-5 h-5" />,
  "Buy BLM": <HandCoins className="w-5 h-5" />,
};

const defaultNavItems: HeaderItem[] = [
  { label: "Dashboard", type: "link", href: "/dashboard" },
  {
    label: "Deals",
    type: "dropdown",
    dropdownItems: [
      { label: "Create deal", href: "/escrow" },
      { label: "My deals", href: "/deals/mine" },
    ],
  },
  {
    label: "Disputes",
    type: "dropdown",
    dropdownItems: [
      { label: "Report dispute", href: "/dispute" },
      { label: "Active disputes", href: "/dispute" },
      { label: "My disputes", href: "/dispute" },
      { label: "Add Evidence", href: "/evidence" },
    ],
  },
  {
    label: "Jurors",
    type: "dropdown",
    dropdownItems: [
      { label: "Register as juror", href: "/register_juror" },
      { label: "Juror panel", href: "/juror" },
      { label: "Vote", href: "/vote" },
      // { label: "Rewards", href: "/jurors/rewards" },
    ],
  },
  { label: "Payments", type: "link", href: "/payments" },
  { label: "Ask BloomAI", type: "button" },
  { label: "Buy BLM", type: "button" },
];

export default function Header({
  navItems = defaultNavItems,
}: {
  navItems?: HeaderItem[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null
  );

  // Lock scroll and apply blur to page
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"; // prevent scroll
      document.body.classList.add("page-blur"); // add blur
    } else {
      document.body.style.overflow = "auto"; // restore scroll
      document.body.classList.remove("page-blur"); // remove blur
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "auto";
      document.body.classList.remove("page-blur");
    };
  }, [menuOpen]);
  return (
    <header className="header sticky top-0 z-50 border-b border-slate-800/30 bg-slate-900 backdrop-blur-lg shadow-md sm:px-5">
      <div className="w-full px-4 md:px-0 flex justify-between items-center h-14 md:h-16">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="relative h-7 w-7 md:h-8 md:w-8">
            <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-emerald-400 via-emerald-300 to-cyan-300" />
            <span className="absolute inset-[1.5px] rounded-lg bg-slate-950" />
            <span className="absolute left-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 blur-[2px]" />
          </div>
          <span className="text-sm md:text-base font-extrabold tracking-widest text-white/90">
            Bloom
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm text-white/70">
          {navItems
            .filter((item) => item.visible !== false)
            .map((item) => {
              if (item.type === "link") {
                return (
                  <Link
                    key={item.label}
                    href={item.href || "#"}
                    className="hover:text-white transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                );
              } else if (item.type === "dropdown") {
                const isOpen = openDropdown === item.label;
                return (
                  <div key={item.label} className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdown(isOpen ? null : item.label)
                      }
                      className="flex items-center gap-1 hover:text-white font-medium transition-colors"
                    >
                      {item.label}
                      <svg
                        className={`w-3 h-3 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isOpen && (
                      <div className="absolute flex flex-col bg-slate-900/95 text-white mt-1 rounded-md shadow-lg min-w-[180px] overflow-hidden border border-slate-800 z-50">
                        {item.dropdownItems?.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            className="block px-3 py-2 hover:bg-slate-800 text-sm transition-colors"
                            onClick={() => setOpenDropdown(null)} // close dropdown on click
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else if (item.type === "button") {
                const isBLM = item.label === "Buy BLM";
                const buttonStyle = isBLM
                  ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                  : "bg-cyan-500 hover:bg-cyan-400 text-white animate-pulse";
                return (
                  <button
                    key={item.label}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-all ${buttonStyle}`}
                  >
                    {item.label === "Ask BloomAI" && (
                      <Bot className="w-4 h-4" />
                    )}
                    {item.label}
                  </button>
                );
              }
            })}
        </nav>

        {/* Desktop Connect Wallet */}
          <ConnectButton />
        {/* <div className="hidden lg:flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow transition-all">
            Connect Wallet
          </button>
        </div> */}

        {/* Mobile Connect Wallet + Hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Always visible Connect Wallet button */}
          {/* <ConnectButton /> */}
          <button className="px-3 py-1 rounded-md font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow text-sm md:text-base transition-all whitespace-nowrap">
            Connect Wallet
          </button>

          {/* Hamburger menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-slate-800 focus:outline-none"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div>
          <div className="lg:hidden bg-slate-900/95 text-white border-t border-slate-800 z-50 px-4 py-3">
            {navItems
              .filter((item) => item.visible !== false)
              .map((item) => {
                if (item.type === "link") {
                  return (
                    <Link
                      key={item.label}
                      href={item.href || "#"}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded transition-colors"
                    >
                      {mobileIcons[item.label]}
                      {item.label}
                    </Link>
                  );
                } else if (item.type === "dropdown") {
                  const isOpen = openMobileDropdown === item.label;
                  return (
                    <div key={item.label} className="border-t border-slate-800">
                      <button
                        key={item.label}
                        onClick={() =>
                          setOpenMobileDropdown(isOpen ? null : item.label)
                        }
                        className="w-full flex justify-between items-center px-4 py-2 hover:bg-slate-800 rounded transition-colors font-medium"
                      >
                        <div className="flex items-center gap-2">
                          {mobileIcons[item.label]}
                          {item.label}
                        </div>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="flex flex-col bg-slate-900/95">
                          {item.dropdownItems?.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className="block px-6 py-2 hover:bg-slate-800 rounded text-sm transition-colors"
                              onClick={() => setMenuOpen(false)} // close mobile menu after selecting
                            >
                              <div className="flex space-x-2 items-center">
                                
                                <Goal className="w-4 h-4" />
                                <p>{sub.label}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                } else if (item.type === "button") {
                  const isBLM = item.label === "Buy BLM";
                  const buttonStyle = isBLM
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                    : "bg-cyan-500 hover:bg-cyan-400 text-white animate-pulse";

                  return (
                    <button
                      key={item.label}
                      className={`w-full text-left px-4 py-2 mt-3 flex items-center gap-2 rounded transition-all ${buttonStyle} mx-auto`}
                    >
                      {item.label === "Ask BloomAI" && (
                        <Bot className="w-5 h-5" />
                      )}
                      {item.label === "Buy BLM" && (
                        <CreditCard className="w-5 h-5" />
                      )}
                      {item.label}
                    </button>
                  );
                }
              })}
          </div>
        </div>
      )}
    </header>
  );
}
