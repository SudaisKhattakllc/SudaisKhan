"use client";

import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import myImage from "../../assests/MyImgae-Photoroom.png";

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────
const COUNT = 50;
const TICKER_TEXT =
  "Creative Developer · UI/UX Designer · WebGL · Three.js · React · Next.js · Motion Design · ";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";

// ─────────────────────────────────────────────────────────────
//  TEXT SCRAMBLE HOOK
// ─────────────────────────────────────────────────────────────
function useScramble(target: string, trigger: boolean, speed = 38) {
  const [display, setDisplay] = useState(target);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!trigger) return;
    let iter = 0;
    if (interval.current) clearInterval(interval.current);
    interval.current = setInterval(() => {
      setDisplay(
        target
          .split("")
          .map((char, idx) => {
            if (idx < iter) return target[idx];
            if (char === " ") return " ";
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      iter += 0.35;
      if (iter >= target.length) {
        clearInterval(interval.current!);
        setDisplay(target);
      }
    }, speed);
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [target, trigger, speed]);

  return display;
}

// ─────────────────────────────────────────────────────────────
//  TYPEWRITER HOOK
// ─────────────────────────────────────────────────────────────
function useTypewriter(words: string[], typingSpeed = 100, deletingSpeed = 50, delay = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length - 1));
        if (text.length === 1) { // 1 so it doesn't stay fully empty for a tick
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }, deletingSpeed);
    } else {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length + 1));
        if (text.length === currentWord.length) {
          timeout = setTimeout(() => setIsDeleting(true), delay);
        }
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, delay]);

  return text;
}

// ─────────────────────────────────────────────────────────────
//  R3F — BACKGROUND PARTICLE FIELD
// ─────────────────────────────────────────────────────────────
function ParticleField({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const { viewport } = useThree();

  const particles = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => ({
      ox: (Math.random() - 0.5) * viewport.width * 1.4,
      oy: (Math.random() - 0.5) * viewport.height * 1.4,
      oz: -1 + Math.random() * 2,
      freqX: 0.18 + Math.random() * 0.22,
      freqY: 0.16 + Math.random() * 0.2,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      ampX: 0.06 + Math.random() * 0.14,
      ampY: 0.05 + Math.random() * 0.12,
      burstX: (Math.random() - 0.5) * 5,
      burstY: (Math.random() - 0.5) * 5,
      scale:
        i < 5 ? 0.22 + Math.random() * 0.18
          : i < 15 ? 0.10 + Math.random() * 0.10
            : i < 40 ? 0.04 + Math.random() * 0.04
              : 0.012 + Math.random() * 0.018,
      bright: Math.random() > 0.75,
      rotSpeed: (Math.random() - 0.5) * 0.35,
    }));
  }, [viewport]);

  const colors = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    particles.forEach((p, i) => {
      const v = p.bright ? 1.0 : 0.06 + Math.random() * 0.2;
      arr[i * 3] = v; arr[i * 3 + 1] = v; arr[i * 3 + 2] = v;
    });
    return arr;
  }, [particles]);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.geometry.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(colors, 3)
    );
  }, [colors]);

  const burst = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const rotations = useRef(particles.map(() => Math.random() * Math.PI * 2));

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * 0.2; // Slowed down by 80%
    burst.current = Math.min(burst.current + 0.01, 1);
    const b = 1 - Math.pow(1 - burst.current, 3);
    const [mx, my] = mouse.current;
    const mwx = mx * viewport.width * 0.5;
    const mwy = my * viewport.height * 0.5;

    particles.forEach((p, i) => {
      const dx = Math.sin(t * p.freqX + p.phaseX) * p.ampX;
      const dy = Math.cos(t * p.freqY + p.phaseY) * p.ampY;
      const x = p.ox + p.burstX * (1 - b) + dx;
      const y = p.oy + p.burstY * (1 - b) + dy;
      const z = p.oz + Math.sin(t * 0.25 + i) * 0.1;
      const distX = x - mwx, distY = y - mwy;
      const dist = Math.sqrt(distX * distX + distY * distY);
      const repel = dist < 2.2 ? Math.pow(1 - dist / 2.2, 2) : 0;
      const fx = x + (distX / (dist + 0.001)) * repel * 0.5;
      const fy = y + (distY / (dist + 0.001)) * repel * 0.5;
      rotations.current[i] += p.rotSpeed * 0.006;
      dummy.position.set(fx, fy, z);
      dummy.rotation.z = rotations.current[i];
      dummy.scale.setScalar(p.scale * (1 + repel * 0.4));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial vertexColors transparent opacity={0.75} />
    </instancedMesh>
  );
}

