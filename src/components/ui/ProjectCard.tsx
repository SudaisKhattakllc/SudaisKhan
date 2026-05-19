"use client";

import React, { useRef, useState, useCallback } from "react";
import Image from "next/image";
import type { Project } from "@/lib/projects";

interface Props {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  /* ── 3D tilt on mouse move ── */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: -dy * 14, y: dx * 14 });
  }, []);

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const tagColors = [
    { bg: "rgba(0,0,0,0.07)", border: "rgba(0,0,0,0.18)", color: "#111" },
    { bg: "rgba(0,0,0,0.05)", border: "rgba(0,0,0,0.14)", color: "#333" },
  ];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        cursor: "default",
        position: "relative",
      }}
    >
      {/* ── CARD ── */}
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)"}`,
          transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease",
          transformStyle: "preserve-3d",
          borderRadius: 24,
          background: hovered ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(0,0,0,0.10)",
          boxShadow: hovered
            ? "0 32px 80px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)"
            : "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
          overflow: "hidden",
        }}
      >
        {/* Top shimmer line */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)",
            zIndex: 5,
            opacity: hovered ? 1 : 0.6,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Header bar */}
        <div
          style={{
            padding: "14px 18px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Traffic lights (macOS style) */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", border: "1px solid rgba(0,0,0,0.1)" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", border: "1px solid rgba(0,0,0,0.1)" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", border: "1px solid rgba(0,0,0,0.1)" }} />
          </div>

          {/* Project number */}
          <span
            style={{
              fontFamily: "var(--font-geist-mono, monospace)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "rgba(0,0,0,0.35)",
              fontWeight: 500,
            }}
          >
            {project.number}
          </span>

          {/* Visit / Coming Soon button */}
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "var(--font-outfit, sans-serif)",
                color: "#fff",
                background: "linear-gradient(135deg, #111 0%, #333 100%)",
                padding: "5px 12px",
                borderRadius: 100,
                textDecoration: "none",
                letterSpacing: "0.03em",
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
              }}
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M1 9L9 1M9 1H3M9 1V7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Visit
            </a>
          ) : (
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                fontFamily: "var(--font-geist-mono, monospace)",
                color: "rgba(0,0,0,0.3)",
                background: "rgba(0,0,0,0.06)",
                padding: "4px 10px",
                borderRadius: 100,
                letterSpacing: "0.04em",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              Coming Soon
            </span>
          )}
        </div>

        {/* Screenshot preview */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            overflow: "hidden",
            background: "linear-gradient(135deg, #f0f0f0 0%, #e5e5e5 100%)",
          }}
        >
          {!imgError ? (
            <Image
              src={project.image}
              alt={`${project.title} preview`}
              fill
              style={{
                objectFit: "cover",
                objectPosition: "top",
                transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                transform: hovered ? "scale(1.06)" : "scale(1)",
              }}
              onError={() => setImgError(true)}
              unoptimized
              priority={index < 2}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="4" y="8" width="32" height="24" rx="3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <circle cx="14" cy="17" r="3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <path d="M4 26L13 18L19 24L26 17L36 27" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                {project.title}
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, transparent 60%, rgba(255,255,255,0.25) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* PREVIEW badge */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              borderRadius: 6,
              padding: "3px 8px",
              fontSize: 9,
              fontFamily: "var(--font-geist-mono, monospace)",
              color: "rgba(0,0,0,0.5)",
              letterSpacing: "0.1em",
              border: "1px solid rgba(0,0,0,0.08)",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            PREVIEW
          </div>
        </div>

        {/* Card footer */}
        <div style={{ padding: "16px 20px 18px", background: "rgba(255,255,255,0.7)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontFamily: "var(--font-outfit, sans-serif)",
                  fontSize: "clamp(15px, 1.5vw, 18px)",
                  fontWeight: 700,
                  color: "#0a0a0a",
                  margin: 0,
                  marginBottom: 3,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                {project.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-geist-sans, sans-serif)",
                  fontSize: 11,
                  color: "rgba(0,0,0,0.45)",
                  margin: 0,
                  marginBottom: 10,
                  letterSpacing: "0.01em",
                }}
              >
                {project.subtitle}
              </p>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {project.tags.map((tag, ti) => {
                  const tc = tagColors[ti % tagColors.length];
                  return (
                    <span
                      key={tag}
                      style={{
                        fontSize: 9,
                        fontFamily: "var(--font-geist-mono, monospace)",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: tc.color,
                        background: tc.bg,
                        border: `1px solid ${tc.border}`,
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Tech stack */}
            <div
              style={{
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: 9,
                color: "rgba(0,0,0,0.35)",
                letterSpacing: "0.06em",
                textAlign: "right",
                flexShrink: 0,
                maxWidth: 120,
                lineHeight: 1.6,
              }}
            >
              {project.tech.split(" · ").map((t, i) => (
                <div key={i}>{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom accent line animates in on hover */}
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, #111 0%, #555 50%, #111 100%)",
            width: hovered ? "100%" : "0%",
            transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
    </div>
  );
}
