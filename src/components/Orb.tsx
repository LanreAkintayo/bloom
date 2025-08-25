"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion } from "framer-motion";

export default function HeroOrb() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative mx-auto aspect-square w-4/5 rounded-full overflow-hidden"
    >
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2} />

        {/* Floating Orb */}
        <Sphere args={[1, 64, 64]} scale={1.2}>
          <MeshDistortMaterial
            color="#06b6d4"
            transparent
            opacity={0.6}
            roughness={0.1}
            metalness={0.2}
            distort={0.4}
            speed={2}
          />
        </Sphere>

        {/* Environment reflections */}
        <Environment preset="sunset" />

        {/* Glow Effect */}
        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0} luminanceSmoothing={0.9} />
        </EffectComposer>

        {/* Optional controls for debugging */}
        {/* <OrbitControls enableZoom={false} /> */}
      </Canvas>

      {/* Overlay content (like your shield + text) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-emerald-300">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-lg">
          {/* replace with your icon */}
          {/* <span className="font-bold tracking-wide">Escrow Safe</span> */}
        </div>
      </div>
    </motion.div>
  );
}





