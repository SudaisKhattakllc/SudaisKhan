// ============================================================
//  AboutSection.tsx  —  R3F Pixel Dispersion Background
//  Drop-in replacement for your existing AboutSection.
//
//  INSTALL before using:
//    npm install three @react-three/fiber @react-three/drei
//
//  In next.config.js uncomment:
//    transpilePackages: ['three', '@react-three/fiber', '@react-three/drei']
// ============================================================

"use client";

import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import styles from "./AboutSection.module.css";

// ─── Constants ────────────────────────────────────────────────
const SKILLS = [
  "React", "TypeScript", "Three.js", "Figma",
  "Motion", "Node.js", "Postgres", "WebGL",
  "Branding", "Next.js", "R3F", "GLSL",
];

const STATS = [
  { num: "06+", label: "Years of professional experience" },
  { num: "48",  label: "Projects shipped globally"        },
  { num: "32",  label: "Satisfied clients worldwide"      },
  { num: "12",  label: "Design awards received"           },
];

// ─────────────────────────────────────────────────────────────
//  PIXEL FIELD  — instanced mesh of tiny squares that:
//    • Float in a layered 3D grid at rest
//    • Burst / disperse on mount with spring physics
//    • Drift with slow sinusoidal noise
//    • React to mouse proximity (push away)
//    • Some squares are bright "highlight" pixels
// ─────────────────────────────────────────────────────────────
const COUNT = 420;

function PixelField({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const { viewport } = useThree();

  // Per-instance base data (generated once)
  const particles = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const col = i % 3; // layer depth bucket
      return {
        // spread across viewport
        ox: (Math.random() - 0.5) * viewport.width  * 1.8,
        oy: (Math.random() - 0.5) * viewport.height * 1.8,
        oz: col * 1.2 - 1.2,
        // random per-particle drift parameters
        freqX: 0.18 + Math.random() * 0.22,
        freqY: 0.14 + Math.random() * 0.2,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        ampX:   0.08 + Math.random() * 0.18,
        ampY:   0.06 + Math.random() * 0.14,
        // burst offset (disperse from centre on mount)
        burstX: (Math.random() - 0.5) * 8,
        burstY: (Math.random() - 0.5) * 8,
        // size variation
        scale:  0.025 + Math.random() * 0.055,
        // brightness tier
        bright: Math.random() > 0.82,
        // rotation speed
        rotSpeed: (Math.random() - 0.5) * 0.4,
      };
    });
  }, [viewport]);

  // Colour palette — whites + near-whites
  const colors = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    particles.forEach((p, i) => {
      const v = p.bright ? 1.0 : 0.08 + Math.random() * 0.28;
      arr[i * 3]     = v;
      arr[i * 3 + 1] = v;
      arr[i * 3 + 2] = v;
    });
    return arr;
  }, [particles]);

  // Attach colour attribute after mesh mounts
  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.geometry.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(colors, 3)
    );
  }, [colors]);

  // Burst progress 0→1 over ~1.8s
  const burst = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const rotations = useRef(particles.map(() => Math.random() * Math.PI * 2));

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // ease out burst 0→1
    burst.current = Math.min(burst.current + 0.012, 1);
    const b = 1 - Math.pow(1 - burst.current, 3); // cubic ease-out

    // mouse world coords (normalised device → world)
    const [mx, my] = mouse.current;
    const mwx = mx * viewport.width  * 0.5;
    const mwy = my * viewport.height * 0.5;

    particles.forEach((p, i) => {
      // Sinusoidal drift
      const dx = Math.sin(t * p.freqX + p.phaseX) * p.ampX;
      const dy = Math.cos(t * p.freqY + p.phaseY) * p.ampY;

      // Settle position (lerp from burst offset → rest)
      const x = p.ox + p.burstX * (1 - b) + dx;
      const y = p.oy + p.burstY * (1 - b) + dy;
      const z = p.oz + Math.sin(t * 0.3 + i) * 0.12;

      // Mouse repulsion
      const distX = x - mwx;
      const distY = y - mwy;
      const dist  = Math.sqrt(distX * distX + distY * distY);
      const repel = dist < 1.4 ? (1.4 - dist) / 1.4 : 0;
      const fx = x + (distX / (dist + 0.001)) * repel * 0.7;
      const fy = y + (distY / (dist + 0.001)) * repel * 0.7;

      // Slow rotation
      rotations.current[i] += p.rotSpeed * 0.008;

      dummy.position.set(fx, fy, z);
      dummy.rotation.z = rotations.current[i];
      const s = p.scale * (1 + repel * 0.5);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial vertexColors transparent opacity={0.9} />
    </instancedMesh>
  );
}

