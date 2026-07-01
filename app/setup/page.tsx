"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "../lib/deviceId";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const BG    = "#EAE3D6";
const GREEN = "#3D7A50";
const DARK  = "#1A1A18";

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
    <div style={{ width: "100%", maxWidth: 390, margin: "0 auto", minHeight: "100dvh", background: BG, position: "relative", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: DARK }}>通知の設定</div>
        <div onClick={() => router.push("/")} style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: "#8A9882" }}>✕</div>
      </div>

      <div style={{ padding: "8px 24px 0" }}>
        <p style={{ fontSize: 13, color: "#8A9080", lineHeight: 1.7, margin: "8px 0 0" }}>
          投稿のリマインド通知のペースを設定します。<br />
          植物の成長は投稿のたびに進みます。
        </p>
      </div>

      <div style={{ padding: "24px 24px 0", flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#A09080", letterSpacing: 1, marginBottom: 10 }}>NOTIFICATION PACE</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => applyPreset(i)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: `1.5px solid ${selectedPreset === i ? GREEN : "#C8C0B0"}`,
                background: selectedPreset === i ? "rgba(61,122,80,0.1)" : "rgba(255,255,255,0.7)",
                color: selectedPreset === i ? GREEN : "#6A7060",
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

        <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#9A9080", marginBottom: 8 }}>カスタム</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <select
              value={freqDays}
              onChange={e => handleCustomDays(Number(e.target.value))}
              style={{ padding: "6px 10px", borderRadius: 10, border: "1.5px solid #C8C0B0", background: "white", fontSize: 14, color: DARK, cursor: "pointer" }}
            >
              {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <span style={{ fontSize: 14, color: DARK }}>日に</span>
            <select
              value={freqTimes}
              onChange={e => handleCustomTimes(Number(e.target.value))}
              style={{ padding: "6px 10px", borderRadius: 10, border: "1.5px solid #C8C0B0", background: "white", fontSize: 14, color: DARK, cursor: "pointer" }}
            >
              {Array.from({ length: freqDays }, (_, i) => i + 1).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <span style={{ fontSize: 14, color: DARK }}>回通知</span>
          </div>
        </div>

        <div style={{ background: "rgba(61,122,80,0.08)", borderRadius: 14, padding: "12px 16px", marginBottom: 24, fontSize: 14, fontWeight: 700, color: GREEN }}>
          設定: {freqSummary(freqTimes, freqDays)}
        </div>

        {error && (
          <div style={{ background: "rgba(180,60,40,0.08)", border: "1px solid rgba(180,60,40,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#A04030", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", height: 56, borderRadius: 28,
            background: loading ? "#C0B8AE" : GREEN,
            color: "white", border: "none",
            fontSize: 16, fontWeight: 700,
            cursor: loading ? "default" : "pointer",
            boxShadow: loading ? "none" : "0 6px 22px rgba(61,122,80,0.4)",
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
