// HeroGridTracer.tsx
"use client";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";

function GridLines() {
  const lines = useMemo(() => {
    const group: THREE.Object3D[] = [];
    const size = 10;
    const divisions = 20;
    const step = size / divisions;

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color("cyan"),
      transparent: true,
      opacity: 0.15,
    });

    for (let i = -size / 2; i <= size / 2; i += step) {
      const points1 = [new THREE.Vector3(i, -size / 2, 0), new THREE.Vector3(i, size / 2, 0)];
      const points2 = [new THREE.Vector3(-size / 2, i, 0), new THREE.Vector3(size / 2, i, 0)];

      const geo1 = new THREE.BufferGeometry().setFromPoints(points1);
      const geo2 = new THREE.BufferGeometry().setFromPoints(points2);

      group.push(new THREE.Line(geo1, material));
      group.push(new THREE.Line(geo2, material));
    }

    return group;
  }, []);

  return <group>{lines.map((l, i) => <primitive key={i} object={l} />)}</group>;
}

// function Tracer() {
//   const lineRef = useRef<THREE.Line>(null);
//   const headRef = useRef<THREE.Mesh>(null);
//   const [pos, setPos] = useState([0, 0]);
//   const [target, setTarget] = useState([1, 0]);
//   const progress = useRef(0);

//   useFrame((_, delta) => {
//     progress.current += delta * 0.5; // speed

//     if (progress.current >= 1) {
//       setPos(target);
//       const dirs = [
//         [1, 0],
//         [-1, 0],
//         [0, 1],
//         [0, -1],
//       ];
//       const dir = dirs[Math.floor(Math.random() * dirs.length)];
//       setTarget([pos[0] + dir[0], pos[1] + dir[1]]);
//       progress.current = 0;
//     }

//     const x = THREE.MathUtils.lerp(pos[0], target[0], progress.current);
//     const y = THREE.MathUtils.lerp(pos[1], target[1], progress.current);

//     if (lineRef.current) {
//       const points = [new THREE.Vector3(pos[0], pos[1], 0), new THREE.Vector3(x, y, 0)];
//       lineRef.current.geometry.setFromPoints(points);
//     }

//     if (headRef.current) {
//       headRef.current.position.set(x, y, 0);
//     }
//   });

//   return (
//     <>
//       <line ref={lineRef}>
//         <bufferGeometry />
//         <lineBasicMaterial color={"cyan"} linewidth={2} />
//       </line>
//       <mesh ref={headRef}>
//         <sphereGeometry args={[0.08, 16, 16]} />
//         <meshBasicMaterial color={"cyan"} emissive={"cyan"} />
//       </mesh>
//     </>
//   );
// }

export default function HeroGridTracer() {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 60, position: [0, 0, 100] }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["transparent"]} />
      <GridLines />
      {/* <Tracer /> */}
    </Canvas>
  );
}