// ─────────────────────────────────────────────────────────────
//  FLOATING GLASS CUBES  — 5 larger semi-transparent cubes
//  that rotate slowly and catch light
// ─────────────────────────────────────────────────────────────
function GlassCubes() {
  const cubes = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        -0.5 - Math.random() * 1,
      ] as [number, number, number],
      size:  0.18 + Math.random() * 0.22,
      speed: 0.12 + Math.random() * 0.18,
      phase: Math.random() * Math.PI * 2,
    })), []
  );

  return (
    <>
      {cubes.map((c, i) => (
        <Float
          key={i}
          speed={c.speed * 2}
          rotationIntensity={0.6}
          floatIntensity={0.4}
          position={c.pos}
        >
          <mesh>
            <boxGeometry args={[c.size, c.size, c.size]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.07}
              wireframe={false}
              roughness={0.05}
              metalness={0.9}
            />
          </mesh>
          {/* Wireframe edge overlay */}
          <mesh>
            <boxGeometry args={[c.size, c.size, c.size]} />
            <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.25} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  SCENE WRAPPER  — houses lights + all 3D objects
// ─────────────────────────────────────────────────────────────
function Scene({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]}  intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, -3, 2]} intensity={0.6} color="#aaaaaa" />
      <Suspense fallback={null}>
        <PixelField mouse={mouse} />
        <GlassCubes />
      </Suspense>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  ABOUT SECTION  — main export
// ─────────────────────────────────────────────────────────────
export default function AboutSection() {
  const sectionRef = useScrollReveal();
  const mouse = useRef<[number, number]>([0, 0]);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  // Track mouse relative to the section for repulsion
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouse.current = [
      ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -((e.clientY - rect.top)  / rect.height) * 2 + 1,
    ];
  };

  const handleMouseLeave = () => { mouse.current = [0, 0]; };

  return (
    <section
      id="about"
      className={`${styles.about} section-pad`}
      ref={sectionRef as React.RefObject<HTMLElement>}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── R3F Canvas — absolutely fills the section ──── */}
      <div ref={canvasWrapRef} className={styles.canvasWrap} aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: false,           // keep perf high
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ background: "transparent" }}
        >
          <Scene mouse={mouse} />
        </Canvas>
      </div>

      {/* ── Content layer — sits above canvas ─────────── */}
      <div className={styles.inner}>
        <div className="section-label reveal">Who I Am</div>

        <div className={styles.grid}>
          {/* LEFT — text */}
          <div className={styles.left}>
            <h2 className={`${styles.bigText} reveal reveal-delay-1`}>
              Crafting<br />
              Digital<br />
              Experiences<br />
              That Last.
            </h2>

            <p className={`${styles.body} reveal reveal-delay-2`}>
              I'm a multidisciplinary designer and developer based wherever
              the work takes me. I believe great design is invisible — it
              removes friction, solves real problems, and makes people feel
              something.
            </p>

            <div className={`${styles.separator} reveal reveal-delay-2`} />

            <p className={`${styles.body} reveal reveal-delay-3`}>
              My process is rooted in clarity. I work with founders, agencies,
              and creative studios to build products that are both beautiful
              and functional — never one at the expense of the other.
            </p>

            <div className={`${styles.chips} reveal reveal-delay-3`}>
              {SKILLS.map((s) => (
                <span key={s} className={`skill-chip ${styles.chip}`}>{s}</span>
              ))}
            </div>
          </div>

          {/* RIGHT — stats */}
          <div className={styles.right}>
            <div className={`${styles.stats} reveal reveal-delay-2`}>
              {STATS.map(({ num, label }) => (
                <div key={num} className={styles.statRow}>
                  <span className={styles.statNum}>{num}</span>
                  <span className={styles.statDesc}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
