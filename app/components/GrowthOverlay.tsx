"use client";

import { useEffect, useRef, useState } from "react";
import { DARK } from "../lib/theme";
import { getMaxStage, getPlantImageSrc } from "../lib/plant";

export type GrowthState = {
  plantType: number;
  fromStage: number;
  toStage: number;
};

const RAIN_MS = 1650;
const AUTO_CLOSE_MS = 5400;

export function LightRain({ count }: { count: number }) {
  const drops = Array.from({ length: count }, (_, i) => ({
    left: `${16 + ((i * 31) % 68)}%`,
    delay: (i * 0.19) % 1.2,
    dur: 1.0 + ((i * 17) % 10) / 18,
    height: 16 + ((i * 11) % 14),
    opacity: 0.55 + ((i * 7) % 4) / 10,
  }));
  return (
    <>
      {drops.map((d, i) => (
        <div key={i} style={{
          position: "absolute", top: -30, left: d.left,
          width: 2, height: d.height, borderRadius: 2,
          background: "linear-gradient(180deg, rgba(228,188,100,0), rgba(228,188,100,.95))",
          opacity: d.opacity,
          animation: `gw-drop ${d.dur}s linear ${d.delay}s infinite`,
          pointerEvents: "none",
        }} />
      ))}
    </>
  );
}

export function GrowthOverlay({ growth, onDone }: { growth: GrowthState; onDone: () => void }) {
  const [phase, setPhase] = useState<"rain" | "after">("rain");
  const [bloom, setBloom] = useState(false);
  const doneRef = useRef(false);

  const close = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    const t1 = setTimeout(() => { setBloom(true); setPhase("after"); }, RAIN_MS);
    const t2 = setTimeout(() => setBloom(false), RAIN_MS + 900);
    const t3 = setTimeout(close, AUTO_CLOSE_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const maxStage = getMaxStage(growth.plantType);

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 150,
        background: "rgba(240,234,222,0.97)",
        display: "flex", justifyContent: "center",
        animation: "fadeIn 0.3s ease",
        userSelect: "none", WebkitUserSelect: "none",
        cursor: "pointer",
      }}
    >
      {/* Warm light from above */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(228,186,100,.34), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Soft golden bloom on transformation */}
      {bloom && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 6,
          background: "radial-gradient(circle at 50% 46%, rgba(255,250,235,.95) 0%, rgba(243,219,158,.7) 45%, rgba(228,186,100,0) 78%)",
          animation: "gx-flash 0.9s ease-out both",
          pointerEvents: "none",
        }} />
      )}

      <div style={{
        width: "100%", maxWidth: 390, minHeight: "100dvh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 28, textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Plant: old → new crossfade */}
        <div style={{ position: "relative", width: 264, height: 264, marginBottom: 20 }}>
          {phase === "rain" && <LightRain count={9} />}
          {/* Ground glow builds under the rain, blooms on stage-up */}
          <div style={{
            position: "absolute", left: "50%", top: "56%", transform: "translate(-50%,-50%)",
            width: 250, height: 250, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(228,186,100,.4) 0%, rgba(228,186,100,0) 66%)",
            opacity: phase === "after" ? 1 : 0.45,
            transition: "opacity 0.9s ease",
            pointerEvents: "none",
          }} />
          <img
            src={getPlantImageSrc(growth.plantType, growth.fromStage)}
            alt=""
            draggable={false}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              WebkitMaskImage: "radial-gradient(ellipse 62% 62% at 50% 52%, black 52%, transparent 76%)",
              maskImage: "radial-gradient(ellipse 62% 62% at 50% 52%, black 52%, transparent 76%)",
              opacity: phase === "rain" ? 1 : 0,
              transition: "opacity 0.7s ease",
              animation: phase === "rain" ? "gw-sway 2.2s ease-in-out infinite" : "none",
            }}
          />
          <img
            src={getPlantImageSrc(growth.plantType, growth.toStage)}
            alt="grown plant"
            draggable={false}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              WebkitMaskImage: "radial-gradient(ellipse 62% 62% at 50% 52%, black 52%, transparent 76%)",
              maskImage: "radial-gradient(ellipse 62% 62% at 50% 52%, black 52%, transparent 76%)",
              opacity: phase === "after" ? 1 : 0,
              transform: phase === "after" ? "scale(1)" : "scale(0.94)",
              transition: "opacity 0.7s ease, transform 0.9s cubic-bezier(.22,.8,.3,1)",
            }}
          />
        </div>

        {phase === "rain" ? (
          <div style={{
            fontFamily: "var(--font-shippori), serif", fontSize: 16,
            color: "#6E6654", letterSpacing: 2,
            animation: "gx-fade-up 0.8s ease 0.3s both",
          }}>
            今日の一歩が、光になる——
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: "var(--font-shippori), serif", fontSize: 24, fontWeight: 600,
              color: DARK, letterSpacing: 2,
              animation: "gx-fade-up 0.8s ease 0.5s both",
            }}>
              ひとつ、育ちました
            </div>
            <div style={{
              fontSize: 13, color: "#A57E28", fontWeight: 700, letterSpacing: 3, marginTop: 12,
              animation: "gx-fade-up 0.8s ease 0.8s both",
            }}>
              ステージ {growth.fromStage} → {growth.toStage} <span style={{ color: "#B0A890", fontWeight: 400 }}>/ {maxStage}</span>
            </div>
            <div style={{
              fontSize: 11, color: "#B0A890", letterSpacing: 2, marginTop: 26,
              animation: "gx-hint 2.4s ease-in-out 1.6s infinite, gx-fade-up 0.8s ease 1.4s both",
            }}>
              タップでとじる
            </div>
          </>
        )}
      </div>
    </div>
  );
}
