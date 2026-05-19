"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PortalTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Make sure we have our refs
    if (!sectionRef.current || !containerRef.current || !imageRef.current || !overlayRef.current) return;

    // We create a timeline that is scrubbed by the scroll position
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current, // Use outer section as the trigger
        pin: containerRef.current,   // Pin the inner container
        start: "top top", // When the top hits the top of the viewport
        end: "+=2500",    // Increased distance for a smoother zoom
        scrub: 1,         // Smooth scrubbing
      }
    });

    // 1. Zoom into the image (assuming the black window is around the center)
    tl.to(imageRef.current, {
      scale: 150, // Massive scale to ensure the smaller picture's window covers the screen
      transformOrigin: "50% 50%", 
      ease: "power2.inOut"
    }, 0);

    // 2. As we get super zoomed, we fade a black overlay to cover any pixelation 
    // and seamlessly become a pure black void. 
    tl.to(overlayRef.current, {
      opacity: 1,
      ease: "power1.in"
    }, "<50%"); // Start this fade halfway through the zoom

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative w-full bg-black">
      <div 
        ref={containerRef} 
        className="relative w-full h-screen overflow-hidden flex items-center justify-center p-4"
      >
        {/* Remarkable Tile Background behind everything (HUGE TILES + LOWER OPACITY) */}
        <div 
          className="absolute inset-0 z-[0] grid grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-3 gap-[2px] p-2 opacity-85"
          style={{
            background: "linear-gradient(145deg, rgba(119, 119, 119, 1) 0%, rgba(0, 0, 0, 1) 40%, rgba(22, 0, 0, 0.4) 100%)",
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="w-full h-full bg-[#050505] rounded-[4px] border border-white/[0.08] shadow-[inset_0_1px_4px_rgba(255,255,255,0.02)] transition-all duration-700 ease-out hover:bg-neutral-900 cursor-default"
            />
          ))}
        </div>

        {/* 
          The image wrapper holds the CuteBoy image. 
          It is now smaller and centered, with the rest of the screen purely black. 
        */}
        <div className="absolute inset-0 flex items-center justify-center z-[1]">
          <div className="relative w-[85vw] md:w-[450px] lg:w-[600px] aspect-square">
              <Image 
              ref={imageRef as any}
              src="/assests/CuteBoy.png" 
              alt="Portal Window Transition"
              fill
              quality={70}
              className="object-contain" // Keeps it fully visible and correctly proportioned
              priority
            />
          </div>
        </div>

        {/* 
          The overlay ensures that as we get super close to the pixelated black window,
          it transitions smoothly into pure pitch black. 
        */}
        <div 
          ref={overlayRef}
          className="absolute inset-0 w-full h-full bg-black pointer-events-none opacity-0"
        />
      </div>
    </section>
  );
}
