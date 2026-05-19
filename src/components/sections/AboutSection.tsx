// ============================================================
//  AboutSection.tsx  —  Scroll-animated text + 3D Carousel
// ============================================================

"use client";

import { useRef, useMemo, useEffect, useState, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import styles from "./AboutSection.module.css";

const SKILLS = [
  { name: "React", icon: "⚛" },
  { name: "Next.js", icon: "▲" },
  { name: "Node.js", icon: "⬢" },
  { name: "Three.js", icon: "3D" },
  { name: "Tailwind", icon: "🌊" },
  { name: "WebGL", icon: "◆" },
];

const COUNT = 150;

// ── custom scroll-in hook (no framer-motion needed) ──────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

// ── Animated big-text line ────────────────────────────────────
function BigLine({
  children,
  delay = 0,
  fontSize,
  letterSpacing,
  opacity = 1,
}: {
  children: React.ReactNode;
  delay?: number;
  fontSize: string;
  letterSpacing: string;
  opacity?: number;
}) {
  const [ref, inView] = useInView(0.05);

  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className="block font-[family-name:var(--font-bebas)] text-white leading-none overflow-hidden"
      style={{
        fontSize,
        letterSpacing,
        opacity: inView ? opacity : 0,
        transform: inView ? "translateY(0) skewX(0deg)" : "translateY(80px) skewX(-4deg)",
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  R3F PIXEL FIELD
// ─────────────────────────────────────────────────────────────
function PixelField({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const { viewport } = useThree();

  const particles = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => ({
      ox: (Math.random() - 0.5) * viewport.width * 1.8,
      oy: (Math.random() - 0.5) * viewport.height * 1.8,
      oz: (i % 3) * 1.2 - 1.2,
      freqX: 0.18 + Math.random() * 0.22,
      freqY: 0.14 + Math.random() * 0.2,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      ampX: 0.08 + Math.random() * 0.18,
      ampY: 0.06 + Math.random() * 0.14,
      burstX: (Math.random() - 0.5) * 8,
      burstY: (Math.random() - 0.5) * 8,
      scale: 0.012 + Math.random() * 0.025,
      bright: Math.random() > 0.82,
      rotSpeed: (Math.random() - 0.5) * 0.4,
    }));
  }, [viewport]);

  const colors = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    particles.forEach((p, i) => {
      const v = p.bright ? 1.0 : 0.08 + Math.random() * 0.28;
      arr[i * 3] = v; arr[i * 3 + 1] = v; arr[i * 3 + 2] = v;
    });
    return arr;
  }, [particles]);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.geometry.setAttribute("color", new THREE.InstancedBufferAttribute(colors, 3));
  }, [colors]);

  const burst = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const rotations = useRef(particles.map(() => Math.random() * Math.PI * 2));

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    burst.current = Math.min(burst.current + 0.012, 1);
    const b = 1 - Math.pow(1 - burst.current, 3);
    const [mx, my] = mouse.current;
    const mwx = mx * viewport.width * 0.5;
    const mwy = my * viewport.height * 0.5;

    particles.forEach((p, i) => {
      const dx = Math.sin(t * p.freqX + p.phaseX) * p.ampX;
      const dy = Math.cos(t * p.freqY + p.phaseY) * p.ampY;
      const x = p.ox + p.burstX * (1 - b) + dx;
      const y = p.oy + p.burstY * (1 - b) + dy;
      const z = p.oz + Math.sin(t * 0.3 + i) * 0.12;
      const distX = x - mwx, distY = y - mwy;
      const dist = Math.sqrt(distX * distX + distY * distY);
      const repel = dist < 2.5 ? Math.pow(1 - dist / 2.5, 2) : 0;
      const fx = x + (distX / (dist + 0.001)) * repel * 0.4;
      const fy = y + (distY / (dist + 0.001)) * repel * 0.4;
      rotations.current[i] += p.rotSpeed * 0.008;
      dummy.position.set(fx, fy, z);
      dummy.rotation.z = rotations.current[i];
      dummy.scale.setScalar(p.scale * (1 + repel * 0.3));
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

function GlassCubes() {
  const cubes = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        pos: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5, -0.5 - Math.random() * 2] as [number, number, number],
        size: i === 0 ? 0.6 : i === 1 ? 0.45 : 0.1 + Math.random() * 0.2,
        speed: 0.05 + Math.random() * 0.06,
      })),
    []
  );

  return (
    <>
      {cubes.map((c, i) => (
        <Float key={i} speed={c.speed * 2} rotationIntensity={0.6} floatIntensity={0.4} position={c.pos}>
          <mesh>
            <boxGeometry args={[c.size, c.size, c.size]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.07} roughness={0.05} metalness={0.9} />
          </mesh>
          <mesh>
            <boxGeometry args={[c.size, c.size, c.size]} />
            <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.25} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function Scene({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, -3, 2]} intensity={0.6} color="#aaaaaa" />
      <Suspense fallback={null}>
        <PixelField mouse={mouse} />
        <GlassCubes />
      </Suspense>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  SKILL CARD — Revolving Door item
// ─────────────────────────────────────────────────────────────
function SkillCard({ skill, index, total }: { skill: { name: string; icon: string }; index: number; total: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const rotationDeg = (360 / total) * index;

  return (
    <div
      className={styles.revolvingCard}
      style={{ transform: `rotateY(${rotationDeg}deg) translateZ(var(--carousel-radius, 280px))` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${styles.revolvingCardInner} ${isHovered ? styles.hovered : ""}`}>
        <div className={styles.skillCardShine} />
        <div className={styles.skillCardEdge} />
        <span className={styles.skillIcon}>{skill.icon}</span>
        <span className={styles.skillName}>{skill.name}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ABOUT SECTION — main export
// ─────────────────────────────────────────────────────────────
export default function AboutSection() {
  const sectionRef = useScrollReveal();
  const mouse = useRef<[number, number]>([0, 0]);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const rotation = useRef(0);
  const isDragging = useRef(false);
  const isHovered = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  useEffect(() => {
    let id: number;
    const tick = () => {
      if (!isDragging.current && !isHovered.current) rotation.current -= 0.15;
      if (carouselRef.current) carouselRef.current.style.transform = `rotateY(${rotation.current}deg)`;
      id = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(id);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = currentX.current = e.clientX;
    if (carouselRef.current) { carouselRef.current.style.transition = "none"; carouselRef.current.style.cursor = "grabbing"; }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    rotation.current += (e.clientX - currentX.current) * 0.4;
    currentX.current = e.clientX;
  };

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    if (carouselRef.current) carouselRef.current.style.cursor = "grab";
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouse.current = [
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    ];
  };

  return (
    <section
      id="about"
      className={`${styles.about} section-pad`}
      ref={sectionRef as React.RefObject<HTMLElement>}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouse.current = [0, 0]; }}
    >
      {/* R3F Canvas */}
      <div ref={canvasWrapRef} className={styles.canvasWrap} aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
        >
          <Scene mouse={mouse} />
        </Canvas>
      </div>

      {/* Content */}
      <div className={styles.inner}>
        <div className={styles.grid}>

          {/* LEFT — animated big text */}
          <div className={styles.left}>
            {/* Eyebrow */}
            <div
              className="font-mono text-[9px] tracking-[0.45em] uppercase text-neutral-600 mb-6 reveal"
            >
              <span className="inline-flex items-center gap-3">
                <span className="w-8 h-px bg-neutral-700" />
                About Me
              </span>
            </div>

            {/* Big staggered lines */}
            <div className="flex flex-col mb-10" style={{ gap: "0px" }}>
              <BigLine fontSize="clamp(60px,10vw,140px)" letterSpacing="0.04em" delay={0}>
                I
              </BigLine>
              <BigLine fontSize="clamp(120px,20vw,280px)" letterSpacing="0.1em" delay={0.08}>
                BUILD
              </BigLine>
              <BigLine fontSize="clamp(70px,12vw,160px)" letterSpacing="0.2em" delay={0.16} opacity={0.88}>
                Digital
              </BigLine>
              <BigLine fontSize="clamp(45px,7vw,100px)" letterSpacing="0.3em" delay={0.24} opacity={0.70}>
                EXPERIENCES
              </BigLine>
              <BigLine fontSize="clamp(32px,5vw,75px)" letterSpacing="0.4em" delay={0.32} opacity={0.50}>
                That Last.
              </BigLine>
            </div>

            {/* Body */}
            <p className={`${styles.body} reveal reveal-delay-2`}>
              I&apos;m a multidisciplinary designer and developer based wherever the work takes me.
              I believe great design is invisible — it removes friction, solves real problems, and makes people feel something.
            </p>

            <div className={`${styles.separator} reveal reveal-delay-2`} />
          </div>

          {/* RIGHT — 3D Revolving Carousel */}
          <div className={styles.right}>
            <div
              className={`${styles.carouselScene} reveal reveal-delay-2`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={() => { handlePointerUp(); isHovered.current = false; }}
              onMouseEnter={() => { isHovered.current = true; }}
              style={{ cursor: "grab", touchAction: "none" }}
            >
              <div ref={carouselRef} className={styles.carouselInteractive}>
                {SKILLS.map((skill, index) => (
                  <SkillCard key={skill.name} skill={skill} index={index} total={SKILLS.length} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
