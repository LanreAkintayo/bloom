"use client";

import { motion } from "framer-motion";
import Particles from "@tsparticles/react";
import { useEffect, useState } from "react";
import { loadSlim } from "@tsparticles/slim";

export default function Hero() {
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { tsParticles } = await import("@tsparticles/engine");
      await loadSlim(tsParticles);
      setEngineReady(true);
    })();
  }, []);

  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
      {/* Particle Background */}
      {engineReady && (
        <Particles
          id="tsparticles"
          options={{
            background: {
              color: "transparent",
            },
            fullScreen: {
              enable: true,
              zIndex: -1, // keep behind content
            },
            particles: {
              number: {
                value: 80,
              },
              color: {
                value: "#ffffff",
              },
              links: {
                enable: true,
                color: "#ffffff",
                distance: 150,
              },
              move: {
                enable: true,
                speed: 1,
              },
            },
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl"
        >
          <span className="animate-gradient bg-gradient-to-r from-indigo-400 via-pink-500 to-purple-500 bg-[length:200%_200%] bg-clip-text text-transparent">
            The Safer, Smarter Way to Move Crypto
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-6 text-lg text-gray-300 sm:text-xl"
        >
          Experience security, speed, and simplicity with next-gen blockchain
          solutions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="mt-8 flex justify-center space-x-4"
        >
          <button className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold shadow-lg transition hover:scale-105 hover:shadow-xl">
            Get Started
          </button>
          <button className="rounded-2xl border border-gray-500 px-6 py-3 font-semibold text-gray-300 transition hover:bg-gray-800/50 hover:text-white">
            Learn More
          </button>
        </motion.div>
      </div>
    </section>
  );
}
