"use client";

import { Canvas, useFrame, extend, ThreeElements } from "@react-three/fiber"; // Import ThreeElements
import { Icosahedron, OrbitControls, shaderMaterial } from "@react-three/drei";
import { useRef } from "react";
import { motion } from "framer-motion";
import * as THREE from "three"; // Import THREE for TypeScript types

// --- Custom Gradient Material ---
const GradientMaterial = shaderMaterial(
  // Uniforms
  {
    u_size: 1.0,
    u_color1: new THREE.Color("#86efac"), // Bottom color
    u_color2: new THREE.Color("#38bdf8"), // Top color
  },
  // Vertex Shader
  `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float u_size;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    varying vec3 vPosition;

    void main() {
      // Map the Y position (from -size to +size) to a 0-1 range
      float t = (vPosition.y + u_size) / (2.0 * u_size);
      t = clamp(t, 0.0, 1.0); // Ensure it's in the 0-1 range

      // mix() interpolates between two colors
      vec3 color = mix(u_color1, u_color2, t);
      
      // Apply the final color with 0.8 opacity
      gl_FragColor = vec4(color, 0.8);
    }
  `
);

// This makes <gradientMaterial /> available as a JSX tag
extend({ GradientMaterial });

// --- FIX: Tell TypeScript about our new component ---
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // This merges the standard shaderMaterial props with our custom uniforms
      gradientMaterial: ThreeElements["shaderMaterial"] & {
        u_size: number;
        u_color1: THREE.Color;
        u_color2: THREE.Color;
        // wireframe & transparent are already part of ThreeElements["shaderMaterial"]
      };
    }
  }
}
// --- End of FIX ---

// --- Helper Component ---

interface RotatingWireframeProps {
  size: number;
  detail: number; // 'detail' prop added
}

function RotatingWireframeIcosahedron({ size, detail }: RotatingWireframeProps) {
   
  // We type the ref to let TypeScript know it's a 3D Mesh
  const meshRef = useRef<THREE.Mesh>(null);

  // Rotate the mesh on each frame
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001; // Slower rotation
      meshRef.current.rotation.y += 0.002; // Slower rotation
    }
  });

  return (
    // 'detail' is now used as the second argument
    <Icosahedron args={[size, detail]} ref={meshRef}>
      <meshBasicMaterial
        color="#38bdf8" // A nice emerald/light green color
        wireframe={true}
        transparent
        opacity={0.4}
      />

      {/* --- FIX: Use the GradientMaterial you defined --- */}
      {/* <gradientMaterial
        u_size={size} // Pass the size prop to the shader
        u_color1={new THREE.Color("#86efac")} // Emerald
        u_color2={new THREE.Color("#38bdf8")} // Sky Blue
        wireframe={true}
        transparent={true} // Required for opacity in the shader
      /> */}
    </Icosahedron>
  );
}

// --- Main Component ---

// Define the props for the main Sphere3D component
interface Sphere3DProps {
  size?: number; // Make 'size' an optional prop
  detail?: number; // Make 'detail' an optional prop
}

export default function Sphere3D({ size = 6, detail = 4 }: Sphere3DProps) {
  // We set default size of 4 and detail of 4

  // --- FIX: Set a fixed camera position ---
  // We adjust the camera's Z position based on the size
  // const cameraZ = size * 2.5; // <-- This was making the size look the same
  
  // Now, changing the 'size' prop will make the sphere look bigger or smaller
  const cameraZ = 10; // This is a fixed distance (4 * 2.5 = 10)

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative mx-auto aspect-square w-4/5 rounded-full overflow-hidden"
    >
      <Canvas camera={{ position: [0, 0, cameraZ], fov: 75 }}>
        <ambientLight intensity={0.9} />

        {/* Pass both size and detail props down */}
        <RotatingWireframeIcosahedron size={size} detail={detail} />

        {/* This component allows you to drag and rotate the camera */}
        <OrbitControls
          enableZoom={false} // Disables zooming with the scroll wheel
          enablePan={false} // Disables panning (moving the camera left/right)
          autoRotate={false} // We are already rotating the mesh
        />
      </Canvas>
    </motion.div>
  );
}