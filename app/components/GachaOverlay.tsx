"use client";

import { useEffect, useRef, useState } from "react";
import { DARK } from "../lib/theme";
import { PLANT_NAMES, getMaxStage, getPlantImageSrc } from "../lib/plant";

export type GachaState = {
  completedPlantType: number;
  newPlantType: number;
};

const NT_GREEN = "#2E5B3E";
const NIGHT = "#0D110C";
const PARCHMENT = "#F0E8D2";
const PARCHMENT_DIM = "#A89F88";

const CHARGE_MS = 1600;
const DECAY_MS = 650;
const RING_R = 96;
const RING_C = 2 * Math.PI * RING_R;

function Motes({ count, tone }: { count: number; tone: "night" | "dawn" }) {
  const motes = Array.from({ length: count }, (_, i) => ({
    left: `${12 + ((i * 37) % 76)}%`,
    bottom: `${8 + ((i * 23) % 30)}%`,
    size: 3 + ((i * 7) % 4),
    delay: (i * 0.9) % 4,
    dur: 3.6 + ((i * 13) % 20) / 10,
    color: tone === "night"
      ? (i % 3 === 0 ? "rgba(255,248,225,.85)" : "rgba(217,172,75,.7)")
      : "rgba(196,146,42,.5)",
  }));
  return (
    <>
      {motes.map((m, i) => (
        <div key={i} style={{
          position: "absolute", left: m.left, bottom: m.bottom,
          width: m.size, height: m.size, borderRadius: "50%",
          background: m.color,
          animation: `gx-mote ${m.dur}s ease-out ${m.delay}s infinite`,
          pointerEvents: "none",
        }} />
      ))}
    </>
  );
}

