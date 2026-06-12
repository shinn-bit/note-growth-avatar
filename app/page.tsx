"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NotificationToggle } from "./components/NotificationToggle";
import { PromoModal } from "./components/PromoModal";
import { ShareButton } from "./components/ShareButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const BG    = "#EAE3D6";
const GREEN = "#3D7A50";
const GOLD  = "#C4922A";
const DARK  = "#1A1A18";
const RED_D = "#8A4030";

const STAGE_NAMES = ["種", "発芽", "若葉", "小さな植物", "小さな木", "大樹（藤）"];
const STAGE_DESC  = ["何も始まっていない", "ようやく芽が出た", "安定して育ち始めた", "青い花が咲いてきた", "資産感が出てきた", "藤の大樹になった！"];

const IMG_NORMAL  = ["stage0_normal", "stage1_normal", "stage2_normal", "stage3_normal", "stage4_normal", "stage5_normal"];
const IMG_DAMAGED = ["stage0_normal", "stage1_damaged", "stage2_damaged", "stage3_damaged", "stage4_damaged", "stage5_damaged"];

type AvatarState = {
  streak: number;
  avatarLevel: number;
  avatarDamage: number;
  formStage: number;
  stageProgress: number;
  stagePeak: number;
  stageMax: number;
  courseType: "1month" | "3month" | null;
  courseStartDate: string | null;
  freqTimes: number;
  freqDays: number;
  lastPostDate: string | null;
};

type PostCard = { date: string; url: string; title: string; image: string };

type SubmitResult = {
  alreadySubmitted?: boolean;
  message?: string;
  isMilestone?: boolean;
  state?: {
    streak: number;
    avatarLevel: number;
    avatarDamage: number;
    formStage: number;
    stageProgress: number;
    stagePeak: number;
    stageMax: number;
  };
};

type EvolutionState = {
  previousStage: number;
  nextStage: number;
  message: string;
};

function getTodayJST(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getHoursUntilNextJSTMidnight(): number {
  const now = Date.now();
  const jstNow = new Date(now + 9 * 60 * 60 * 1000);
  const nextMidnight = Date.UTC(
    jstNow.getUTCFullYear(), jstNow.getUTCMonth(), jstNow.getUTCDate() + 1
  ) - 9 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil((nextMidnight - now) / 3_600_000));
}

