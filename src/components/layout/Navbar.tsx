"use client";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "WORK", href: "#projects" },
    { name: "ABOUT", href: "#about" },
    { name: "CONTACT", href: "#contact" },
  ];

  return (
    <>
      <style>{`
        @keyframes spin-border {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <nav 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] rounded-full transition-all duration-500 shadow-2xl overflow-hidden p-[1px]`}
      >
        {/* Rotating gradient background for the border */}
        <div 
          className="absolute inset-[-200%] z-0" 
          style={{ 
            animation: 'spin-border 4s linear infinite', 
            background: 'conic-gradient(from 0deg, transparent 0 280deg, #ffffff 320deg, transparent 360deg)' 
          }} 
        />

        {/* Inner pill content */}
        <div className={`relative z-10 px-4 py-2 flex items-center justify-center gap-2 md:gap-4 rounded-full w-full h-full transition-colors duration-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.15)] ${
          scrolled 
            ? 'bg-black/90 backdrop-blur-xl' 
            : 'bg-black/40 backdrop-blur-lg'
        }`}>
          <ul className="flex items-center m-0 p-0 list-none">
            {links.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="relative px-5 py-2.5 font-mono text-[11px] tracking-[0.25em] uppercase text-white/90 no-underline transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] group flex items-center"
                >
                  <div className="absolute inset-0 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors duration-300" />
                  <span className="relative z-10 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]">{link.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

