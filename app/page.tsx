"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDeviceId } from "./lib/deviceId";

type AvatarState = {
  streak: number;
  avatarHp: number;
  avatarLevel: number;
  avatarDamage: number;
  formStage: number;
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

export default function HomePage() {
  const [state, setState] = useState<AvatarState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deviceId = getDeviceId();
    const saved = localStorage.getItem("note_avatar_state");
    if (saved) {
      setState(JSON.parse(saved));
    } else {
      // デフォルト初期状態
      setState({
        streak: 0,
        avatarHp: 50,
        avatarLevel: 0,
        avatarDamage: 0,
        formStage: 0,
      });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  const s = state!;

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-12 gap-8">
      <h1 className="text-2xl font-bold text-gray-800">note 継続アバター</h1>

      {/* アバター */}
      <AvatarDisplay hp={s.avatarHp} formStage={s.formStage} />

      {/* HP バー */}
      <div className="w-full max-w-xs">
        <HpBar hp={s.avatarHp} />
      </div>

      {/* ステータス */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-2xl font-bold text-gray-800">{s.streak}</p>
          <p className="text-xs text-gray-500 mt-1">連続日数</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-2xl font-bold text-gray-800">Lv.{s.avatarLevel}</p>
          <p className="text-xs text-gray-500 mt-1">レベル</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-2xl font-bold text-gray-800">{s.avatarDamage}</p>
          <p className="text-xs text-gray-500 mt-1">ダメージ</p>
        </div>
      </div>

      {/* 投稿ボタン */}
      <Link
        href="/submit"
        className="w-full max-w-xs bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl text-center text-lg transition-colors"
      >
        今日の投稿を記録する
      </Link>
    </main>
  );
}
