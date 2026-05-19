// ============================================================
//  ContactSection.tsx  —  R3F 2072 Edition
//
//  REQUIRES (already installed if you did AboutSection):
//    npm install three @react-three/fiber @react-three/drei
//
//  next.config.js:
//    transpilePackages: ['three', '@react-three/fiber', '@react-three/drei']
// ============================================================

"use client";

import {
  useRef, useMemo, useState, Suspense,
  type FormEvent, type PointerEvent as RPointerEvent,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import styles from "./ContactSection.module.css";

// ─────────────────────────────────────────────────────────────
//  SOCIAL / INFO DATA
// ─────────────────────────────────────────────────────────────
const SOCIALS = ["GitHub", "LinkedIn", "Twitter", "Dribbble"];

const INFO = [
  {
    icon: "✦",
    label: "Email",
    value: "hello@yourname.com",
    href: "mailto:hello@yourname.com",
  },
  { icon: "◈", label: "Based In", value: "Your City, Country" },
  { icon: "◎", label: "Response", value: "Within 24 hours"   },
];

// ─────────────────────────────────────────────────────────────
//  3D — ORBITING RING OF CUBES
//  A ring of 12 rounded boxes that orbit slowly.
//  Each cube bobs independently via Float.
//  On pointer-over the whole ring speeds up.
// ─────────────────────────────────────────────────────────────
function OrbitRing({ hovered }: { hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const COUNT = 12;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * (hovered ? 0.9 : 0.22);
    groupRef.current.rotation.x += delta * 0.06;
  });

  const cubes = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => {
      const angle = (i / COUNT) * Math.PI * 2;
      const radius = 2.2;
      return {
        pos: [
          Math.cos(angle) * radius,
          Math.sin(angle) * 0.5,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        size: 0.13 + Math.random() * 0.1,
        bright: i % 3 === 0,
        floatSpeed: 0.5 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
      };
    }), []
  );

  return (
    <group ref={groupRef}>
      {cubes.map((c, i) => (
        <Float
          key={i}
          speed={c.floatSpeed}
          rotationIntensity={0.5}
          floatIntensity={0.3}
          position={c.pos}
        >
          {/* Solid glass cube */}
          <RoundedBox args={[c.size, c.size, c.size]} radius={0.015} smoothness={4}>
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={c.bright ? 0.18 : 0.07}
              roughness={0.05}
              metalness={0.95}
              envMapIntensity={1}
            />
          </RoundedBox>
          {/* Wireframe shell */}
          <RoundedBox args={[c.size, c.size, c.size]} radius={0.015} smoothness={4}>
            <meshBasicMaterial
              color="#ffffff"
              wireframe
              transparent
              opacity={c.bright ? 0.55 : 0.18}
            />
          </RoundedBox>
        </Float>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
//  3D — CENTRAL DIAMOND / OCTAHEDRON
//  Slow spin, transmissive glass material, emits a faint glow
// ─────────────────────────────────────────────────────────────
function CentralDiamond({ hovered }: { hovered: boolean }) {
  const meshRef  = useRef<THREE.Mesh>(null!);
  const scaleRef = useRef(1);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * (hovered ? 1.4 : 0.35);
    meshRef.current.rotation.x += delta * 0.12;
    const target = hovered ? 1.18 : 1.0;
    scaleRef.current += (target - scaleRef.current) * 0.08;
    meshRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <Float speed={0.6} floatIntensity={0.4} rotationIntensity={0.1}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.7, 0]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.3}
          chromaticAberration={0.04}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.02}
          color="#ffffff"
          transmission={0.96}
          roughness={0.02}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Wireframe over it */}
      <mesh>
        <octahedronGeometry args={[0.72, 0]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.35} />
      </mesh>
    </Float>
  );
}

