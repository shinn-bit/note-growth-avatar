"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
};

// Damaged only if bar has fallen from a higher point (stagePeak records the high-water mark)
function isDamaged(stageProgress: number, stagePeak: number, stageMax: number): boolean {
  return stagePeak >= stageMax / 3 && stageProgress < stageMax / 3;
}

// Streak frame tier
function getStreakTier(streak: number): "none" | "bronze" | "silver" | "gold" | "rainbow" {
  if (streak >= 30) return "rainbow";
  if (streak >= 14) return "gold";
  if (streak >= 7) return "silver";
  if (streak >= 3) return "bronze";
  return "none";
}

const STREAK_FRAME: Record<string, { border: string; shadow: string; badge?: string }> = {
  none:    { border: "border-gray-200", shadow: "" },
  bronze:  { border: "border-blue-300", shadow: "shadow-[0_0_12px_2px_rgba(147,197,253,0.6)]" },
  silver:  { border: "border-yellow-300", shadow: "shadow-[0_0_16px_4px_rgba(253,224,71,0.5)]", badge: "✨" },
  gold:    { border: "border-yellow-400", shadow: "shadow-[0_0_24px_6px_rgba(251,191,36,0.7)]", badge: "✨" },
  rainbow: { border: "border-pink-400", shadow: "shadow-[0_0_28px_8px_rgba(244,114,182,0.6)]", badge: "🌈" },
};

// Placeholder avatar — will be replaced with real images (formStage 0-5 × normal/damaged)
function getAvatarEmoji(formStage: number, damaged: boolean): string {
  const stages = [
    ["🥚", "💔"],
    ["🐣", "🐤"],
    ["🐥", "🐶"],
    ["🦊", "🐺"],
    ["🦁", "🐯"],
    ["🐉", "🦴"],
  ];
  const s = stages[Math.min(formStage, stages.length - 1)];
  return damaged ? s[1] : s[0];
}

function AvatarDisplay({
  formStage, stageProgress, stagePeak, stageMax, streak,
}: {
  formStage: number; stageProgress: number; stagePeak: number;
  stageMax: number; streak: number;
}) {
  const damaged = isDamaged(stageProgress, stagePeak, stageMax);
  const tier = getStreakTier(streak);
  const frame = STREAK_FRAME[tier];
  const emoji = getAvatarEmoji(formStage, damaged);

  return (
    <div className="relative flex flex-col items-center">
      {/* Streak badge */}
      {frame.badge && (
        <span className="absolute -top-2 -right-2 text-xl z-10">{frame.badge}</span>
      )}
      <div
        className={`flex flex-col items-center justify-center w-40 h-40 rounded-full border-4
          ${frame.border} ${frame.shadow} bg-white text-7xl transition-all duration-500`}
      >
        <span>{emoji}</span>
      </div>
      {tier !== "none" && (
        <span className="mt-1 text-xs font-semibold text-yellow-500">
          {streak}連続中
        </span>
      )}
    </div>
  );
}

function StageProgressBar({
  stageProgress, stagePeak, stageMax, formStage,
}: {
  stageProgress: number; stagePeak: number; stageMax: number; formStage: number;
}) {
  const damaged = isDamaged(stageProgress, stagePeak, stageMax);
  const pct = stageMax > 0 ? Math.min(100, (stageProgress / stageMax) * 100) : 0;
  const isFinalStage = formStage >= 5;

  const barColor = isFinalStage
    ? "bg-gradient-to-r from-yellow-400 to-pink-400"
    : damaged
    ? "bg-red-400"
    : "bg-indigo-400";

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold text-gray-600">
          {isFinalStage ? "🏆 コース完走！" : `次の進化まで`}
        </span>
        <span className="text-gray-400 tabular-nums">
          {stageProgress} / {stageMax}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`${barColor} h-4 rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {damaged && (
        <p className="text-xs text-red-400 mt-1">
          ⚠ 投稿が滞っています…続けよう！
        </p>
      )}
    </div>
  );
}

function CourseProgress({
  courseType, courseStartDate,
}: {
  courseType: "1month" | "3month"; courseStartDate: string;
}) {
  const totalDays = courseType === "1month" ? 30 : 90;
  const label = courseType === "1month" ? "1ヶ月コース" : "3ヶ月コース";

  const start = new Date(courseStartDate);
  const now = new Date();
  const elapsedDays = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const progress = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span className="font-semibold text-indigo-500">{label}</span>
        <span>{elapsedDays} / {totalDays}日</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-indigo-300 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function freqLabel(freqTimes: number, freqDays: number): string {
  if (freqDays === 1) return "毎日投稿";
  if (freqTimes === 1) return `${freqDays}日に1回`;
  return `${freqDays}日に${freqTimes}回`;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, setState] = useState<AvatarState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;

    const fetchState = async () => {
      try {
        const res = await fetch(`${API_URL}/state`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setState(data);
          if (!data.courseType) router.push("/setup");
        }
      } catch {
        setState({
          streak: 0, avatarLevel: 0, avatarDamage: 0,
          formStage: 0, stageProgress: 0, stagePeak: 0, stageMax: 6,
          courseType: null, courseStartDate: null, freqTimes: 1, freqDays: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchState();
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (!state || !state.courseType) return null;

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-10 gap-6">
      {/* Header */}
      <div className="w-full max-w-xs flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">note継続アプリ</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ログアウト
        </button>
      </div>

      {/* Avatar */}
      <AvatarDisplay
        formStage={state.formStage}
        stageProgress={state.stageProgress}
        stagePeak={state.stagePeak}
        stageMax={state.stageMax}
        streak={state.streak}
      />

      {/* Stage progress bar */}
      <div className="w-full max-w-xs">
        <StageProgressBar
          stageProgress={state.stageProgress}
          stagePeak={state.stagePeak}
          stageMax={state.stageMax}
          formStage={state.formStage}
        />
      </div>

      {/* Course progress */}
      {state.courseStartDate && (
        <div className="w-full max-w-xs">
          <CourseProgress
            courseType={state.courseType}
            courseStartDate={state.courseStartDate}
          />
        </div>
      )}

      {/* Stats */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-2xl font-bold text-gray-800">{state.streak}</p>
          <p className="text-xs text-gray-500 mt-1">連続達成</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-2xl font-bold text-gray-800">Lv.{state.avatarLevel}</p>
          <p className="text-xs text-gray-500 mt-1">レベル</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-2xl font-bold text-gray-800">{state.avatarDamage}</p>
          <p className="text-xs text-gray-500 mt-1">ダメージ</p>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        ペース：{freqLabel(state.freqTimes, state.freqDays)}
      </p>

      {/* Submit button */}
      <Link
        href="/submit"
        className="w-full max-w-xs bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl text-center text-lg transition-colors"
      >
        今日の投稿を記録する
      </Link>
    </main>
  );
}