function calcDaysUntilDead(
  stageProgress: number,
  lastPostDate: string,
  today: string,
  freqTimes: number,
  freqDays: number
): number | null {
  if (stageProgress <= 0) return null;
  const interval = freqDays / freqTimes;
  const dayDiff = Math.round(
    (new Date(today).getTime() - new Date(lastPostDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, Math.ceil(stageProgress * interval - dayDiff + 1));
}

function CountdownBanner({
  stageProgress, lastPostDate, freqTimes, freqDays, today,
}: {
  stageProgress: number; lastPostDate: string | null;
  freqTimes: number; freqDays: number; today: string | null;
}) {
  const [hoursLeft] = useState(getHoursUntilNextJSTMidnight);

  if (!today) return null;

  // 未投稿の場合は促すメッセージを表示
  if (!lastPostDate) {
    return (
      <div style={{ margin: "0 20px 12px", background: "rgba(255,255,255,0.7)", borderRadius: 18, padding: "14px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, color: "#A09080", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>COUNTDOWN</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: DARK, lineHeight: 1.3 }}>まだ記録がありません</div>
          <div style={{ fontSize: 11, color: "#A09080", marginTop: 3 }}>投稿を記録すると植物が育ちます</div>
        </div>
        <div style={{ fontSize: 32 }}>🌱</div>
      </div>
    );
  }

  const postedToday = lastPostDate === today;
  const interval = freqDays / freqTimes;
  const isDaily = interval <= 1;
  const D = calcDaysUntilDead(stageProgress, lastPostDate, today, freqTimes, freqDays);

  if (D === null) {
    return (
      <div style={{ margin: "0 20px 12px", background: postedToday ? "rgba(230,244,232,0.85)" : "rgba(255,255,255,0.7)", borderRadius: 18, padding: "14px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: postedToday ? `1.5px solid rgba(61,122,80,0.2)` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, color: postedToday ? "#5A8A6A" : "#A09080", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>COUNTDOWN</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: postedToday ? GREEN : DARK, lineHeight: 1.3 }}>
            {postedToday ? "今日は投稿済み ✓" : "次の投稿で育ちます"}
          </div>
          <div style={{ fontSize: 11, color: postedToday ? "#5A8A6A" : "#A09080", marginTop: 3 }}>
            {postedToday ? "新しい成長が始まりました" : "投稿を記録して成長を進めよう"}
          </div>
        </div>
        <div style={{ fontSize: 32 }}>{postedToday ? "🌿" : "🌱"}</div>
      </div>
    );
  }

  // D=1 かつ未投稿かつ毎日投稿 → 時間表示
  const showHours = D === 1 && !postedToday && isDaily;
  const num  = showHours ? hoursLeft : D;
  const unit = showHours ? "時間" : "日";

  type Cfg = { bg: string; numColor: string; labelColor: string; icon: string; sub: string; pulse: boolean; border: string };
  let cfg: Cfg;

  if (D === 0) {
    cfg = { bg: "rgba(255,232,225,0.9)", numColor: RED_D,    labelColor: "#C06050", icon: "🥀", sub: "今すぐ投稿して復活させよう！",  pulse: true,  border: `1.5px solid rgba(138,64,48,0.3)`  };
  } else if (showHours && hoursLeft <= 3) {
    cfg = { bg: "rgba(255,232,225,0.9)", numColor: "#B04030", labelColor: "#C06050", icon: "🔥", sub: "今すぐ投稿してください！",       pulse: true,  border: `1.5px solid rgba(180,64,48,0.3)`  };
  } else if (showHours) {
    cfg = { bg: "rgba(255,240,220,0.9)", numColor: "#B06030", labelColor: "#A08050", icon: "⚠️", sub: "今日中に投稿してください！",     pulse: false, border: `1.5px solid rgba(196,100,40,0.25)` };
  } else if (!postedToday && D <= 2) {
    cfg = { bg: "rgba(255,240,220,0.9)", numColor: "#B06030", labelColor: "#A08050", icon: "⚠️", sub: "で枯れちゃう！早めに投稿を",     pulse: false, border: `1.5px solid rgba(196,100,40,0.25)` };
  } else if (!postedToday && D <= 4) {
    cfg = { bg: "rgba(255,248,228,0.9)", numColor: GOLD,      labelColor: "#9A8040", icon: "💧", sub: "で枯れちゃう",                  pulse: false, border: `1.5px solid rgba(196,146,42,0.2)`  };
  } else if (!postedToday) {
    cfg = { bg: "rgba(255,255,255,0.7)", numColor: DARK,      labelColor: "#A09080", icon: "🌱", sub: "で枯れちゃう",                  pulse: false, border: "none"                              };
  } else {
    // 投稿済み
    const safe = D <= 3;
    cfg = { bg: "rgba(230,244,232,0.85)", numColor: safe ? GOLD : GREEN, labelColor: safe ? "#9A8040" : "#5A8A6A", icon: "✅", sub: "今日は投稿済み ✓", pulse: false, border: `1.5px solid rgba(61,122,80,0.2)` };
  }

  return (
    <div style={{
      margin: "0 20px 12px",
      background: cfg.bg,
      borderRadius: 18,
      padding: "14px 18px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      border: cfg.border,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      animation: cfg.pulse ? "pulseGlow 2s ease-in-out infinite" : "none",
    }}>
      <div>
        <div style={{ fontSize: 10, color: cfg.labelColor, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>COUNTDOWN</div>
        {D === 0 ? (
          <div style={{ fontSize: 17, fontWeight: 700, color: cfg.numColor, lineHeight: 1.3 }}>枯れています...</div>
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: cfg.labelColor, marginRight: 5 }}>あと</span>
            <span style={{ fontSize: 40, fontWeight: 700, color: cfg.numColor, fontFamily: "var(--font-dm-serif), serif", lineHeight: 1 }}>{num}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: cfg.numColor, marginLeft: 4 }}>{unit}</span>
          </div>
        )}
        <div style={{ fontSize: 11, color: cfg.labelColor, marginTop: 3 }}>{cfg.sub}</div>
      </div>
      <div style={{ fontSize: 32, flexShrink: 0 }}>{cfg.icon}</div>
    </div>
  );
}

function isDamaged(stageProgress: number, stagePeak: number, stageMax: number): boolean {
  return (stageProgress === 0 && stagePeak > 0) ||
         (stagePeak >= stageMax / 3 && stageProgress < stageMax / 3);
}

function getAvatarSrc(formStage: number, damaged: boolean): string {
  const stage = Math.min(formStage, 5);
  const name = (damaged && stage > 0) ? IMG_DAMAGED[stage] : IMG_NORMAL[stage];
  return `/avatars/${name}.png`;
}

function GreenBtn({ label, onClick, accent, disabled = false }: {
  label: string; onClick?: () => void; accent?: string; disabled?: boolean;
}) {
  const bg = disabled ? "#C0B8AE" : (accent || GREEN);
  const shadow = disabled ? "none" : `0 6px 22px ${accent ? "rgba(138,64,48,0.38)" : "rgba(61,122,80,0.4)"}`;
  return (
    <div onClick={disabled ? undefined : onClick} style={{
      height: 56, borderRadius: 28, background: bg, color: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, fontWeight: 700, cursor: disabled ? "default" : "pointer",
      boxShadow: shadow, position: "relative", overflow: "hidden",
      transition: "all 0.25s",
      animation: disabled ? "none" : "pulseGlow 2.5s ease-in-out infinite",
      userSelect: "none",
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

function EvolutionOverlay({ evolution, onDone }: {
  evolution: EvolutionState;
  onDone: () => void;
}) {
  const previousStage = Math.min(evolution.previousStage, 5);
  const nextStage = Math.min(evolution.nextStage, 5);

  useEffect(() => {
    const timer = setTimeout(onDone, 4400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 160,
      background: "rgba(234,227,214,0.98)",
      display: "flex",
      justifyContent: "center",
      animation: "fadeIn 0.25s ease",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 390,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 38%, rgba(196,146,42,0.18), transparent 42%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 116, height: 116, borderRadius: 20, overflow: "hidden", border: "1.5px solid rgba(200,185,155,0.55)", background: BG, opacity: 0.45, transform: "scale(0.92)" }}>
            <img src={`/avatars/${IMG_NORMAL[previousStage]}.png`} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ fontSize: 24, color: GOLD, fontWeight: 700, animation: "fadeInUp 0.45s 0.15s ease both" }}>→</div>
          <div style={{
            width: 156,
            height: 156,
            borderRadius: 24,
            overflow: "hidden",
            border: `2px solid ${GOLD}`,
            background: BG,
            boxShadow: "0 0 34px rgba(196,146,42,0.38)",
            animation: "evo-avatar-in 0.75s 0.25s ease both",
          }}>
            <img src={`/avatars/${IMG_NORMAL[nextStage]}.png`} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        </div>
        <div style={{ position: "relative", fontSize: 30, fontWeight: 800, color: DARK, marginBottom: 8, animation: "fadeInUp 0.45s 0.55s ease both" }}>
          進化しました！
        </div>
        <div style={{ position: "relative", fontSize: 14, fontWeight: 700, color: GOLD, marginBottom: 12, animation: "fadeInUp 0.45s 0.65s ease both" }}>
          {STAGE_NAMES[previousStage]} から {STAGE_NAMES[nextStage]} へ
        </div>
        <div style={{ position: "relative", fontSize: 14, color: "#6A7068", lineHeight: 1.7, minHeight: 48, animation: "fadeInUp 0.45s 0.75s ease both" }}>
          {evolution.message}
        </div>
        <button
          onClick={onDone}
          style={{
            position: "relative",
            marginTop: 24,
            width: "100%",
            maxWidth: 280,
            height: 52,
            border: "none",
            borderRadius: 26,
            background: GREEN,
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            boxShadow: "0 6px 22px rgba(61,122,80,0.35)",
            cursor: "pointer",
            fontFamily: "var(--font-noto), sans-serif",
            animation: "fadeInUp 0.45s 0.95s ease both",
          }}
        >
          育った姿を見る
        </button>
      </div>
    </div>
  );
}

function PostModal({ accessToken, onClose, onSuccess }: {
  accessToken: string;
  onClose: () => void; onSuccess: (result: SubmitResult) => void;
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

  const submit = async () => {
    if (!url.trim()) return;
    if (!url.includes("note.com")) { setError("note.com のURLを入力してください"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "エラーが発生しました"); setLoading(false); return; }
      onSuccess(data);
    } catch { setError("通信エラーが発生しました"); setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,14,10,0.65)", display: "flex", alignItems: "flex-end", zIndex: 100, animation: "fadeIn 0.22s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 390, margin: "0 auto", background: BG, borderRadius: "28px 28px 0 0", padding: "24px 24px 52px", animation: "slideUp 0.35s cubic-bezier(0.32,0.72,0,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: DARK }}>投稿を記録する</div>
          <div onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: "#8A9882" }}>✕</div>
        </div>
        <div style={{ fontSize: 13, color: "#8A9080", marginBottom: 9 }}>Note記事のURLを貼り付けてください</div>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://note.com/..."
          style={{ width: "100%", height: 50, borderRadius: 14, border: `1.5px solid ${url ? GREEN : "#C8C0B0"}`, background: "rgba(255,255,255,0.7)", padding: "0 14px", fontSize: 14, color: DARK, outline: "none", transition: "border 0.2s", boxSizing: "border-box", fontFamily: "var(--font-noto), sans-serif" }} />
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, setState]     = useState<AvatarState | null>(null);
  const [posts, setPosts]     = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [imgKey, setImgKey]   = useState(0);
  const [showPost, setShowPost] = useState(false);
  const [progressAnimating, setProgressAnimating] = useState(false);
  const [evolution, setEvolution] = useState<EvolutionState | null>(null);
  const pendingStateRef = useRef<AvatarState | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [today] = useState(getTodayJST);

  async function handleReset() {
    if (!confirm("本当にリセットしますか？\nアバターの進捗がすべて消えます。")) return;
    setResetting(true);
    try {
      await fetch(`${API_URL}/reset`, { method: "POST", headers: { Authorization: `Bearer ${session?.accessToken}` } });
      router.push("/setup");
    } finally { setResetting(false); }
  }

  const fetchAll = async (token: string) => {
    try {
      const [stateRes, histRes] = await Promise.all([
        fetch(`${API_URL}/state`,   { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/history`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (stateRes.ok) {
        const data = await stateRes.json();
        setState(data);
        if (!data.courseType) router.push("/setup");
      } else if (stateRes.status === 401) {
        signOut({ callbackUrl: "/login" }); return;
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
      setState({ streak: 0, avatarLevel: 0, avatarDamage: 0, formStage: 0, stageProgress: 0, stagePeak: 0, stageMax: 6, courseType: null, courseStartDate: null, freqTimes: 1, freqDays: 1, lastPostDate: null });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;
    fetchAll(session.accessToken);
  }, [status, session, router]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const refreshAfterPost = () => {
    if (session?.accessToken) fetchAll(session.accessToken);
  };

  const handlePostSuccess = (result: SubmitResult) => {
    setShowPost(false);
    if (!state || !result.state || result.alreadySubmitted) {
      refreshAfterPost();
      return;
    }

    const nextState: AvatarState = {
      ...state,
      ...result.state,
      lastPostDate: today,
    };
    const evolved = nextState.formStage > state.formStage || !!result.isMilestone;

    setProgressAnimating(true);

    if (evolved) {
      pendingStateRef.current = nextState;
      setState({
        ...state,
        stageProgress: state.stageMax,
        stagePeak: Math.max(state.stagePeak, state.stageMax),
        streak: nextState.streak,
        avatarLevel: nextState.avatarLevel,
        avatarDamage: nextState.avatarDamage,
        lastPostDate: today,
      });

      setTimeout(() => {
        setProgressAnimating(false);
        setEvolution({
          previousStage: state.formStage,
          nextStage: nextState.formStage,
          message: result.message || "継続の成果で植物が進化しました！",
        });
      }, 950);
      return;
    }

    requestAnimationFrame(() => {
      setState(nextState);
      setImgKey(k => k + 1);
    });
    setTimeout(() => {
      setProgressAnimating(false);
      refreshAfterPost();
    }, 1100);
  };

  const finishEvolution = () => {
    const nextState = pendingStateRef.current;
    pendingStateRef.current = null;
    setEvolution(null);
    if (nextState) {
      setState(nextState);
      setImgKey(k => k + 1);
    }
    refreshAfterPost();
  };

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", background: BG }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, animation: `shimmerDot 1.2s ${i * 0.22}s ease-in-out infinite` }} />)}
        </div>
      </div>
    );
  }

  if (!state || !state.courseType) return null;

  const daysLeft = (today && state.lastPostDate)
    ? calcDaysUntilDead(state.stageProgress, state.lastPostDate, today, state.freqTimes, state.freqDays)
    : null;
  const damaged = isDamaged(state.stageProgress, state.stagePeak, state.stageMax) || daysLeft === 0;
  const stage   = Math.min(state.formStage, 5);
  const imgSrc  = getAvatarSrc(state.formStage, damaged);

  return (
    <div style={{ background: BG, minHeight: "100dvh", position: "relative", overflow: "hidden", maxWidth: 390, margin: "0 auto", display: "flex", flexDirection: "column" }}>

      {/* ── TOP: full-bleed avatar ── */}
      <div style={{ position: "relative", width: "100%", height: 420, overflow: "hidden", flexShrink: 0 }}>
        <img key={imgKey} src={imgSrc} alt={STAGE_NAMES[stage]}
          style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom", display: "block", animation: "scaleIn 0.4s ease" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 90, background: "linear-gradient(to bottom,rgba(234,227,214,0.95) 0%,rgba(234,227,214,0) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top,rgba(234,227,214,1) 0%,rgba(234,227,214,0) 100%)", pointerEvents: "none" }} />

        {/* nav */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
          <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-dancing), cursive", fontSize: 26, fontWeight: 700, color: DARK }}>note tree</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: damaged ? "#C04030" : "#4A8A5A", background: damaged ? "rgba(255,240,236,0.92)" : "rgba(230,244,232,0.92)", padding: "4px 10px", borderRadius: 12, border: `1px solid ${damaged ? "#E8B0A0" : "#B4D4B8"}`, backdropFilter: "blur(4px)" }}>
                {damaged ? "🥀 ダメージ" : "🌿 正常"}
              </div>
              <ShareButton imgSrc={imgSrc} stageName={STAGE_NAMES[stage]} stageDesc={STAGE_DESC[stage]} streak={state.streak} />
              <div ref={settingsRef} style={{ position: "relative" }}>
                <div onClick={() => setShowSettings(v => !v)}
                  style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(234,227,214,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", border: "1px solid rgba(0,0,0,0.08)" }}>⚙</div>
                {showSettings && (
                  <div style={{ position: "absolute", right: 0, top: 38, background: "white", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", padding: "8px 0", minWidth: 160, zIndex: 50, animation: "fadeIn 0.15s ease" }}>
                    <Link href="/history" style={{ display: "block", padding: "10px 16px", fontSize: 13, color: DARK, textDecoration: "none" }}>🌿 投稿履歴（全件）</Link>
                    {session?.accessToken && <div style={{ padding: "10px 16px" }}><NotificationToggle accessToken={session.accessToken} /></div>}
                    <div style={{ height: 1, background: "#EEE", margin: "4px 0" }} />
                    <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, color: "#9A9080", background: "none", border: "none", cursor: "pointer" }}>ログアウト</button>
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

      {/* ── BOTTOM: info panel ── */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 110, position: "relative", zIndex: 2 }}>

        {/* stage label + dots */}
        <div style={{ textAlign: "center", padding: "6px 0 12px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: damaged ? RED_D : GOLD, letterSpacing: 0.5, marginBottom: 8 }}>
            {STAGE_NAMES[stage]} · {STAGE_DESC[stage]}
          </div>
          <div style={{ display: "flex", gap: 7, justifyContent: "center" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: i === stage ? 22 : 8, height: 8, borderRadius: 4, background: i <= stage ? (damaged ? RED_D : GOLD) : "#C8C0B0", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>

        {/* stats */}
        <div style={{ display: "flex", gap: 10, margin: "0 20px 16px" }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.7)", borderRadius: 18, padding: "12px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 10, color: "#A09080", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>STREAK</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: DARK, fontFamily: "var(--font-dm-serif), serif", lineHeight: 1 }}>{state.streak}</div>
            <div style={{ fontSize: 11, color: "#9A9080", marginTop: 2 }}>日連続</div>
          </div>
          <div style={{ flex: 1.6, background: "rgba(255,255,255,0.7)", borderRadius: 18, padding: "12px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <div style={{ fontSize: 10, color: "#A09080", fontWeight: 700, letterSpacing: 1 }}>NEXT LEVEL</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: damaged ? RED_D : GREEN }}>{state.stageProgress}/{state.stageMax}</div>
            </div>
            <div style={{ height: 7, background: "#DDD8CC", borderRadius: 4, overflow: "hidden", marginTop: 6 }}>
              <div style={{
                height: 7,
                width: `${state.stageMax > 0 ? Math.min(100, (state.stageProgress / state.stageMax) * 100) : 0}%`,
                background: damaged ? "linear-gradient(90deg,#8A4030,#C06050)" : `linear-gradient(90deg,${GREEN},#70B070)`,
                borderRadius: 4,
                transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
                boxShadow: progressAnimating ? `0 0 14px ${damaged ? "rgba(192,96,80,0.55)" : "rgba(61,122,80,0.55)"}` : "none",
              }} />
            </div>
            <div style={{ fontSize: 11, color: "#9A9080", marginTop: 5 }}>
              {stage < 5 ? `あと${state.stageMax - state.stageProgress}回で「${STAGE_NAMES[stage + 1]}」へ` : "🏆 最終形態に到達！"}
            </div>
          </div>
        </div>

        {/* countdown */}
        <CountdownBanner
          stageProgress={state.stageProgress}
          lastPostDate={state.lastPostDate}
          freqTimes={state.freqTimes}
          freqDays={state.freqDays}
          today={today}
        />

        {/* 最近の投稿 */}
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
            <Link href="/history" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 40, borderRadius: 20, marginTop: 4,
              border: "1px solid #C8C0B0", background: "rgba(255,255,255,0.5)",
              fontSize: 13, fontWeight: 600, color: "#7A8070", textDecoration: "none",
            }}>
              もっと見る →
            </Link>
          </div>
        )}

        {session?.accessToken && <PromoModal accessToken={session.accessToken} />}
      </div>

      {/* ── fixed CTA ── */}
      <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 40px)", maxWidth: 350, zIndex: 10 }}>
        <GreenBtn
          label={damaged ? "🌧 投稿して回復する" : "＋ 投稿を記録する"}
          accent={damaged ? RED_D : GREEN}
          onClick={() => setShowPost(true)}
        />
      </div>

      {/* Post modal */}
      {showPost && session?.accessToken && (
        <PostModal
          accessToken={session.accessToken}
          onClose={() => setShowPost(false)}
          onSuccess={handlePostSuccess}
        />
      )}

      {evolution && (
        <EvolutionOverlay
          evolution={evolution}
          onDone={finishEvolution}
        />
      )}
    </div>
  );
}