// ─────────────────────────────────────────────────────────────
//  R3F — FLOATING SQUARES (2D geometry, wireframe)
// ─────────────────────────────────────────────────────────────
function FloatingSquares() {
  const squares = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        // Enlarge the elements specifically requested by the user
        const sizes = [2.2, 1.6, 1.2, 0.85];
        return {
          pos: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 7.5, -0.5 - Math.random() * 4] as [number, number, number],
          size: sizes[i] || 0.2,
          speed: 0.02 + Math.random() * 0.03,
          rotIntensity: 0.2 + Math.random() * 0.3,
        };
      }),
    []
  );

  return (
    <>
      {squares.map((s, i) => (
        <Float key={i} speed={s.speed} rotationIntensity={s.rotIntensity} floatIntensity={0.5} position={s.pos}>
          <mesh>
            <planeGeometry args={[s.size, s.size]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.03} roughness={0.1} metalness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <planeGeometry args={[s.size, s.size]} />
            <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.18} side={THREE.DoubleSide} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function Scene({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, -4, 2]} intensity={0.4} color="#888888" />
      <Suspense fallback={null}>
        <ParticleField mouse={mouse} />
        <FloatingSquares />
      </Suspense>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAGNETIC CURSOR BLOB
// ─────────────────────────────────────────────────────────────
function CursorBlob() {
  const blobRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -300, y: -300 });
  const curr = useRef({ x: -300, y: -300 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    const animate = () => {
      curr.current.x += (pos.current.x - curr.current.x) * 0.07;
      curr.current.y += (pos.current.y - curr.current.y) * 0.07;
      if (blobRef.current) {
        blobRef.current.style.transform = `translate(${curr.current.x - 200}px, ${curr.current.y - 200}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={blobRef}
      className="pointer-events-none fixed top-0 left-0 z-[1] w-[400px] h-[400px] rounded-full"
      style={{
        background: "radial-gradient(circle, rgba(255,255,255,0.022) 0%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN HERO SECTION
// ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  const mouse = useRef<[number, number]>([0, 0]);
  const [mounted, setMounted] = useState(false);
  const firstName = useScramble("SUDAIS", mounted, 38);
  const lastName = useScramble("KHAN", mounted, 44);

  const typedRole = useTypewriter([
    "Fullstack Developer.",
    "3D Website Builder.",
    "Animations Websites.",
    "Cloud Services."
  ], 80, 40, 2000);

  const IMG_W = 600;
  const IMG_H = 800;

  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mount timeout
    const t = setTimeout(() => setMounted(true), 500);
    return () => {
      clearTimeout(t);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouse.current = [
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    ];
  };

  return (
    <section
      id="hero"
      className="relative h-screen min-h-[700px] w-full flex flex-col bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouse.current = [0, 0]; }}
    >
      <CursorBlob />

      {/* ── R3F Canvas Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true }}
          style={{ background: "transparent" }}
        >
          <Scene mouse={mouse} />
        </Canvas>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN LAYOUT
          Image on LEFT — Text on RIGHT
          (flex-row, full height)
      ══════════════════════════════════════════════════════ */}
      <div className="relative z-[4] flex-1 flex flex-col xl:flex-row items-center justify-between px-8 md:px-14 gap-8 xl:gap-16 pb-10 pt-2 h-full">

        {/* ─── LEFT: Profile Image ─── */}
        <div className="flex-shrink-0 relative ml-0 xl:ml-20 self-center xl:self-start xl:-mt-8 order-2 xl:order-1 mt-10 md:mt-0 w-full md:w-auto flex justify-center">

          {/* Vertical label — far left */}
          <div className="absolute -left-10 top-[40%] -translate-y-1/2 hidden xl:flex flex-col items-center gap-3 z-[5]">
            <span
              className="font-mono text-[8px] tracking-[0.55em] text-neutral-700 uppercase"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Portfolio · 9818
            </span>
            <span className="w-px h-12 bg-gradient-to-b from-neutral-800 to-transparent" />
          </div>

          {/* Image container without heavy 3D calculations */}
          <div 
            ref={imageContainerRef}
            className="relative group w-[75vw] h-[105vw] max-w-[380px] max-h-[520px] sm:w-[380px] sm:h-[520px] xl:w-[500px] xl:h-[700px] 2xl:w-[600px] 2xl:h-[780px]"
          >
            {/* ─── FRONT SIDE ─── */}
            <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}>
              {/* Outer border (optional subtlety) */}
              <div
                className="absolute pointer-events-none z-[2]"
                style={{ inset: "-12px", border: "1px solid rgba(255,255,255,0.05)", transform: "translateZ(8px)" }}
              />

              {/* Remarkable Tile Background */}
              <div 
                className="absolute inset-0 z-[0] grid grid-cols-6 md:grid-cols-8 grid-rows-8 gap-[2px] opacity-90 p-1 bg-black"
                style={{
                  maskImage: "linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,1) 100%)",
                  WebkitMaskImage: "linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,1) 100%)"
                }}
              >
                {Array.from({ length: 64 }).map((_, i) => (
                  <div 
                    key={`front-tile-${i}`} 
                    className="w-full h-full bg-gradient-to-tr from-[#0a0a0a] to-[#1a1a1a] rounded-[2px] border border-white/[0.03] shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)] transition-all duration-500 ease-out hover:opacity-100 hover:from-neutral-700 hover:to-neutral-600 hover:scale-105 cursor-default"
                  />
                ))}
              </div>

              {/* Photo — straight up, no clip path, no dissolve */}
              <div className="absolute inset-0 overflow-hidden z-[1]" style={{ transform: "translateZ(1px)" }}>
                <Image
                  src={myImage}
                  alt="Sudais Khan Front"
                  fill
                  className="object-cover object-top grayscale contrast-[1.08] brightness-[0.9] transition-all duration-700 group-hover:brightness-[1]"
                  priority
                  sizes="(max-width: 1280px) 450px, 650px"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />
              </div>

              {/* Subtle Corners */}
              <div className="absolute top-0 left-0 z-[6] pointer-events-none" style={{ transform: "translateZ(16px)" }}>
                <div className="absolute w-6 h-px top-0 left-0 bg-white/40" />
                <div className="absolute w-px h-6 top-0 left-0 bg-white/40" />
              </div>
              <div className="absolute top-0 right-0 z-[6] pointer-events-none" style={{ transform: "translateZ(16px)" }}>
                <div className="absolute w-6 h-px top-0 right-0 bg-white/40" />
                <div className="absolute w-px h-6 top-0 right-0 bg-white/40" />
              </div>
              <div className="absolute bottom-0 left-0 z-[6] pointer-events-none" style={{ transform: "translateZ(16px)" }}>
                <div className="absolute w-6 h-px bottom-0 left-0 bg-white/30" />
                <div className="absolute w-px h-6 bottom-0 left-0 bg-white/30" />
              </div>
              <div className="absolute bottom-0 right-0 z-[6] pointer-events-none" style={{ transform: "translateZ(16px)" }}>
                <div className="absolute w-6 h-px bottom-0 right-0 bg-white/30" />
                <div className="absolute w-px h-6 bottom-0 right-0 bg-white/30" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Name + Info ─── */}
        <div className="flex-1 flex flex-col justify-center items-center xl:items-end text-center xl:text-right min-w-0 self-center order-1 xl:order-2 w-full mt-4 xl:mt-0">

          {/* Eyebrow */}
          <div
            className="font-mono text-[9px] tracking-[0.5em] uppercase text-neutral-500 mb-7 flex items-center justify-end gap-3"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(8px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <span className="text-neutral-700">01</span>
            <span className="w-8 h-px bg-neutral-800" />
            Available for work
          </div>

          {/* Name */}
          <h1
            className="flex flex-col items-end mb-5 leading-none glitch-wrapper"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(16px)",
              transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
            }}
          >
            {/* SUDAIS — solid white, no letter-spacing, HUGE */}
            <span
              className="block text-white font-black select-none glitch-text"
              data-text={firstName}
              style={{
                fontSize: "clamp(60px, 20vw, 260px)",
                letterSpacing: "0.08em",
                lineHeight: 0.95,
                paddingTop: "10px",
                fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
              }}
            >
              {firstName}
            </span>
            {/* KHAN — outline ghost, wide letter-spacing, HUGE */}
            <span
              className="block select-none glitch-text"
              data-text={lastName}
              style={{
                fontSize: "clamp(55px,15vw, 220px)",
                letterSpacing: "0.25em",
                lineHeight: 0.62,
                paddingTop: "2px",
                fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                color: "transparent",
                WebkitTextStroke: "2px rgba(255,255,255,0.32)",
              }}
            >
              {lastName}
            </span>
          </h1>

          {/* Divider */}
          <div
            className="flex items-center justify-center xl:justify-end gap-4 mb-5 w-full"
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.6s ease 0.2s",
            }}
          >
            <div className="w-1 h-1 bg-white/20 rotate-45 flex-shrink-0" />
            <div className="h-px w-full max-w-[180px] bg-gradient-to-l from-white/18 to-transparent xl:bg-gradient-to-l xl:from-white/18 xl:to-transparent bg-gradient-to-r md:bg-gradient-to-l" />
          </div>

          {/* Role chips */}
          <div
            className="flex items-center justify-end gap-2 flex-wrap mb-0 pr-6 xl:pr-16"
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.7s ease 0.25s",
            }}
          >


          </div>

          {/* Tagline / Typewriter */}
          <p
            className="text-[16px] xl:text-[20px] leading-[1.8] text-[#00FFD1] font-mono tracking-widest text-center xl:text-right w-full mb-8 h-8 xl:mr-16"
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.9s ease 0.3s",
            }}
          >
            {typedRole}<span className="animate-pulse">_</span>
          </p>

          {/* CTAs */}
          <div
            className="flex items-center justify-center xl:justify-end gap-6 w-full"
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.7s ease 0.38s",
            }}
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase text-white no-underline transition-all duration-300 hover:scale-105"
            >
              <span className="w-6 h-px bg-white/40"></span>
              <span className="relative flex items-center justify-center">
                 <span className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]"></span>
              </span>
              <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">Contact</span>
            </a>

            <a
              href="#projects"
              className="group inline-flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase text-black bg-white border border-white no-underline px-8 py-3.5 relative overflow-hidden transition-colors duration-300 hover:text-white"
            >
              <div className="absolute inset-0 bg-black -translate-x-[101%] transition-transform duration-[380ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0" />
              <span className="relative z-[1]">View Work</span>
              <svg
                className="relative z-[1] transition-transform duration-200 group-hover:translate-x-1"
                width="14" height="14" viewBox="0 0 16 16"
                fill="none" stroke="currentColor" strokeWidth="1.5"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-[52px] left-8 md:left-14 flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-neutral-700 uppercase z-[5]">
        <div className="h-px bg-neutral-700" style={{ animation: "scrollLine 2.2s ease-in-out infinite" }} />
        Scroll
      </div>

      {/* ── Scrolling ticker ── */}
      <div className="relative z-[5] border-t border-white/[0.05] overflow-hidden">
        <div className="flex" style={{ animation: "heroTicker 32s linear infinite" }}>
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className="font-mono text-[8px] tracking-[0.35em] uppercase text-white/40 whitespace-nowrap py-3 px-6 flex-shrink-0">
              {TICKER_TEXT}
            </span>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scrollLine {
            0%, 100% { width: 18px; opacity: 0.35; }
            50%       { width: 44px; opacity: 0.8; }
          }
          @keyframes heroTicker {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          .glitch-wrapper {
            position: relative;
          }
          .glitch-text {
            position: relative;
          }
          .glitch-text::before,
          .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.8;
          }
          .glitch-text::before {
            left: 15px;
            text-shadow: -10px 0 #00ffff, 5px 0 #ff00ff;
            clip-path: inset(10% 0 85% 0);
            animation: glitch-anim-1 3s infinite linear alternate-reverse;
          }
          .glitch-text::after {
            left: -15px;
            text-shadow: 10px 0 #ff00ff, -5px 0 #00ffff;
            clip-path: inset(10% 0 85% 0);
            animation: glitch-anim-2 3s infinite linear alternate-reverse;
          }
          @keyframes glitch-anim-1 {
            0%, 92% { clip-path: inset(10% 0 85% 0); transform: translate(0, 0); opacity: 0; }
            92.5% { clip-path: inset(20% 0 80% 0); transform: translate(-60px, 15px) scale(1.05) skew(-15deg); opacity: 1; }
            93% { clip-path: inset(50% 0 30% 0); transform: translate(60px, -15px) scale(1.02); opacity: 1; }
            93.5% { clip-path: inset(10% 0 60% 0); transform: translate(-60px, 18px) skew(10deg); opacity: 1; }
            94% { clip-path: inset(80% 0 5% 0); transform: translate(54px, -18px); opacity: 1; }
            94.5% { clip-path: inset(40% 0 40% 0); transform: translate(-54px, 12px); opacity: 1; }
            95% { clip-path: inset(5% 0 80% 0); transform: translate(60px, 18px); opacity: 1; }
            95.5%, 100% { clip-path: inset(50% 0 30% 0); transform: translate(0, 0); opacity: 0; }
          }
          @keyframes glitch-anim-2 {
            0%, 92% { clip-path: inset(10% 0 85% 0); transform: translate(0, 0); opacity: 0; }
            92.5% { clip-path: inset(80% 0 5% 0); transform: translate(60px, -15px) scale(1.03) skew(12deg); opacity: 1; }
            93% { clip-path: inset(10% 0 60% 0); transform: translate(-60px, 18px); opacity: 1; }
            93.5% { clip-path: inset(50% 0 30% 0); transform: translate(60px, -18px); opacity: 1; }
            94% { clip-path: inset(20% 0 80% 0); transform: translate(-60px, 12px) skew(-10deg); opacity: 1; }
            94.5% { clip-path: inset(5% 0 80% 0); transform: translate(54px, 18px); opacity: 1; }
            95% { clip-path: inset(40% 0 40% 0); transform: translate(-54px, 12px); opacity: 1; }
            95.5%, 100% { clip-path: inset(20% 0 80% 0); transform: translate(0, 0); opacity: 0; }
          }
        `,
      }} />
    </section>
  );
}