// ─────────────────────────────────────────────────────────────
//  3D — PARTICLE DUST
//  Small fixed-position bright specks for depth
// ─────────────────────────────────────────────────────────────
function Dust() {
  const meshRef = useRef<THREE.Points>(null!);

  const [positions, sizes] = useMemo(() => {
    const n = 180;
    const pos  = new Float32Array(n * 3);
    const sz   = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 9;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      sz[i] = Math.random() * 2.5 + 0.5;
    }
    return [pos, sz];
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.04;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size"     args={[sizes,     1]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.022}
        transparent
        opacity={0.45}
        sizeAttenuation
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────
//  FULL 3D SCENE
// ─────────────────────────────────────────────────────────────
function Scene({ hovered }: { hovered: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 4, 3]}   intensity={2}   color="#ffffff" />
      <pointLight position={[-4, -2, 2]} intensity={0.8} color="#888888" />
      <pointLight position={[0, 0, 5]}   intensity={0.4} color="#ffffff" />
      <Suspense fallback={null}>
        <Dust />
        <OrbitRing hovered={hovered} />
        <CentralDiamond hovered={hovered} />
      </Suspense>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  HOVER-RAISE GRID  — CSS-only 3D tiles
//  A background grid of squares that individually lift on hover
// ─────────────────────────────────────────────────────────────
function HoverGrid() {
  const COLS = 14;
  const ROWS = 6;
  const total = COLS * ROWS;

  return (
    <div className={styles.hoverGrid} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={styles.hoverTile} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CONTACT SECTION
// ─────────────────────────────────────────────────────────────
export default function ContactSection() {
  const sectionRef = useScrollReveal();
  const [canvasHovered, setCanvasHovered] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: wire to Resend / EmailJS / Formspree
    alert("Message sent! (swap with your email handler)");
  };

  return (
    <section
      id="contact"
      className={styles.contact}
      ref={sectionRef as React.RefObject<HTMLElement>}
    >
      {/* ── Hover-raise grid ─────────────────────────── */}
      <HoverGrid />

      {/* ── Main content wrapper ─────────────────────── */}
      <div className={styles.inner}>

        {/* TOP — eyebrow + title */}
        <div className={styles.topRow}>
          <div>
            <p className={`${styles.eyebrow} reveal`}>Get In Touch</p>
            <h2 className={`${styles.title} reveal reveal-delay-1`}>
              Let&apos;s<br />
              <span>Work</span><br />
              Together.
            </h2>
          </div>

          {/* ── 3D canvas panel ────────────────────── */}
          <div
            className={`${styles.canvasPanel} reveal reveal-delay-2`}
            onPointerEnter={() => setCanvasHovered(true)}
            onPointerLeave={() => setCanvasHovered(false)}
          >
            {/* Label overlay */}
            <div className={styles.canvasLabel}>
              <span>{canvasHovered ? "Interacting ✦" : "Hover me ◎"}</span>
            </div>

            <Canvas
              camera={{ position: [0, 0, 5], fov: 55 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true }}
              style={{ background: "transparent" }}
            >
              <Scene hovered={canvasHovered} />
            </Canvas>
          </div>
        </div>

        {/* BOTTOM — form + info */}
        <div className={styles.bottomRow}>

          {/* FORM */}
          <form
            className={`${styles.form} reveal reveal-delay-2`}
            onSubmit={handleSubmit}
          >
            <div className={styles.formRow}>
              <Field label="Name"  type="text"  placeholder="Your full name"  />
              <Field label="Email" type="email" placeholder="your@email.com"  />
            </div>
            <Field label="Subject" type="text" placeholder="What's this about?" />
            <div className={styles.fieldWrap}>
              <label className={styles.fieldLabel}>Message</label>
              <textarea
                className={styles.input}
                rows={5}
                placeholder="Tell me about your project..."
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              <span>Send Message</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 7.5h11M9 3.5l4 4-4 4" />
              </svg>
            </button>
          </form>

          {/* INFO */}
          <div className={`${styles.infoCol} reveal reveal-delay-3`}>
            {INFO.map(({ icon, label, value, href }) => (
              <div key={label} className={styles.infoItem}>
                <span className={styles.infoIcon}>{icon}</span>
                <div>
                  <p className={styles.infoLabel}>{label}</p>
                  {href
                    ? <a href={href} className={styles.infoValue}>{value}</a>
                    : <span className={styles.infoValue}>{value}</span>
                  }
                </div>
              </div>
            ))}

            <div className={styles.socialRow}>
              {SOCIALS.map((s) => (
                <a key={s} href="#" className={styles.socialBtn}>{s}</a>
              ))}
            </div>

            {/* Mini decorative grid of raising cubes */}
            <div className={styles.cubeMini}>
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className={styles.cubeMiniTile} style={{ animationDelay: `${i * 0.07}s` }} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER BAR */}
      <div className={styles.footerBar}>
        <span>© 2025 Your Name — All rights reserved</span>
        <span>Designed &amp; Built with precision</span>
      </div>
    </section>
  );
}

// ─── Mini reusable field ──────────────────────────────────────
function Field({
  label, type, placeholder,
}: {
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div className={styles.fieldWrap}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        className={styles.input}
        type={type}
        placeholder={placeholder}
        required={type !== "text" || label === "Name"}
      />
    </div>
  );
}
