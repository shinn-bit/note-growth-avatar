"use client";

import { useEffect, useState } from "react";
import { BotanicalCorners } from "./BotanicalCorners";

const BG    = "#EAE3D6";
const GREEN = "#3D7A50";
const GOLD  = "#C4922A";
const DARK  = "#1A1A18";

const OB_STEPS = [
  {
    img: "/avatars/stage0_normal.png",
    title: "投稿するたびに\n木が育つ",
    body: "noteに記事を投稿するたびに、あなたの木が成長します。継続が目に見えて分かります。",
    accent: GOLD,
  },
  {
    img: "/avatars/stage3_damaged.png",
    title: "サボると\n枯れてしまう",
    body: "投稿が途切れると木がダメージを受けます。でも、また投稿すれば回復できます。",
    accent: "#A05040",
  },
  {
    img: "/avatars/stage5_normal.png",
    title: "継続して\n大樹を目指そう",
    body: "6段階の成長ステージを経て、最終的に藤の大樹へ。継続こそが最高の資産です。",
    accent: GREEN,
  },
];

function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const s = OB_STEPS[step];
  const isLast = step === OB_STEPS.length - 1;

  const next = () => {
    if (isLast) { onDone(); return; }
    setStep(v => v + 1);
    setAnimKey(k => k + 1);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 190, background: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "center" }}>
    <div style={{ width: "100%", maxWidth: 390, background: BG, display: "flex", flexDirection: "column", overflowY: "auto", position: "relative" }}>
      {/* 上隅だけ表示（下隅は説明テキストに被るため非表示） */}
      <BotanicalCorners phase={2} />

      {/* image — top 55% */}
      <div style={{ width: "100%", height: 340, position: "relative", flexShrink: 0, overflow: "hidden" }}>
        <img key={animKey} src={s.img} alt=""
          style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom", display: "block", animation: "scaleIn 0.5s ease" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: `linear-gradient(to top,${BG} 0%,transparent 100%)`, pointerEvents: "none" }} />
      </div>

      {/* content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 32px", zIndex: 2 }}>

        {/* skip pill — コンテンツ内右上 */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12, marginTop: 4 }}>
          <div onClick={onDone} style={{
            fontSize: 12, color: "#7A8070", fontWeight: 600, cursor: "pointer",
            padding: "5px 14px", borderRadius: 20,
            background: "rgba(255,255,255,0.65)", border: "1px solid rgba(0,0,0,0.08)",
            backdropFilter: "blur(4px)",
          }}>スキップ</div>
        </div>
        {/* step dots */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {OB_STEPS.map((_, i) => (
            <div key={i} style={{ height: 6, borderRadius: 3, width: i === step ? 28 : 8, background: i === step ? s.accent : "#C8C0B0", transition: "all 0.35s ease" }} />
          ))}
        </div>

        {/* title */}
        <div key={`t-${animKey}`} style={{ fontSize: 28, fontWeight: 700, color: DARK, lineHeight: 1.25, marginBottom: 14, whiteSpace: "pre-line", animation: "fadeInUp 0.45s ease both" }}>
          {s.title}
        </div>

        {/* body */}
        <div key={`b-${animKey}`} style={{ fontSize: 15, color: "#6A7068", lineHeight: 1.7, animation: "fadeInUp 0.45s 0.07s ease both" }}>
          {s.body}
        </div>

        {/* button */}
        <div style={{ marginTop: "auto", paddingBottom: 40 }}>
          <div onClick={next} style={{
            height: 56, borderRadius: 28, background: s.accent, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, cursor: "pointer",
            boxShadow: `0 6px 22px ${s.accent}55`, transition: "all 0.25s",
            position: "relative", overflow: "hidden",
          }}>
            <svg style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", opacity: 0.45 }} width="22" height="26" viewBox="0 0 28 32">
              <path d="M14 28 Q4 20 4 12 Q4 4 14 2 Q10 10 14 18 Q16 12 20 6 Q22 14 18 22 Z" fill="white" />
            </svg>
            {isLast ? "はじめる 🌱" : "次へ →"}
            <svg style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%) scaleX(-1)", opacity: 0.45 }} width="22" height="26" viewBox="0 0 28 32">
              <path d="M14 28 Q4 20 4 12 Q4 4 14 2 Q10 10 14 18 Q16 12 20 6 Q22 14 18 22 Z" fill="white" />
            </svg>
          </div>
          {step > 0 && (
            <div onClick={() => { setStep(v => v - 1); setAnimKey(k => k + 1); }}
              style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#9A9080", cursor: "pointer" }}>
              ← 戻る
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export function SplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash]   = useState(false);
  const [showOB, setShowOB]           = useState(false);
  const [phase, setPhase]             = useState(0);
  const [leaving, setLeaving]         = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const splashDone = sessionStorage.getItem("splash_shown");
    const obDone     = localStorage.getItem("onboarding_done");

    if (!splashDone) {
      sessionStorage.setItem("splash_shown", "1");
      setShowSplash(true);

      const timers = [
        setTimeout(() => setPhase(1), 200),
        setTimeout(() => setPhase(2), 900),
        setTimeout(() => setPhase(3), 1500),
        setTimeout(() => setLeaving(true), 3200),
        setTimeout(() => {
          setShowSplash(false);
          if (!obDone) setShowOB(true);
        }, 3600),
      ];
      return () => timers.forEach(clearTimeout);
    } else if (!obDone) {
      setShowOB(true);
    }
  }, []);

  const handleObDone = () => {
    localStorage.setItem("onboarding_done", "1");
    setShowOB(false);
  };

  return (
    <>
      {children}

      {showOB && <Onboarding onDone={handleObDone} />}

      {showSplash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: leaving ? "transparent" : "rgba(0,0,0,0.2)",
          display: "flex", justifyContent: "center", alignItems: "stretch",
          opacity: leaving ? 0 : 1, transition: leaving ? "opacity 0.4s ease" : "none",
        }}>
        <div style={{
          width: "100%", maxWidth: 390, background: BG,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          <BotanicalCorners phase={phase >= 2 ? 3 : phase >= 1 ? 2 : 0} />

          <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(196,146,42,0.10) 0%,transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-58%)", pointerEvents: "none", zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 2, marginBottom: 8, animation: phase >= 1 ? "splashGrow 1s cubic-bezier(0.34,1.56,0.64,1) both" : "none", opacity: phase >= 1 ? 1 : 0 }}>
            <div style={{ width: 230, height: 230, borderRadius: 24, overflow: "hidden", border: "1.5px solid rgba(200,185,155,0.55)", background: BG, boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
              <img src="/avatars/stage2_normal.png" alt="avatar" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 2, textAlign: "center", animation: phase >= 2 ? "scriptReveal 0.7s ease both" : "none", opacity: phase >= 2 ? 1 : 0 }}>
            <div style={{ fontFamily: "var(--font-dancing), cursive", fontSize: 64, fontWeight: 700, color: DARK, lineHeight: 1, letterSpacing: -1 }}>note tree</div>
          </div>

          <div style={{ position: "relative", zIndex: 2, fontSize: 12, color: "#7A8070", fontWeight: 500, letterSpacing: 3, marginTop: 10, animation: phase >= 3 ? "taglineIn 0.9s ease both" : "none", opacity: phase >= 3 ? 1 : 0 }}>
            継続を、成長に変える
          </div>

          <div style={{ position: "relative", zIndex: 2, marginTop: 22, display: "flex", gap: 14, alignItems: "center", opacity: phase >= 3 ? 0.5 : 0, transition: "opacity 0.6s 0.4s" }}>
            <div style={{ height: 1, width: 40, background: `linear-gradient(90deg,transparent,${GOLD})` }} />
            <svg width="16" height="16" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="9" fill="none" stroke={GOLD} strokeWidth="1.2" />
              <path d="M10 2 Q7 8 10 10 Q13 8 10 2Z M6 5 Q9 9 10 10 Q8 13 4 14Z M14 5 Q11 9 10 10 Q12 13 16 14Z M10 10 Q8 14 10 18 Q12 14 10 10Z" fill={GOLD} opacity="0.85" />
            </svg>
            <div style={{ height: 1, width: 40, background: `linear-gradient(90deg,${GOLD},transparent)` }} />
          </div>

          <div style={{ position: "absolute", bottom: 64, display: "flex", gap: 10, opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, animation: `shimmerDot 1.2s ${i * 0.22}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
        </div>
      )}
    </>
  );
}
