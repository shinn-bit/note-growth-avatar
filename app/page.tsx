"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDeviceId } from "./lib/deviceId";
import { NotificationToggle } from "./components/NotificationToggle";
import { BG, DARK, SOIL_TOP, SOIL_BOTTOM, PARCHMENT, PARCH_MUTED, SOIL_RULE, SOIL_GOLD, CREAM_BTN, CREAM_BTN_TEXT } from "./lib/theme";
import { Heatmap } from "./components/ui/Heatmap";
import { PLANT_NAMES, getMaxStage, getPlantImageSrc } from "./lib/plant";
import { FullScreenLoader } from "./components/ui/LoadingDots";
import { GachaOverlay, type GachaState } from "./components/GachaOverlay";
import { GrowthOverlay, LightRain, type GrowthState } from "./components/GrowthOverlay";
import { IconButton } from "./components/ui/IconButton";
import { FlowerIcon, JournalIcon, SlidersIcon, LeafIcon, SproutIcon, BellIcon, SparkleIcon } from "./components/ui/icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PENDING_GACHA_KEY = "note_avatar_pending_gacha";

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

function getTodayJST(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

  const canSubmit = !!url.trim() && !loading;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(10,14,10,0.7)", display: "flex", alignItems: "flex-end", zIndex: 100, animation: "fadeIn 0.22s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 390, margin: "0 auto",
        background: `linear-gradient(180deg, ${SOIL_TOP} 0%, ${SOIL_BOTTOM} 100%)`,
        borderRadius: "46% 54% 0 0 / 34px 28px 0 0",
        padding: "28px 26px 48px",
        boxShadow: "0 -10px 30px rgba(0,0,0,0.35)",
        animation: "slideUp 0.35s cubic-bezier(0.32,0.72,0,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--font-shippori), serif", fontSize: 11, fontWeight: 600, color: "#CBA24A", letterSpacing: 3 }}>
            本日の記録
          </span>
          <div onClick={onClose} style={{ width: 30, height: 30, borderRadius: 15, background: "rgba(239,232,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: PARCH_MUTED }}>✕</div>
        </div>
        <div style={{ fontFamily: "var(--font-shippori), serif", fontSize: 21, fontWeight: 600, color: PARCHMENT, letterSpacing: 1.5, marginBottom: 14 }}>
          今日の一歩を記録する
        </div>
        <div style={{ fontSize: 12, color: PARCH_MUTED, letterSpacing: 0.5, marginBottom: 9 }}>note記事のURLを貼り付けてください</div>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://note.com/..."
          style={{
            width: "100%", height: 50, borderRadius: 14,
            border: `1px solid ${url ? "rgba(203,162,74,0.65)" : "rgba(239,232,212,0.25)"}`,
            background: "rgba(239,232,212,0.07)",
            padding: "0 14px", fontSize: 14, color: PARCHMENT,
            outline: "none", transition: "border 0.2s", boxSizing: "border-box",
            fontFamily: "var(--font-noto), sans-serif",
          }}
        />
        {ogpLoading && <div style={{ fontSize: 12, color: PARCH_MUTED, marginTop: 8 }}>記事を取得中...</div>}
        {!ogpLoading && ogp && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(239,232,212,0.07)", border: "1px solid rgba(239,232,212,0.15)", borderRadius: 12, padding: "8px 12px", marginTop: 8, animation: "fadeIn 0.25s ease" }}>
            {ogp.image && <img src={ogp.image} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, flexShrink: 0, opacity: 0.92 }} />}
            <div style={{ fontSize: 12, color: PARCHMENT, fontWeight: 600, lineHeight: 1.4 }}>{ogp.title}</div>
          </div>
        )}
        {error && <div style={{ fontSize: 13, color: "#E0A08F", marginTop: 8 }}>{error}</div>}
        <div
          onClick={canSubmit ? submit : undefined}
          style={{
            marginTop: 16, height: 54, borderRadius: 27,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: canSubmit ? "pointer" : "default", userSelect: "none",
            background: canSubmit ? "linear-gradient(180deg, #F4EDDC 0%, #E6DCC4 100%)" : "rgba(239,232,212,0.12)",
            color: canSubmit ? "#2A3722" : "rgba(239,232,212,0.4)",
            fontSize: 15, fontWeight: 700, letterSpacing: 1,
            boxShadow: canSubmit ? "0 4px 20px rgba(0,0,0,0.35), 0 0 24px rgba(239,232,212,0.12)" : "none",
            transition: "background 0.25s, color 0.25s, box-shadow 0.25s",
          }}
        >
          {loading ? "記録中 …" : "記録する"}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState("");
  const [state, setState]   = useState<PlantState | null>(null);
  const [posts, setPosts]   = useState<PostCard[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postDates, setPostDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [imgKey, setImgKey] = useState(0);
  const [showPost, setShowPost] = useState(false);
  const [gacha, setGacha]   = useState<GachaState | null>(null);
  const [pendingGacha, setPendingGacha] = useState<GachaState | null>(null);
  const [growth, setGrowth] = useState<GrowthState | null>(null);
  const [watering, setWatering] = useState(false);
  const [toast, setToast]   = useState<{ main: string; sub?: string } | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [today, setToday] = useState(getTodayJST);
  const lastRefreshRef = useRef(0);

  async function handleReset() {
    if (!confirm("本当にリセットしますか？\nすべての進捗が消えます。")) return;
    setResetting(true);
    try {
      await fetch(`${API_URL}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      localStorage.removeItem("note_avatar_setup_done");
      localStorage.removeItem(PENDING_GACHA_KEY);
      router.push("/setup");
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
        setTotalPosts((raw as unknown[]).length);
        setPostDates((raw as { date: string }[]).map(p => p.date));
        const recent = (raw as { date: string; url: string }[]).slice(0, 1);
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
    if (typeof window !== "undefined" && !localStorage.getItem("note_avatar_setup_done")) {
      router.replace("/setup");
      return;
    }
    const id = getDeviceId();
    setDeviceId(id);
    fetchAll(id);
    try {
      const raw = localStorage.getItem(PENDING_GACHA_KEY);
      if (raw) setPendingGacha(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keep the screen fresh when the tab is left open. Whenever the user comes back
  // to this tab (switches back from note.com, unlocks the phone, etc.) we re-read
  // "today" and re-fetch state/history so the record button and stats aren't stuck
  // at whatever they were when the tab was first opened — no manual reload needed.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      if (!deviceId) return;
      const now = Date.now();
      if (now - lastRefreshRef.current < 3000) return; // throttle focus+visibility double-fire
      lastRefreshRef.current = now;
      setToday(getTodayJST());
      fetchAll(deviceId);
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  const handlePostSuccess = (result: SubmitResult) => {
    setShowPost(false);
    const prevType = state?.currentPlantType ?? 0;
    const prevStage = state?.currentPlantStage ?? 1;
    if (result.state) {
      setState(result.state);
      setImgKey(k => k + 1);
    }
    if (result.alreadySubmitted) {
      setToast({ main: "今日はすでに記録済みです" });
      setTimeout(() => setToast(null), 2600);
      return;
    }
    if (result.completedPlantType !== null && result.newPlantType !== null) {
      // Plant finished — don't force the gacha yet. Let the home screen show the
      // finished specimen at its final stage; the user opens the gacha themselves
      // via the "次の種を見つける" CTA when they're ready to move on.
      const pending: GachaState = { completedPlantType: result.completedPlantType, newPlantType: result.newPlantType };
      setPendingGacha(pending);
      try { localStorage.setItem(PENDING_GACHA_KEY, JSON.stringify(pending)); } catch {}
    } else if (result.state && result.state.currentPlantType === prevType && result.state.currentPlantStage > prevStage) {
      setGrowth({ plantType: prevType, fromStage: prevStage, toStage: result.state.currentPlantStage });
    } else if (result.state) {
      setWatering(true);
      setToast({ main: "今日の一歩を、記録しました", sub: `STREAK ${result.state.streak}日目` });
      setTimeout(() => setWatering(false), 2400);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const openPendingGacha = () => {
    if (pendingGacha) setGacha(pendingGacha);
  };

  const finishGacha = () => {
    setGacha(null);
    setPendingGacha(null);
    try { localStorage.removeItem(PENDING_GACHA_KEY); } catch {}
    if (deviceId) fetchAll(deviceId);
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  const isDebug = typeof window !== "undefined" && window.location.hostname === "localhost";
  const totalCompleted = state?.completedPlants?.length ?? 0;
  // While a finished plant awaits its gacha, keep showing that plant at its final
  // stage instead of the freshly-rolled next one that already lives in `state`.
  const currentPlantType = pendingGacha ? pendingGacha.completedPlantType : (state?.currentPlantType ?? 0);
  const maxStage = getMaxStage(currentPlantType);
  const currentPlantStage = pendingGacha ? maxStage : (state?.currentPlantStage ?? 1);
  const imgSrc = getPlantImageSrc(currentPlantType, currentPlantStage);
  const postedToday = !isDebug && state?.lastPostDate === today;
  const specimenNo = pendingGacha ? totalCompleted : totalCompleted + 1;
  const latestPost = posts[0] ?? null;

  return (
    <div style={{ background: BG, minHeight: "100dvh", position: "relative", maxWidth: 390, margin: "0 auto", display: "flex", flexDirection: "column" }}>

      {/* ── Light field: the plant ── */}
      <div style={{ position: "relative", width: "100%", height: 400, overflow: "hidden", flexShrink: 0 }}>
        <img
          key={imgKey}
          src={imgSrc}
          alt={PLANT_NAMES[currentPlantType]}
          style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom", display: "block", animation: watering ? "gw-sway 2.2s ease-in-out infinite" : "scaleIn 0.4s ease" }}
        />
        {watering && (
          <div style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none", animation: "fadeIn 0.3s ease" }}>
            <LightRain count={8} />
          </div>
        )}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 90, background: "linear-gradient(to bottom,rgba(234,227,214,0.95) 0%,rgba(234,227,214,0) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top,rgba(234,227,214,1) 0%,rgba(234,227,214,0) 100%)", pointerEvents: "none" }} />

        {/* Header */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
          <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-dancing), cursive", fontSize: 26, fontWeight: 700, color: DARK }}>note tree</span>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <IconButton href="/gallery" icon={<FlowerIcon />} label="図鑑" />
              <IconButton href="/history" icon={<JournalIcon />} label="履歴" />
              <div ref={settingsRef} style={{ position: "relative" }}>
                <div
                  onClick={() => setShowSettings(v => !v)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: 40, cursor: "pointer" }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(234,227,214,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.08)", color: "rgba(26,26,24,0.72)" }}>
                    <SlidersIcon />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(26,26,24,0.6)", letterSpacing: 0.5, lineHeight: 1 }}>設定</span>
                </div>
                {showSettings && (
                  <div style={{ position: "absolute", right: 0, top: 50, background: "white", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", padding: "8px 0", minWidth: 210, zIndex: 50, animation: "fadeIn 0.15s ease" }}>
                    <Link href="/gallery" style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 16px", fontSize: 13, color: DARK, textDecoration: "none", whiteSpace: "nowrap" }}><FlowerIcon size={15} color="#6A7060" /> 育てた植物ギャラリー</Link>
                    <Link href="/history" style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 16px", fontSize: 13, color: DARK, textDecoration: "none", whiteSpace: "nowrap" }}><JournalIcon size={15} color="#6A7060" /> 投稿履歴（全件）</Link>
                    <Link href="/setup" style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 16px", fontSize: 13, color: DARK, textDecoration: "none", whiteSpace: "nowrap" }}><BellIcon size={15} color="#6A7060" /> 通知設定</Link>
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

      {/* ── Soil panel: the cultivation record ── */}
      <div style={{
        flex: 1, position: "relative", zIndex: 2, marginTop: -34,
        background: `linear-gradient(180deg, ${SOIL_TOP} 0%, ${SOIL_BOTTOM} 100%)`,
        borderRadius: "46% 54% 0 0 / 38px 30px 0 0",
        padding: "30px 26px 26px",
        display: "flex", flexDirection: "column",
        boxShadow: "0 -10px 30px rgba(31,42,25,0.25)",
      }}>
        {/* Specimen head */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", animation: "gx-fade-up 0.6s ease both" }}>
          <span style={{ fontFamily: "var(--font-shippori), serif", fontSize: 11, fontWeight: 600, color: "#CBA24A", letterSpacing: 3 }}>
            標本 No.{specimenNo}
          </span>
          <span style={{ fontSize: 11, color: PARCH_MUTED, letterSpacing: 1.5 }}>
            ステージ {currentPlantStage} / {maxStage}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, animation: "gx-fade-up 0.6s 0.08s ease both" }}>
          <div style={{ fontFamily: "var(--font-shippori), serif", fontSize: 26, fontWeight: 600, color: PARCHMENT, letterSpacing: 2 }}>
            {PLANT_NAMES[currentPlantType]}
          </div>
          {/* Stage dots */}
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {Array.from({ length: maxStage }).map((_, i) => {
              const stage = i + 1;
              const filled = stage <= currentPlantStage;
              const isCurrent = stage === currentPlantStage;
              return (
                <div key={stage} style={{
                  width: isCurrent ? 9 : 7, height: isCurrent ? 9 : 7, borderRadius: "50%",
                  background: filled ? (isCurrent ? "#CBA24A" : "#C9D6B4") : "transparent",
                  border: filled ? "none" : "1px solid rgba(239,232,212,0.3)",
                  boxShadow: isCurrent ? "0 0 8px rgba(203,162,74,0.7)" : "none",
                }} />
              );
            })}
          </div>
        </div>

        <div style={{ height: 1, background: SOIL_RULE, margin: "18px 0 16px", animation: "gx-fade-up 0.6s 0.16s ease both" }} />

        {/* Ledger: streak / completed / total */}
        <div style={{ display: "flex", animation: "gx-fade-up 0.6s 0.24s ease both" }}>
          {[
            { value: state?.streak ?? 0, unit: "日", label: "連続" },
            { value: totalCompleted, unit: "株", label: "完成" },
            { value: totalPosts, unit: "篇", label: "通算" },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: 1, textAlign: "center", borderLeft: i > 0 ? `1px solid rgba(239,232,212,0.1)` : "none" }}>
              <div style={{ color: PARCHMENT }}>
                <span style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 27, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 11, color: PARCH_MUTED, marginLeft: 3 }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 10, color: PARCH_MUTED, letterSpacing: 2, marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: SOIL_RULE, margin: "16px 0", animation: "gx-fade-up 0.6s 0.32s ease both" }} />

        {/* Mini heatmap: last 4 weeks */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", animation: "gx-fade-up 0.6s 0.36s ease both" }}>
          <div>
            <div style={{ fontSize: 10, color: PARCH_MUTED, letterSpacing: 2, marginBottom: 4 }}>この4週間</div>
            <Link href="/history" style={{ fontSize: 11, color: "rgba(239,232,212,0.55)", textDecoration: "none", letterSpacing: 0.5 }}>
              12週の記録を見る →
            </Link>
          </div>
          <Heatmap dates={postDates} today={today} weeks={4} cellSize={12} gap={3} horizontal />
        </div>

        <div style={{ height: 1, background: SOIL_RULE, margin: "16px 0", animation: "gx-fade-up 0.6s 0.4s ease both" }} />

        {/* Latest entry */}
        <div style={{ animation: "gx-fade-up 0.6s 0.4s ease both" }}>
          {latestPost ? (
            <Link href="/history" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              {latestPost.image
                ? <img src={latestPost.image} alt="" style={{ width: 40, height: 40, borderRadius: 9, objectFit: "cover", flexShrink: 0, opacity: 0.92 }} />
                : <div style={{ width: 40, height: 40, borderRadius: 9, background: "rgba(239,232,212,0.08)", border: "1px solid rgba(239,232,212,0.15)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><SproutIcon size={18} color="#CBA24A" /></div>
              }
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: 10, color: PARCH_MUTED, letterSpacing: 1.5, marginBottom: 3 }}>最新の記録 · {latestPost.date}</div>
                <div style={{ fontSize: 13, color: PARCHMENT, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{latestPost.title || "（タイトル取得中）"}</div>
              </div>
              <span style={{ color: PARCH_MUTED, fontSize: 14, flexShrink: 0 }}>→</span>
            </Link>
          ) : (
            <div style={{ fontSize: 12, color: PARCH_MUTED, letterSpacing: 1, textAlign: "center", padding: "4px 0" }}>
              まだ記録がありません — 最初の一歩を残しましょう
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ marginTop: "auto", paddingTop: 22, animation: "gx-fade-up 0.6s 0.48s ease both" }}>
          {pendingGacha ? (
            <>
              <div style={{ textAlign: "center", fontSize: 11, color: "#CBA24A", letterSpacing: 2, marginBottom: 10 }}>
                この鉢は、満ちました
              </div>
              <div
                onClick={openPendingGacha}
                style={{
                  height: 54, borderRadius: 27, cursor: "pointer", userSelect: "none",
                  background: "linear-gradient(180deg, #E8CE93 0%, #CBA24A 100%)",
                  color: "#2A2010", fontSize: 15, fontWeight: 700, letterSpacing: 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.35), 0 0 26px rgba(203,162,74,0.4)",
                  animation: "gx-gacha-pulse 2.2s ease-in-out infinite",
                }}
              >
                <SparkleIcon size={16} color="#2A2010" /> 次の種を見つける
              </div>
            </>
          ) : postedToday ? (
            <div style={{
              height: 54, borderRadius: 27, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              border: "1px solid rgba(239,232,212,0.25)", color: PARCH_MUTED, fontSize: 14, fontWeight: 600, letterSpacing: 1,
            }}>
              <LeafIcon size={15} color={PARCH_MUTED} /> 今日は記録済み
            </div>
          ) : (
            <div
              onClick={() => setShowPost(true)}
              style={{
                height: 54, borderRadius: 27, cursor: "pointer", userSelect: "none",
                background: "linear-gradient(180deg, #F4EDDC 0%, #E6DCC4 100%)",
                color: "#2A3722", fontSize: 15, fontWeight: 700, letterSpacing: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.35), 0 0 24px rgba(239,232,212,0.12)",
              }}
            >
              今日の一歩を記録する
            </div>
          )}
        </div>
      </div>

      {showPost && deviceId && (
        <PostModal deviceId={deviceId} onClose={() => setShowPost(false)} onSuccess={handlePostSuccess} />
      )}

      {growth && (
        <GrowthOverlay growth={growth} onDone={() => setGrowth(null)} />
      )}

      {gacha && (
        <GachaOverlay gacha={gacha} onDone={finishGacha} />
      )}

      {toast && (
        <div style={{
          position: "fixed", top: 18, left: "50%", zIndex: 170,
          background: "rgba(255,255,255,0.95)", borderRadius: 18,
          border: "1px solid rgba(196,146,42,0.3)",
          boxShadow: "0 4px 18px rgba(90,70,35,0.16)",
          padding: "10px 20px", textAlign: "center",
          animation: "gw-toast 2.8s ease both",
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: DARK, letterSpacing: 0.5 }}>{toast.main}</div>
          {toast.sub && <div style={{ fontSize: 11, fontWeight: 700, color: "#A57E28", letterSpacing: 1.5, marginTop: 3 }}>{toast.sub}</div>}
        </div>
      )}
    </div>
  );
}
