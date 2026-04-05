"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type LastMessage = {
  message: string;
  isMilestone: boolean;
  alreadySubmitted: boolean;
  evolved?: boolean;
  prevFormStage?: number;
  newFormStage?: number;
  prevAvatarLevel?: number;
  newAvatarLevel?: number;
};

// ── 紙吹雪コンポーネント ──────────────────────────────────────
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        dx: (Math.random() - 0.5) * 240,
        rot: Math.random() * 720,
        dur: 1.6 + Math.random() * 1.2,
        delay: Math.random() * 0.7,
        color: ["#fbbf24","#34d399","#60a5fa","#f472b6","#a78bfa","#5a7a5a","#fb923c"][i % 7],
        w: 6 + Math.random() * 9,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: "-2%",
            width: p.w,
            height: p.w * 0.55,
            background: p.color,
            animation: `confettifall ${p.dur}s ${p.delay}s ease-in forwards`,
            ["--dx" as string]: `${p.dx}px`,
            ["--rot" as string]: `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}

// ── 進化演出画面 ──────────────────────────────────────────────
function EvolutionScreen({ msg, onDone }: { msg: LastMessage; onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const prevStage = msg.prevFormStage ?? 0;
  const newStage  = msg.newFormStage  ?? prevStage + 1;
  const prevLv    = msg.prevAvatarLevel ?? 0;
  const newLv     = msg.newAvatarLevel  ?? prevLv + 1;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),                          // 旧アバター表示
      setTimeout(() => setPhase(2), 1100),                         // 新アバター登場
      setTimeout(() => { setPhase(3); setShowConfetti(true); }, 1600), // 紙吹雪＋バッジ
      setTimeout(() => setPhase(4), 2000),                         // メッセージ
      setTimeout(() => setPhase(5), 2400),                         // ホームボタン
      setTimeout(onDone, 5800),                                    // 自動でホームへ
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const show = (minPhase: number) => ({
    opacity: phase >= minPhase ? 1 : 0,
    transform: phase >= minPhase ? "translateY(0) scale(1)" : "translateY(16px) scale(0.9)",
    transition: "opacity 0.55s ease, transform 0.55s ease",
  });

  return (
    <main className="fixed inset-0 bg-green-50 flex flex-col items-center justify-center gap-5 overflow-hidden z-50">
      {showConfetti && <Confetti />}

      {/* アバター */}
      <div
        className="relative w-40 h-40 rounded-full bg-white overflow-hidden border-4 transition-all duration-700"
        style={{
          borderColor: phase >= 3 ? "#fbbf24" : "#e5e7eb",
          boxShadow: phase >= 3 ? "0 0 36px 12px rgba(251,191,36,0.45)" : "none",
        }}
      >
        {/* 旧アバター */}
        <img
          src={`/avatars/avatar_s${prevStage}_normal.png`}
          alt="before"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
          style={{
            opacity: phase <= 1 ? 1 : 0,
            transform: phase >= 2 ? "scale(0.3)" : "scale(1)",
          }}
        />
        {/* 新アバター */}
        <img
          src={`/avatars/avatar_s${Math.min(newStage, 5)}_normal.png`}
          alt="after"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "scale(1)" : "scale(0.3)",
            animation: phase === 2 ? "evo-avatar-in 0.7s ease forwards" : "none",
          }}
        />
      </div>

      {/* タイトル */}
      <div className="text-3xl font-extrabold text-gray-800" style={show(2)}>
        進化！🎉
      </div>

      {/* レベルバッジ */}
      <div
        className="flex items-center gap-5 bg-white rounded-3xl px-9 py-4 shadow-lg"
        style={{
          opacity: phase >= 3 ? 1 : 0,
          animation: phase === 3 ? "evo-badge-pop 0.5s ease forwards" : "none",
        }}
      >
        <span className="text-xl font-semibold text-gray-400">Lv.{prevLv}</span>
        <span className="text-xl font-bold text-[#5a7a5a]">→</span>
        <span className="text-3xl font-extrabold text-[#5a7a5a]">Lv.{newLv}</span>
      </div>

      {/* メッセージ */}
      <p className="text-sm font-semibold text-[#5a7a5a]" style={show(4)}>
        {msg.message}
      </p>

      {/* ホームボタン */}
      <button
        className="mt-2 w-full max-w-xs bg-[#5a7a5a] hover:bg-[#4a6a4a] text-white font-bold py-4 rounded-xl text-lg transition-colors"
        style={show(5)}
        onClick={onDone}
      >
        ホームに戻る
      </button>
    </main>
  );
}

// ── メインコンポーネント ──────────────────────────────────────
export default function ResultPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<LastMessage | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("note_avatar_last_message");
    if (raw) {
      setMsg(JSON.parse(raw));
    } else {
      router.replace("/");
    }
  }, [router]);

  function handleDone() {
    localStorage.removeItem("note_avatar_last_message");
    router.push("/");
  }

  if (!msg) return null;

  // 進化演出
  if (msg.evolved) {
    return <EvolutionScreen msg={msg} onDone={handleDone} />;
  }

  // 通常結果画面（既存の挙動を維持）
  const bgColor = msg.isMilestone
    ? "bg-yellow-50"
    : msg.alreadySubmitted
    ? "bg-[#f5f0eb]"
    : "bg-green-50";
  const icon = msg.isMilestone ? "🎉" : msg.alreadySubmitted ? "✅" : "📝";

  return (
    <main className={`flex flex-col items-center justify-center min-h-screen ${bgColor} px-4 gap-8`}>
      <span className="text-7xl">{icon}</span>
      <p className="text-xl font-bold text-gray-800 text-center">{msg.message}</p>
      {msg.isMilestone && (
        <p className="text-sm text-yellow-600 font-medium">マイルストーン達成！</p>
      )}
      <button
        onClick={handleDone}
        className="w-full max-w-xs bg-[#5a7a5a] hover:bg-[#4a6a4a] text-white font-bold py-4 rounded-xl text-lg transition-colors"
      >
        ホームに戻る
      </button>
    </main>
  );
}
