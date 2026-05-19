"use client";

import { useEffect, useRef } from "react";
import { PROJECTS } from "@/lib/projects";
import ProjectCard from "@/components/ui/ProjectCard";

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  /* Scroll-reveal for the heading */
  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      style={{
        background: "#ffffff",
        width: "100%",
        padding: "100px 5% 140px",
        position: "relative",
      }}
    >
      {/* Subtle grid background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Radial soft vignette */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,0,0,0.03) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── Section Header ── */}
        <div
          ref={headingRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: 72,
            opacity: 0,
            transform: "translateY(30px)",
            transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Label */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-geist-mono, monospace)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.4)",
              marginBottom: 18,
            }}
          >
            <span
              style={{
                display: "block",
                width: 28,
                height: 1,
                background: "rgba(0,0,0,0.25)",
              }}
            />
            Selected Work
            <span
              style={{
                display: "block",
                width: 28,
                height: 1,
                background: "rgba(0,0,0,0.25)",
              }}
            />
          </div>

          {/* Big heading */}
          <h2
            style={{
              fontFamily: "var(--font-bebas, sans-serif)",
              fontSize: "clamp(52px, 8vw, 96px)",
              fontWeight: 400,
              color: "#0a0a0a",
              margin: 0,
              lineHeight: 0.95,
              letterSpacing: "0.04em",
            }}
          >
            MY PROJECTS
          </h2>

          {/* Sub line */}
          <p
            style={{
              fontFamily: "var(--font-geist-sans, sans-serif)",
              fontSize: "clamp(13px, 1.2vw, 15px)",
              color: "rgba(0,0,0,0.45)",
              margin: "18px 0 0",
              letterSpacing: "0.01em",
              maxWidth: 440,
              lineHeight: 1.7,
            }}
          >
            Hover over a card to see it come alive in 3D.
          </p>

          {/* Count badge */}
          <div
            style={{
              marginTop: 20,
              fontFamily: "var(--font-geist-mono, monospace)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "rgba(0,0,0,0.3)",
              background: "rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "4px 14px",
              borderRadius: 100,
            }}
          >
            {String(PROJECTS.length).padStart(2, "0")} Works
          </div>
        </div>

        {/* ── Projects Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 480px), 1fr))",
            gap: "48px 40px",
            alignItems: "start",
            /* extra padding-bottom so drag hint text is not clipped */
            paddingBottom: 40,
          }}
        >
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
