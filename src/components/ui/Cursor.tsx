"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const hovering = useRef(false);
  const pressing = useRef(false);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const el = e.target as HTMLElement;
      hovering.current = !!el.closest(
        'a, button, input, textarea, select, label, [role="button"], [data-hover]'
      );
    };
    const onDown = () => { pressing.current = true; };
    const onUp   = () => { pressing.current = false; };
    const onLeave = () => { pos.current = { x: -200, y: -200 }; };

    const animate = () => {
      const dot  = dotRef.current;
      if (dot) {
        dot.style.transform  = `translate(${pos.current.x}px,${pos.current.y}px) translate(-50%,-50%)`;

        const h = hovering.current;
        const p = pressing.current;

        if (p) {
          dot.style.width  = dot.style.height  = "4px";
          dot.style.opacity = "0.6";
        } else if (h) {
          dot.style.width  = dot.style.height  = "8px";
          dot.style.opacity = "0.4";
        } else {
          dot.style.width  = dot.style.height  = "10px";
          dot.style.opacity = "1";
        }
      }
      rafId.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);
    document.addEventListener("mouseleave", onLeave);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>

      {/* Dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 10, height: 10, borderRadius: "50%",
          background: "white", pointerEvents: "none",
          zIndex: 99999, willChange: "transform",
          mixBlendMode: "difference",
          transition: "width .18s ease, height .18s ease, opacity .18s ease",
        }}
      />
    </>
  );
}