export function GachaOverlay({ gacha, onDone, onReveal }: { gacha: GachaState; onDone: () => void; onReveal?: () => void }) {
  const [phase, setPhase] = useState<"farewell" | "seed" | "reveal">("farewell");
  const [flash, setFlash] = useState(false);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const holdingRef = useRef(false);
  const progressRef = useRef(0);
  const chargedRef = useRef(false);

  // Act 1 → Act 2
  useEffect(() => {
    if (phase !== "farewell") return;
    const t = setTimeout(() => setPhase("seed"), 3400);
    return () => clearTimeout(t);
  }, [phase]);

  // Reaching the reveal = the new plant is committed. Notify the parent so it can
  // clear the pending-gacha flag now; even if the user closes the app before
  // tapping "育てはじめる", the home won't revert to the completed plant.
  const revealedRef = useRef(false);
  useEffect(() => {
    if (phase === "reveal" && !revealedRef.current) {
      revealedRef.current = true;
      onReveal?.();
    }
  }, [phase, onReveal]);

  // Act 2: long-press charge loop
  useEffect(() => {
    if (phase !== "seed") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const p = progressRef.current;
      const next = holdingRef.current
        ? Math.min(1, p + dt / CHARGE_MS)
        : Math.max(0, p - dt / DECAY_MS);
      progressRef.current = next;
      setProgress(next);
      if (next >= 1 && !chargedRef.current) {
        chargedRef.current = true;
        try { navigator.vibrate?.(40); } catch {}
        setFlash(true);
        setTimeout(() => setPhase("reveal"), 200);
        setTimeout(() => setFlash(false), 1100);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const release = () => { holdingRef.current = false; setHolding(false); };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [phase]);

  const glow = 0.3 + progress * 0.7;
  // Cocoon tremble: faint stirring while asleep → stronger while held → fierce just before waking
  const trembleAnim = !holding
    ? "gx-tremble-soft 2.2s ease-in-out infinite"
    : progress > 0.68
      ? "gx-tremble 0.26s linear infinite"
      : "gx-tremble 0.55s linear infinite";

  return (
    <div
      onContextMenu={e => e.preventDefault()}
      style={{
        position: "fixed", inset: 0, zIndex: 160,
        display: "flex", justifyContent: "center",
        animation: "fadeIn 0.4s ease",
        userSelect: "none", WebkitUserSelect: "none",
        touchAction: "none",
      }}
    >
      {/* Night layer */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at 50% 32%, #19231622 0%, transparent 60%), radial-gradient(circle at 50% 40%, #1A2417 0%, ${NIGHT} 75%)`,
        opacity: phase === "reveal" ? 0 : 1,
        transition: "opacity 1.8s ease",
      }} />
      {/* Dawn layer */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #F6EEDD 0%, #EAE3D6 46%, #E7D3AB 100%)",
        opacity: phase === "reveal" ? 1 : 0,
        transition: "opacity 1.8s ease",
      }} />
      {/* Dawn sun bloom */}
      <div style={{
        position: "absolute", left: "50%", top: "44%",
        transform: "translate(-50%,-50%)",
        width: 460, height: 460, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(228,186,100,.55) 0%, rgba(228,186,100,0) 65%)",
        opacity: phase === "reveal" ? 1 : 0,
        transition: "opacity 2.2s ease 0.3s",
        pointerEvents: "none",
      }} />

      {/* Charge flash */}
      {flash && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 8,
          background: "radial-gradient(circle at 50% 48%, rgba(255,251,238,1) 0%, rgba(243,219,158,.96) 50%, rgba(222,183,100,.8) 100%)",
          animation: "gx-flash 1.1s ease-out both",
          pointerEvents: "none",
        }} />
      )}

      <div
        onPointerDown={phase === "seed" ? () => { holdingRef.current = true; setHolding(true); } : undefined}
        onClick={phase === "farewell" ? () => setPhase("seed") : undefined}
        style={{
          width: "100%", maxWidth: 390, minHeight: "100dvh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: 28, textAlign: "center",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* ---- Act 1: farewell ---- */}
        {phase === "farewell" && (
          <>
            <Motes count={7} tone="night" />
            <div style={{ position: "relative", display: "grid", placeItems: "center", marginBottom: 26 }}>
              <div style={{
                position: "absolute", width: 330, height: 330, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(234,227,214,.32) 0%, rgba(234,227,214,0) 68%)",
                animation: "gx-bloom 1.4s ease both",
              }} />
              <img
                src={getPlantImageSrc(gacha.completedPlantType, getMaxStage(gacha.completedPlantType))}
                alt="completed plant"
                draggable={false}
                style={{
                  position: "relative", width: 256, height: 256, objectFit: "cover",
                  WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 48%, transparent 74%)",
                  maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 48%, transparent 74%)",
                  animation: "gx-rise 1s cubic-bezier(.22,.8,.3,1) both",
                }}
              />
            </div>
            <div style={{
              fontFamily: "var(--font-shippori), serif", fontSize: 25, fontWeight: 600,
              color: PARCHMENT, letterSpacing: 2,
              animation: "gx-fade-up 0.9s ease 0.4s both",
            }}>
              {PLANT_NAMES[gacha.completedPlantType]}が、満ちました
            </div>
            <div style={{
              fontSize: 13, color: PARCHMENT_DIM, letterSpacing: 1, marginTop: 12,
              animation: "gx-fade-up 0.9s ease 0.8s both",
            }}>
              全{getMaxStage(gacha.completedPlantType)}ステージ、育てきりました
            </div>
          </>
        )}

        {/* ---- Act 2: sleeping seed, long-press to wake ---- */}
        {phase === "seed" && (
          <>
            <Motes count={9} tone="night" />
            <div style={{ position: "relative", display: "grid", placeItems: "center", width: 260, height: 260, marginBottom: 30, animation: "fadeIn 0.9s ease both" }}>
              {/* Progress ring */}
              <svg width={220} height={220} viewBox="0 0 220 220" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                <circle cx={110} cy={110} r={RING_R} fill="none" stroke="rgba(217,172,75,.14)" strokeWidth={1.5} />
                <circle
                  cx={110} cy={110} r={RING_R} fill="none"
                  stroke="#D9AC4B" strokeWidth={2.5} strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - progress)}
                  style={{ filter: progress > 0 ? `drop-shadow(0 0 ${4 + progress * 8}px rgba(217,172,75,.8))` : "none" }}
                />
              </svg>
              {/* Halo */}
              <div style={{
                position: "absolute", width: 240, height: 240, borderRadius: "50%",
                background: `radial-gradient(circle, rgba(235,199,112,${0.4 * glow}) 0%, rgba(235,199,112,0) 62%)`,
                transform: `scale(${1 + progress * 0.18})`,
                transition: "transform 0.2s linear",
              }} />
              {/* Invitation ripple — "touch here" */}
              {!holding && (
                <div style={{
                  position: "absolute", width: 128, height: 128, borderRadius: "50%",
                  border: "1.5px solid rgba(217,172,75,.6)",
                  animation: "gx-invite 2.6s ease-out infinite",
                  pointerEvents: "none",
                }} />
              )}
              {/* Light cocoon */}
              <div style={{ animation: "gx-breathe 3s ease-in-out infinite" }}>
                <div style={{
                  width: 86, height: 86, borderRadius: "50%",
                  background: "radial-gradient(circle at 40% 34%, #FFFAEB 0%, #F2DCA4 42%, #CC9C3A 100%)",
                  boxShadow: `0 0 ${28 + progress * 86}px ${8 + progress * 24}px rgba(226,182,92,${0.32 + progress * 0.48})`,
                  animation: trembleAnim,
                  transition: "box-shadow 0.15s linear",
                }} />
              </div>
            </div>
            <div style={{
              fontFamily: "var(--font-shippori), serif", fontSize: 19,
              color: PARCHMENT, letterSpacing: 2,
              animation: "gx-fade-up 0.9s ease 0.3s both",
            }}>
              あたらしい種が、眠っている
            </div>
            {/* Long-press guide pill */}
            <div style={{ marginTop: 18, animation: "gx-fade-up 0.9s ease 0.9s both" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "11px 24px", borderRadius: 26,
                border: `1.5px solid rgba(217,172,75,${0.5 + progress * 0.5})`,
                background: `rgba(217,172,75,${0.08 + progress * 0.14})`,
                animation: holding ? "none" : "gx-hint-glow 2.2s ease-in-out infinite",
                transition: "border-color 0.2s linear, background 0.2s linear",
              }}>
                <span style={{
                  width: 9, height: 9, borderRadius: "50%",
                  background: "#E4BC64",
                  boxShadow: "0 0 8px rgba(228,188,100,.9)",
                  animation: holding ? "none" : "gx-press-dot 1.6s ease-in-out infinite",
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: PARCHMENT, letterSpacing: 2 }}>
                  {holding ? "そのまま、押しつづける——" : "画面を長押しで、目覚めさせる"}
                </span>
              </div>
            </div>
          </>
        )}

        {/* ---- Act 3: dawn reveal ---- */}
        {phase === "reveal" && (
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Motes count={6} tone="dawn" />
            <div style={{
              fontFamily: "var(--font-shippori), serif", fontSize: 14, fontWeight: 600,
              color: "#A57E28", letterSpacing: 4, marginBottom: 2,
              animation: "gx-fade-up 0.8s ease 0.5s both",
            }}>
              新しい種が、めざめました
            </div>
            <img
              src={getPlantImageSrc(gacha.newPlantType, 1)}
              alt="new plant"
              draggable={false}
              style={{
                position: "relative", width: 250, height: 250, objectFit: "cover", display: "block",
                WebkitMaskImage: "radial-gradient(ellipse 62% 62% at 50% 52%, black 55%, transparent 76%)",
                maskImage: "radial-gradient(ellipse 62% 62% at 50% 52%, black 55%, transparent 76%)",
                animation: "gx-rise 1.1s cubic-bezier(.22,.8,.3,1) 0.2s both",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: -2, animation: "gx-fade-up 0.8s ease 0.7s both" }}>
              <div style={{ width: 34, height: 1, background: "linear-gradient(to left, #C4922A, transparent)" }} />
              <div style={{ fontFamily: "var(--font-shippori), serif", fontSize: 30, fontWeight: 700, color: DARK, letterSpacing: 3 }}>
                {PLANT_NAMES[gacha.newPlantType]}
              </div>
              <div style={{ width: 34, height: 1, background: "linear-gradient(to right, #C4922A, transparent)" }} />
            </div>
            <div style={{
              fontSize: 13, color: "#8A8272", letterSpacing: 1, marginTop: 12, marginBottom: 28,
              animation: "gx-fade-up 0.8s ease 0.95s both",
            }}>
              ここから、また育てていこう
            </div>
            <button onClick={onDone} style={{
              position: "relative", width: "100%", maxWidth: 280, height: 52, border: "none", borderRadius: 26,
              background: `linear-gradient(180deg, ${NT_GREEN}, color-mix(in oklab, ${NT_GREEN} 82%, black))`,
              color: "#F3EDDD", fontSize: 15, fontWeight: 700,
              boxShadow: "0 6px 22px rgba(45,80,55,.35)", cursor: "pointer",
              fontFamily: "var(--font-noto), sans-serif",
              animation: "gx-fade-up 0.8s ease 1.3s both",
            }}>
              育てはじめる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
