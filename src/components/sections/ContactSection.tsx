"use client";

import { useRef, useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import styles from "./ContactSection.module.css";
import { useForm } from "@formspree/react";

const SOCIALS = [
  { name: "GitHub", url: "https://github.com/SudaisKhattakllc" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/sudais-khan-876570383/" },
  { name: "Twitter", url: "https://x.com/SudaisKhattak__" },
  { name: "FACEBOOK", url: "https://web.facebook.com/GWMGeraldAlpha/" }
];

const INFO = [
  { icon: "✦", label: "Email",    value: "isudaiskhan9818@gmail.com",  href: "mailto:isudaiskhan9818@gmail.com" },
  { icon: "◈", label: "Based In", value: "Islamabad, Pakistan" },
  { icon: "◎", label: "Response", value: "Within 24 hours" },
];

function HoverGrid() {
  const COLS = 14, ROWS = 6;
  return (
    <div className={styles.hoverGrid} aria-hidden="true">
      {Array.from({ length: COLS * ROWS }, (_, i) => <div key={i} className={styles.hoverTile} />)}
    </div>
  );
}

export default function ContactSection() {
  const sectionRef = useScrollReveal();
  const [state, handleSubmit] = useForm("xzdkovnw");

  useEffect(() => {
    if (state.succeeded) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.succeeded]);

  return (
    <section
      id="contact"
      className={styles.contact}
      ref={sectionRef as React.RefObject<HTMLElement>}
    >
      <HoverGrid />

      <div className={styles.inner}>
        <div className={styles.containerGrid}>

          {/* LEFT — title + info */}
          <div className={styles.leftCol}>
            <div>
              <p className={`${styles.eyebrow} reveal`}>Get In Touch</p>
              <h2 className={`${styles.title} reveal reveal-delay-1`}>
                Let&apos;s<br />
                <span>WORK</span><br />
                <em className={styles.titleTogether}>Together.</em>
              </h2>
            </div>

            <div className={`${styles.infoSection} reveal reveal-delay-2`}>
              {INFO.map(({ icon, label, value, href }) => (
                <div key={label} className={styles.infoItem}>
                  <span className={styles.infoIcon}>{icon}</span>
                  <div>
                    <p className={styles.infoLabel}>{label}</p>
                    {href
                      ? <a href={href} className={styles.infoValue}>{value}</a>
                      : <span className={styles.infoValue}>{value}</span>}
                  </div>
                </div>
              ))}

              <div className={styles.socialRow}>
                {SOCIALS.map((s) => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                    <span className={styles.socialBtnBg} />
                    <span className={styles.socialBtnLabel}>{s.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — form */}
          <div className={`${styles.rightCol} reveal reveal-delay-2`}>
            {state.succeeded ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-bebas)] text-4xl tracking-widest mb-3 text-white">MESSAGE SENT</h3>
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-neutral-400">
                  Thanks for reaching out! I'll be in touch soon.
                </p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <Field label="Name" name="name" type="text" placeholder="Your full name" />
                  <Field label="Email" name="email" type="email" placeholder="your@email.com" />
                </div>
                <Field label="Subject" name="subject" type="text" placeholder="What&apos;s this about?" />
                <div className={styles.fieldWrap}>
                  <label className={styles.fieldLabel}>Message</label>
                  <textarea
                    name="message"
                    className={styles.input}
                    rows={6}
                    placeholder="Tell me about your project..."
                    required
                  />
                </div>

                <button type="submit" disabled={state.submitting} className={styles.submitBtn}>
                  <span className={styles.btnWipe} aria-hidden="true" />
                  <span>{state.submitting ? "Sending..." : "Send Message"}</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 7.5h11M9 3.5l4 4-4 4" />
                  </svg>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* ── PREMIUM FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.footerName}>SUDAIS KHAN</span>
            <span className={styles.footerTagline}>Creative Developer &amp; Designer</span>
          </div>
          <nav className={styles.footerNav} aria-label="Footer navigation">
            {["hero", "projects", "about", "contact"].map((id) => (
              <a key={id} href={`#${id}`} className={styles.footerNavLink}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            ))}
          </nav>
          <div className={styles.footerSocials}>
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink}>{s.name}</a>
            ))}
          </div>
        </div>

        <div className={styles.footerDivider} />

        <div className={styles.footerBottom}>
          <span>© 2025 Sudais Khan — All rights reserved</span>
          <span className={styles.footerBuilt}>Designed &amp; Built with precision</span>
        </div>
      </footer>
    </section>
  );
}

// ── Mini reusable field ────────────────────────────────────────
function Field({ label, name, type, placeholder }: { label: string; name: string; type: string; placeholder: string }) {
  return (
    <div className={styles.fieldWrap}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        name={name}
        className={styles.input}
        type={type}
        placeholder={placeholder}
        required={type === "email" || label === "Name"}
      />
    </div>
  );
}
