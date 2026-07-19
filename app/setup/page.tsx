"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "../lib/deviceId";
import { SOIL_TOP, SOIL_BOTTOM, PARCHMENT, PARCH_MUTED, SOIL_GOLD, SOIL_LEAF, CREAM_BTN, CREAM_BTN_TEXT } from "../lib/theme";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Preset = { label: string; freqTimes: number; freqDays: number };

const PRESETS: Preset[] = [
  { label: "毎日", freqTimes: 1, freqDays: 1 },
  { label: "2日に1回", freqTimes: 1, freqDays: 2 },
  { label: "週3回", freqTimes: 3, freqDays: 7 },
  { label: "週2回", freqTimes: 2, freqDays: 7 },
  { label: "週1回", freqTimes: 1, freqDays: 7 },
];

function freqSummary(freqTimes: number, freqDays: number): string {
  if (freqDays === 1) return "毎日通知";
  if (freqTimes === 1) return `${freqDays}日に1回通知`;
  return `${freqDays}日に${freqTimes}回通知`;
}

export default function SetupPage() {
  const router = useRouter();
  const [freqTimes, setFreqTimes] = useState(1);
  const [freqDays, setFreqDays]   = useState(1);
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function applyPreset(idx: number) {
    const p = PRESETS[idx];
    setFreqTimes(p.freqTimes);
    setFreqDays(p.freqDays);
    setSelectedPreset(idx);
  }

  function handleCustomDays(val: number) {
    setFreqDays(val);
    if (freqTimes > val) setFreqTimes(val);
    setSelectedPreset("custom");
  }

  function handleCustomTimes(val: number) {
    setFreqTimes(val);
    if (freqDays < val) setFreqDays(val);
    setSelectedPreset("custom");
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const deviceId = getDeviceId();
      const res = await fetch(`${API_URL}/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, freqTimes, freqDays }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "エラーが発生しました");
        return;
      }
      localStorage.setItem("note_avatar_setup_done", "true");
      router.push("/");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 390, margin: "0 auto", minHeight: "100dvh", background: `linear-gradient(180deg, ${SOIL_TOP} 0%, ${SOIL_BOTTOM} 100%)`, position: "relative", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-shippori), serif", fontSize: 11, fontWeight: 600, color: SOIL_GOLD, letterSpacing: 3, marginBottom: 4 }}>設定</div>
          <div style={{ fontFamily: "var(--font-shippori), serif", fontSize: 22, fontWeight: 600, color: PARCHMENT, letterSpacing: 2 }}>通知の設定</div>
        </div>
        <div onClick={() => router.push("/")} style={{ width: 30, height: 30, borderRadius: 15, background: "rgba(239,232,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: PARCH_MUTED }}>✕</div>
      </div>

      <div style={{ padding: "8px 24px 0" }}>
        <p style={{ fontSize: 13, color: PARCH_MUTED, lineHeight: 1.7, margin: "8px 0 0" }}>
          投稿のリマインド通知のペースを設定します。<br />
          植物の成長は投稿のたびに進みます。
        </p>
      </div>

      <div style={{ padding: "24px 24px 40px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: PARCH_MUTED, letterSpacing: 2, marginBottom: 10 }}>通知のペース</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => applyPreset(i)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: `1.5px solid ${selectedPreset === i ? SOIL_LEAF : "rgba(239,232,212,0.25)"}`,
                background: selectedPreset === i ? "rgba(159,190,138,0.14)" : "rgba(239,232,212,0.06)",
                color: selectedPreset === i ? SOIL_LEAF : PARCH_MUTED,
                fontSize: 13,
                fontWeight: selectedPreset === i ? 700 : 500,
                cursor: "pointer",
                fontFamily: "var(--font-noto), sans-serif",
                transition: "all 0.15s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ background: "rgba(239,232,212,0.06)", border: "1px solid rgba(239,232,212,0.12)", borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: PARCH_MUTED, marginBottom: 8 }}>カスタム</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <select
              value={freqDays}
              onChange={e => handleCustomDays(Number(e.target.value))}
              style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid rgba(239,232,212,0.3)", background: "#33422B", fontSize: 14, color: PARCHMENT, cursor: "pointer" }}
            >
              {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <span style={{ fontSize: 14, color: PARCHMENT }}>日に</span>
            <select
              value={freqTimes}
              onChange={e => handleCustomTimes(Number(e.target.value))}
              style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid rgba(239,232,212,0.3)", background: "#33422B", fontSize: 14, color: PARCHMENT, cursor: "pointer" }}
            >
              {Array.from({ length: freqDays }, (_, i) => i + 1).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <span style={{ fontSize: 14, color: PARCHMENT }}>回通知</span>
          </div>
        </div>

        <div style={{ background: "rgba(159,190,138,0.12)", border: "1px solid rgba(159,190,138,0.25)", borderRadius: 14, padding: "12px 16px", marginBottom: 24, fontSize: 14, fontWeight: 700, color: SOIL_LEAF }}>
          設定: {freqSummary(freqTimes, freqDays)}
        </div>

        {error && (
          <div style={{ background: "rgba(224,160,143,0.1)", border: "1px solid rgba(224,160,143,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#E0A08F", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", height: 54, borderRadius: 27,
            background: loading ? "rgba(239,232,212,0.12)" : CREAM_BTN,
            color: loading ? "rgba(239,232,212,0.4)" : CREAM_BTN_TEXT,
            border: "none",
            fontSize: 15, fontWeight: 700, letterSpacing: 1,
            cursor: loading ? "default" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(0,0,0,0.35), 0 0 24px rgba(239,232,212,0.12)",
            fontFamily: "var(--font-noto), sans-serif",
            transition: "all 0.25s",
          }}
        >
          {loading ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  );
}
