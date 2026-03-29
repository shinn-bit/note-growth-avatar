"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type AvatarState = {
  streak: number;
  avatarHp: number;
  avatarLevel: number;
  avatarDamage: number;
  formStage: number;
  courseType: "1month" | "3month" | null;
  courseStartDate: string | null;
  freqTimes: number;
  freqDays: number;
};

function getAvatarCondition(hp: number): "healthy" | "tired" | "broken" {
  if (hp > 70) return "healthy";
  if (hp >= 30) return "tired";
  return "broken";
}

function AvatarDisplay({ hp, formStage }: { hp: number; formStage: number }) {
  const condition = getAvatarCondition(hp);

  const emoji = (() => {
    if (formStage >= 3) return condition === "healthy" ? "🦁" : condition === "tired" ? "🐯" : "🐱";
    if (formStage >= 2) return condition === "healthy" ? "🦊" : condition === "tired" ? "🐺" : "🐶";
    if (formStage >= 1) return condition === "healthy" ? "🐣" : condition === "tired" ? "🐥" : "🐤";
    return condition === "healthy" ? "🥚" : condition === "tired" ? "🥚" : "💔";
  })();

  const bgColor = (() => {
    if (condition === "healthy") return "bg-green-100 border-green-300";
    if (condition === "tired") return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  })();

  const label = (() => {
    if (condition === "healthy") return "元気";
    if (condition === "tired") return "疲れ気味";
    return "ボロボロ";
  })();

  return (
    <div className={`flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 ${bgColor} text-7xl`}>
      <span>{emoji}</span>
      <span className="text-sm mt-1 font-medium text-gray-600">{label}</span>
    </div>
  );
}

function HpBar({ hp }: { hp: number }) {
  const color = hp > 70 ? "bg-green-400" : hp >= 30 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>HP</span>
        <span>{hp} / 100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${hp}%` }}
        />
      </div>
    </div>
  );
}

function CourseProgress({
  courseType,
  courseStartDate,
  streak,
}: {
  courseType: "1month" | "3month";
  courseStartDate: string;
  streak: number;
}) {
  const totalDays = courseType === "1month" ? 30 : 90;
  const label = courseType === "1month" ? "1ヶ月コース" : "3ヶ月コース";

  const start = new Date(courseStartDate);
  const now = new Date();
  const elapsedDays = Math.max(
    0,
    Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
  const progress = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span className="font-semibold text-indigo-600">{label}</span>
        <span>{elapsedDays} / {totalDays}日</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-400 h-2 rounded-full transition-all duration-500"
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
    if (status === "unauthenticated") {
      router.push("/login");
    }
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
          // 未設定ならsetupへ
          if (!data.courseType) {
            router.push("/setup");
          }
        }
      } catch {
        setState({
          streak: 0,
          avatarHp: 50,
          avatarLevel: 0,
          avatarDamage: 0,
          formStage: 0,
          courseType: null,
          courseStartDate: null,
          freqTimes: 1,
          freqDays: 1,
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
    <main className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-12 gap-6">
      <div className="w-full max-w-xs flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">note継続アプリ</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ログアウト
        </button>
      </div>

      <AvatarDisplay hp={state.avatarHp} formStage={state.formStage} />

      <div className="w-full max-w-xs">
        <HpBar hp={state.avatarHp} />
      </div>

      {state.courseType && state.courseStartDate && (
        <div className="w-full max-w-xs">
          <CourseProgress
            courseType={state.courseType}
            courseStartDate={state.courseStartDate}
            streak={state.streak}
          />
        </div>
      )}

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

      <Link
        href="/submit"
        className="w-full max-w-xs bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl text-center text-lg transition-colors"
      >
        今日の投稿を記録する
      </Link>
    </main>
  );
}
