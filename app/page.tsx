"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getDeviceId } from "./lib/deviceId";
import { NotificationToggle } from "./components/NotificationToggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const BG    = "#EAE3D6";
const GREEN = "#3D7A50";
const GOLD  = "#C4922A";
const DARK  = "#1A1A18";

// Plant type 0 uses existing stage images; types 1-6 use {type}-{stage}.png
function getPlantImageSrc(plantType: number, stage: number): string {
  if (plantType === 0) {
    const stageNames = ["stage1_normal", "stage2_normal", "stage3_normal", "stage4_normal", "stage5_normal"];
    return `/avatars/${stageNames[Math.min(stage - 1, 4)]}.png`;
  }
  return `/avatars/${plantType}-${Math.min(stage, 5)}.png`;
}

const PLANT_NAMES = ["ふじの木", "植物A", "植物B", "植物C", "植物D", "植物E", "植物F"];

type PlantState = {
  streak: number;
  currentPlantType: number;
  currentPlantStage: number;
  completedPlants: number[];
  lastPostDate: string | null;
  freqTimes: number;
  freqDays: number;
};

type PostCard = { date: string; url: string; title: string; image: string };

type SubmitResult = {
  alreadySubmitted?: boolean;
  completedPlantType: number | null;
  newPlantType: number | null;
  state?: PlantState;
};

type GachaState = {
  completedPlantType: number;
  newPlantType: number;
};

