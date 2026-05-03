"use client";

import { useEffect, useState } from "react";
import { BotanicalCorners } from "./BotanicalCorners";

const BG    = "#EAE3D6";
const GREEN = "#3D7A50";
const GOLD  = "#C4922A";
const DARK  = "#1A1A18";

export function SplashGate({ children }: { children: React.ReactNode }) {
  const [show, setShow]     = useState(false);
  const [phase, setPhase]   = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("splash_shown")) return;
    sessionStorage.setItem("splash_shown", "1");
    setShow(true);

    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setLeaving(true), 3200),
      setTimeout(() => setShow(false), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      {children}
      {show && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: BG,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          opacity: leaving ? 0 : 1,
          transition: leaving ? "opacity 0.4s ease" : "none",
          overflow: "hidden",
        }}>
          <BotanicalCorners phase={phase >= 2 ? 3 : phase >= 1 ? 2 : 0} />

          {/* glow */}
          <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(196,146,42,0.10) 0%,transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-58%)", pointerEvents: "none", zIndex: 0 }} />

          {/* avatar */}
          <div style={{
            position: "relative", zIndex: 2, marginBottom: 8,
            animation: phase >= 1 ? "splashGrow 1s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
            opacity: phase >= 1 ? 1 : 0,
          }}>
            <div style={{ width: 230, height: 230, borderRadius: 24, overflow: "hidden", border: "1.5px solid rgba(200,185,155,0.55)", background: BG, boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
              <img src="/avatars/avatar_s2_normal.png" alt="avatar" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          </div>

          {/* title */}
          <div style={{
            position: "relative", zIndex: 2, textAlign: "center",
            animation: phase >= 2 ? "scriptReveal 0.7s ease both" : "none",
            opacity: phase >= 2 ? 1 : 0,
          }}>
            <div style={{ fontFamily: "var(--font-dancing), cursive", fontSize: 64, fontWeight: 700, color: DARK, lineHeight: 1, letterSpacing: -1 }}>
              note tree
            </div>
          </div>

          {/* tagline */}
          <div style={{
            position: "relative", zIndex: 2,
            fontSize: 12, color: "#7A8070", fontWeight: 500, letterSpacing: 3, marginTop: 10,
            animation: phase >= 3 ? "taglineIn 0.9s ease both" : "none",
            opacity: phase >= 3 ? 1 : 0,
          }}>
            継続を、成長に変える
          </div>

          {/* gold emblem */}
          <div style={{
            position: "relative", zIndex: 2, marginTop: 22,
            display: "flex", gap: 14, alignItems: "center",
            opacity: phase >= 3 ? 0.5 : 0, transition: "opacity 0.6s 0.4s",
          }}>
            <div style={{ height: 1, width: 40, background: `linear-gradient(90deg,transparent,${GOLD})` }} />
            <svg width="16" height="16" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="9" fill="none" stroke={GOLD} strokeWidth="1.2" />
              <path d="M10 2 Q7 8 10 10 Q13 8 10 2Z M6 5 Q9 9 10 10 Q8 13 4 14Z M14 5 Q11 9 10 10 Q12 13 16 14Z M10 10 Q8 14 10 18 Q12 14 10 10Z" fill={GOLD} opacity="0.85" />
            </svg>
            <div style={{ height: 1, width: 40, background: `linear-gradient(90deg,${GOLD},transparent)` }} />
          </div>

          {/* loading dots */}
          <div style={{ position: "absolute", bottom: 64, display: "flex", gap: 10, opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, animation: `shimmerDot 1.2s ${i * 0.22}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