function getTodayJST(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function GreenBtn({ label, onClick, disabled = false }: {
  label: string; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <div onClick={disabled ? undefined : onClick} style={{
      height: 56, borderRadius: 28,
      background: disabled ? "#C0B8AE" : GREEN,
      color: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, fontWeight: 700,
      cursor: disabled ? "default" : "pointer",
      boxShadow: disabled ? "none" : "0 6px 22px rgba(61,122,80,0.4)",
      transition: "all 0.25s",
      animation: disabled ? "none" : "pulseGlow 2.5s ease-in-out infinite",
      userSelect: "none",
      position: "relative", overflow: "hidden",
    }}>
      <svg style={{ position: "absolute", left: 16, top: "50%", animation: "btnLeafL 3s ease-in-out infinite", opacity: disabled ? 0.15 : 0.5 }} width="24" height="28" viewBox="0 0 28 32">
        <path d="M14 28 Q4 20 4 12 Q4 4 14 2 Q10 10 14 18 Q16 12 20 6 Q22 14 18 22 Z" fill="white" />
      </svg>
      {label}
      <svg style={{ position: "absolute", right: 16, top: "50%", animation: "btnLeafR 3s ease-in-out infinite", opacity: disabled ? 0.15 : 0.5 }} width="24" height="28" viewBox="0 0 28 32">
        <path d="M14 28 Q4 20 4 12 Q4 4 14 2 Q10 10 14 18 Q16 12 20 6 Q22 14 18 22 Z" fill="white" />
      </svg>
    </div>
  );
}

function GachaOverlay({ gacha, onDone }: { gacha: GachaState; onDone: () => void }) {
  const [phase, setPhase] = useState<"complete" | "gacha" | "reveal">("complete");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("gacha"), 2000);
    const t2 = setTimeout(() => setPhase("reveal"), 3600);
    const t3 = setTimeout(onDone, 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 160,
      background: "rgba(234,227,214,0.98)",
      display: "flex", justifyContent: "center",
      animation: "fadeIn 0.25s ease",
    }}>
      <div style={{
        width: "100%", maxWidth: 390, minHeight: "100dvh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "28px", textAlign: "center",
        position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 38%, rgba(196,146,42,0.18), transparent 42%)", pointerEvents: "none" }} />

        {phase === "complete" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16, animation: "scaleIn 0.4s ease" }}>🎉</div>
            <div style={{ width: 200, height: 200, borderRadius: 24, overflow: "hidden", border: `2px solid ${GOLD}`, background: BG, boxShadow: "0 0 40px rgba(196,146,42,0.4)", animation: "scaleIn 0.4s ease", marginBottom: 20 }}>
              <img src={getPlantImageSrc(gacha.completedPlantType, 5)} alt="completed" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: DARK, animation: "fadeInUp 0.45s ease" }}>
              {PLANT_NAMES[gacha.completedPlantType]}が完成！
            </div>
            <div style={{ fontSize: 14, color: "#6A7068", marginTop: 8, animation: "fadeInUp 0.45s 0.1s ease both" }}>
              全5ステージをクリアしました
            </div>
          </>
        )}

        {phase === "gacha" && (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#6A7068", marginBottom: 20 }}>次の植物は…</div>
            <div style={{ width: 120, height: 120, borderRadius: 20, background: "rgba(61,122,80,0.1)", border: `2px dashed ${GREEN}`, display: "flex", alignItems: "center", justifyContent: "center", animation: "shimmerDot 0.8s ease-in-out infinite", marginBottom: 20 }}>
              <div style={{ fontSize: 40, animation: "spin 0.6s linear infinite" }}>🌿</div>
            </div>
            <div style={{ fontSize: 16, color: "#9A9080" }}>ガチャ中...</div>
          </>
        )}

        {phase === "reveal" && (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, color: GOLD, marginBottom: 16, animation: "fadeInUp 0.4s ease" }}>
              新しい植物が来た！
            </div>
            <div style={{ width: 200, height: 200, borderRadius: 24, overflow: "hidden", border: `2px solid ${GREEN}`, background: BG, boxShadow: "0 0 40px rgba(61,122,80,0.3)", animation: "scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)", marginBottom: 20 }}>
              <img src={getPlantImageSrc(gacha.newPlantType, 1)} alt="new plant" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: DARK, animation: "fadeInUp 0.4s ease" }}>
              {PLANT_NAMES[gacha.newPlantType]}
            </div>
            <div style={{ fontSize: 14, color: "#6A7068", marginTop: 8, marginBottom: 24, animation: "fadeInUp 0.4s 0.1s ease both" }}>
              ステージ1からスタート！
            </div>
            <button onClick={onDone} style={{
              width: "100%", maxWidth: 280, height: 52, border: "none", borderRadius: 26,
              background: GREEN, color: "white", fontSize: 15, fontWeight: 700,
              boxShadow: "0 6px 22px rgba(61,122,80,0.35)", cursor: "pointer",
              fontFamily: "var(--font-noto), sans-serif", animation: "fadeInUp 0.4s 0.2s ease both",
            }}>
              育てはじめる
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function PostModal({ deviceId, onClose, onSuccess }: {
  deviceId: string;
  onClose: () => void;
  onSuccess: (result: SubmitResult) => void;
}) {
  const [url, setUrl]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ogp, setOgp]     = useState<{ title: string; image: string } | null>(null);
  const [ogpLoading, setOgpLoading] = useState(false);

  useEffect(() => {
    setOgp(null);
    if (!url.includes("note.com")) return;
    setOgpLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
        const d = await r.json();
        setOgp(d.title || d.image ? d : null);
      } catch { setOgp(null); }
      finally { setOgpLoading(false); }
    }, 700);
    return () => { clearTimeout(t); setOgpLoading(false); };
  }, [url]);

  const isDebug = typeof window !== "undefined" && window.location.hostname === "localhost";

  const submit = async () => {
    if (!url.trim()) { setError("URLを入力してください"); return; }
    if (!isDebug && !url.includes("note.com")) {
      setError("note.com のURLを入力してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, url, ...(isDebug ? { debugMode: true } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "エラーが発生しました"); setLoading(false); return; }
      onSuccess(data);
    } catch { setError("通信エラーが発生しました"); setLoading(false); }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(10,14,10,0.65)", display: "flex", alignItems: "flex-end", zIndex: 100, animation: "fadeIn 0.22s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "100%", maxWidth: 390, margin: "0 auto", background: BG, borderRadius: "28px 28px 0 0", padding: "24px 24px 52px", animation: "slideUp 0.35s cubic-bezier(0.32,0.72,0,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: DARK }}>投稿を記録する</div>
          <div onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: "#8A9882" }}>✕</div>
        </div>
        <div style={{ fontSize: 13, color: "#8A9080", marginBottom: 9 }}>Note記事のURLを貼り付けてください</div>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://note.com/..."
          style={{ width: "100%", height: 50, borderRadius: 14, border: `1.5px solid ${url ? GREEN : "#C8C0B0"}`, background: "rgba(255,255,255,0.7)", padding: "0 14px", fontSize: 14, color: DARK, outline: "none", transition: "border 0.2s", boxSizing: "border-box", fontFamily: "var(--font-noto), sans-serif" }}
        />
        {ogpLoading && <div style={{ fontSize: 12, color: "#A09080", marginTop: 8 }}>記事を取得中...</div>}
        {!ogpLoading && ogp && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(255,255,255,0.7)", borderRadius: 12, padding: "8px 12px", marginTop: 8 }}>
            {ogp.image && <img src={ogp.image} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />}
            <div style={{ fontSize: 12, color: DARK, fontWeight: 600, lineHeight: 1.4 }}>{ogp.title}</div>
          </div>
        )}
        {error && <div style={{ fontSize: 13, color: "#A04030", marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: 14 }}>
          <GreenBtn label={loading ? "記録中 …" : "記録する 🌱"} onClick={submit} disabled={!url.trim() || loading} />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [deviceId, setDeviceId] = useState("");
  const [state, setState]   = useState<PlantState | null>(null);
  const [posts, setPosts]   = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [imgKey, setImgKey] = useState(0);
  const [showPost, setShowPost] = useState(false);
  const [gacha, setGacha]   = useState<GachaState | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [today] = useState(getTodayJST);

  async function handleReset() {
    if (!confirm("本当にリセットしますか？\nすべての進捗が消えます。")) return;
    setResetting(true);
    try {
      await fetch(`${API_URL}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      window.location.reload();
    } finally { setResetting(false); }
  }

  const fetchAll = async (id: string) => {
    try {
      const [stateRes, histRes] = await Promise.all([
        fetch(`${API_URL}/state?deviceId=${encodeURIComponent(id)}`),
        fetch(`${API_URL}/history?deviceId=${encodeURIComponent(id)}`),
      ]);
      if (stateRes.ok) {
        const data = await stateRes.json();
        setState(data as PlantState);
      }
      if (histRes.ok) {
        const { posts: raw } = await histRes.json();
        const recent = (raw as { date: string; url: string }[]).slice(0, 3);
        const withOgp = await Promise.all(recent.map(async p => {
          try {
            const r = await fetch(`/api/ogp?url=${encodeURIComponent(p.url)}`);
            const o = await r.json();
            return { date: p.date, url: p.url, title: o.title || "", image: o.image || "" };
          } catch { return { date: p.date, url: p.url, title: "", image: "" }; }
        }));
        setPosts(withOgp);
      }
    } catch {
      setState({ streak: 0, currentPlantType: 0, currentPlantStage: 1, completedPlants: [], lastPostDate: null, freqTimes: 1, freqDays: 1 });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchAll(id);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePostSuccess = (result: SubmitResult) => {
    setShowPost(false);
    if (result.state) {
      setState(result.state);
      setImgKey(k => k + 1);
    }
    if (result.completedPlantType !== null && result.newPlantType !== null) {
      setGacha({ completedPlantType: result.completedPlantType!, newPlantType: result.newPlantType! });
    }
  };

  const finishGacha = () => {
    setGacha(null);
    if (deviceId) fetchAll(deviceId);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", background: BG }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, animation: `shimmerDot 1.2s ${i * 0.22}s ease-in-out infinite` }} />)}
        </div>
      </div>
    );
  }

  const isDebug = typeof window !== "undefined" && window.location.hostname === "localhost";
  const currentPlantType = state?.currentPlantType ?? 0;
  const currentPlantStage = state?.currentPlantStage ?? 1;
  const imgSrc = getPlantImageSrc(currentPlantType, currentPlantStage);
  const postedToday = !isDebug && state?.lastPostDate === today;
  const totalCompleted = state?.completedPlants?.length ?? 0;

  return (
    <div style={{ background: BG, minHeight: "100dvh", position: "relative", overflow: "hidden", maxWidth: 390, margin: "0 auto", display: "flex", flexDirection: "column" }}>

      {/* Plant image area */}
      <div style={{ position: "relative", width: "100%", height: 420, overflow: "hidden", flexShrink: 0 }}>
        <img
          key={imgKey}
          src={imgSrc}
          alt={PLANT_NAMES[currentPlantType]}
          style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom", display: "block", animation: "scaleIn 0.4s ease" }}
        />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 90, background: "linear-gradient(to bottom,rgba(234,227,214,0.95) 0%,rgba(234,227,214,0) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top,rgba(234,227,214,1) 0%,rgba(234,227,214,0) 100%)", pointerEvents: "none" }} />

        {/* Header */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
          <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-dancing), cursive", fontSize: 26, fontWeight: 700, color: DARK }}>note tree</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {postedToday && (
                <div style={{ fontSize: 11, fontWeight: 700, color: "#4A8A5A", background: "rgba(230,244,232,0.92)", padding: "4px 10px", borderRadius: 12, border: "1px solid #B4D4B8", backdropFilter: "blur(4px)" }}>
                  🌿 今日投稿済み
                </div>
              )}
              {/* Gallery icon */}
              <div style={{ position: "relative" }} className="tooltip-wrap">
                <Link href="/gallery" style={{
                  width: 32, height: 32, borderRadius: 16,
                  background: "rgba(234,227,214,0.75)", backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, border: "1px solid rgba(0,0,0,0.08)", textDecoration: "none",
                }}>🌸</Link>
                <div style={{ position: "absolute", top: 38, right: 0, background: "rgba(26,26,24,0.85)", color: "white", fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 8, whiteSpace: "nowrap", pointerEvents: "none", opacity: 0, transition: "opacity 0.15s" }} className="tooltip">ギャラリー</div>
              </div>
              {/* History icon */}
              <div style={{ position: "relative" }} className="tooltip-wrap">
                <Link href="/history" style={{
                  width: 32, height: 32, borderRadius: 16,
                  background: "rgba(234,227,214,0.75)", backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, border: "1px solid rgba(0,0,0,0.08)", textDecoration: "none",
                }}>📋</Link>
                <div style={{ position: "absolute", top: 38, right: 0, background: "rgba(26,26,24,0.85)", color: "white", fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 8, whiteSpace: "nowrap", pointerEvents: "none", opacity: 0, transition: "opacity 0.15s" }} className="tooltip">投稿履歴</div>
              </div>
              <div ref={settingsRef} style={{ position: "relative" }}>
                <div
                  onClick={() => setShowSettings(v => !v)}
                  style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(234,227,214,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", border: "1px solid rgba(0,0,0,0.08)" }}
                >⚙</div>
                {showSettings && (
                  <div style={{ position: "absolute", right: 0, top: 38, background: "white", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", padding: "8px 0", minWidth: 170, zIndex: 50, animation: "fadeIn 0.15s ease" }}>
                    <Link href="/gallery" style={{ display: "block", padding: "10px 16px", fontSize: 13, color: DARK, textDecoration: "none" }}>🌸 育てた植物ギャラリー</Link>
                    <Link href="/history" style={{ display: "block", padding: "10px 16px", fontSize: 13, color: DARK, textDecoration: "none" }}>🌿 投稿履歴（全件）</Link>
                    <Link href="/setup" style={{ display: "block", padding: "10px 16px", fontSize: 13, color: DARK, textDecoration: "none" }}>⚙ 通知設定</Link>
                    {deviceId && <div style={{ padding: "10px 16px" }}><NotificationToggle deviceId={deviceId} /></div>}
                    <div style={{ height: 1, background: "#EEE", margin: "4px 0" }} />
                    <button onClick={handleReset} disabled={resetting} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 12, color: "#D08070", background: "none", border: "none", cursor: "pointer" }}>
                      {resetting ? "リセット中..." : "最初からやり直す"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 110, position: "relative", zIndex: 2 }}>

        {/* Stage dots */}
        <div style={{ textAlign: "center", padding: "6px 0 14px" }}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginBottom: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i + 1 === currentPlantStage ? 24 : 10,
                  height: 10,
                  borderRadius: 5,
                  background: i + 1 <= currentPlantStage ? GREEN : "#C8C0B0",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#9A9080" }}>ステージ {currentPlantStage} / 5</div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, margin: "0 20px 14px" }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.7)", borderRadius: 18, padding: "12px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 10, color: "#A09080", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>STREAK</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: DARK, fontFamily: "var(--font-dm-serif), serif", lineHeight: 1 }}>{state?.streak ?? 0}</div>
            <div style={{ fontSize: 11, color: "#9A9080", marginTop: 2 }}>日連続</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.7)", borderRadius: 18, padding: "12px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 10, color: "#A09080", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>COMPLETED</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: DARK, fontFamily: "var(--font-dm-serif), serif", lineHeight: 1 }}>{totalCompleted}</div>
            <div style={{ fontSize: 11, color: "#9A9080", marginTop: 2 }}>植物完成</div>
          </div>
        </div>

        {/* Status banner */}
        <div style={{ margin: "0 20px 14px", background: postedToday ? "rgba(230,244,232,0.85)" : "rgba(255,255,255,0.7)", borderRadius: 18, padding: "14px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: postedToday ? "1.5px solid rgba(61,122,80,0.2)" : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, color: postedToday ? "#5A8A6A" : "#A09080", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>STATUS</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: postedToday ? GREEN : DARK, lineHeight: 1.3 }}>
              {postedToday ? "今日は投稿済み ✓" : "今日はまだ投稿していない"}
            </div>
            <div style={{ fontSize: 11, color: postedToday ? "#5A8A6A" : "#A09080", marginTop: 3 }}>
              {postedToday
                ? `ステージ${currentPlantStage}/5まで育った`
                : "投稿するたびに植物が育ちます"}
            </div>
          </div>
          <div style={{ fontSize: 32, flexShrink: 0 }}>{postedToday ? "🌿" : "🌱"}</div>
        </div>

        {/* Recent posts */}
        {posts.length > 0 && (
          <div style={{ margin: "0 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#A09080", letterSpacing: 1, marginBottom: 8 }}>最近の投稿</div>
            {posts.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.7)", borderRadius: 14, padding: "10px 14px", marginBottom: 7, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", textDecoration: "none" }}>
                {p.image
                  ? <img src={p.image} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(196,146,42,0.16)", border: "1px solid rgba(196,146,42,0.28)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌱</div>
                }
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DARK, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title || "（タイトル取得中）"}</div>
                  <div style={{ fontSize: 11, color: "#A09080", marginTop: 2 }}>{p.date}</div>
                </div>
              </a>
            ))}
            <Link href="/history" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 40, borderRadius: 20, marginTop: 4, border: "1px solid #C8C0B0", background: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, color: "#7A8070", textDecoration: "none" }}>
              もっと見る →
            </Link>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 40px)", maxWidth: 350, zIndex: 10 }}>
        <GreenBtn
          label={postedToday ? "今日は投稿済み ✓" : "＋ 投稿を記録する"}
          onClick={postedToday ? undefined : () => setShowPost(true)}
          disabled={postedToday}
        />
      </div>

      {showPost && deviceId && (
        <PostModal deviceId={deviceId} onClose={() => setShowPost(false)} onSuccess={handlePostSuccess} />
      )}

      {gacha && (
        <GachaOverlay gacha={gacha} onDone={finishGacha} />
      )}
    </div>
  );
}
