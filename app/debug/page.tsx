"use client";

import { useState } from "react";
import Link from "next/link";

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
    <div className={`flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 ${bgColor} text-6xl`}>
      <span>{emoji}</span>
      <span className="text-xs mt-1 font-medium text-gray-600">{label}</span>
    </div>
  );
}

const STAGES = [0, 1, 2, 3];
const CONDITIONS: { label: string; hp: number }[] = [
  { label: "元気 (HP > 70)", hp: 90 },
  { label: "疲れ (HP 30〜70)", hp: 50 },
  { label: "ボロボロ (HP < 30)", hp: 10 },
];

export default function DebugPage() {
  const [hp, setHp] = useState(80);
  const [formStage, setFormStage] = useState(0);
  const [streak, setStreak] = useState(0);

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-12 gap-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-700">デバッグ画面</h1>
        <Link href="/" className="text-sm text-indigo-500 hover:underline">← ホームへ</Link>
      </div>

      {/* インタラクティブ確認 */}
      <section className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-gray-700">値を動かして確認</h2>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>HP</span><span>{hp} / 100</span>
          </div>
          <input type="range" min={0} max={100} value={hp}
            onChange={(e) => setHp(Number(e.target.value))}
            className="w-full accent-indigo-500" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>formStage（形態）</span><span>{formStage}</span>
          </div>
          <input type="range" min={0} max={3} step={1} value={formStage}
            onChange={(e) => setFormStage(Number(e.target.value))}
            className="w-full accent-indigo-500" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>連続日数（streak）</span><span>{streak}</span>
          </div>
          <input type="range" min={0} max={35} value={streak}
            onChange={(e) => setStreak(Number(e.target.value))}
            className="w-full accent-indigo-500" />
          {[3, 7, 30].includes(streak) && (
            <p className="text-xs text-yellow-600 font-medium mt-1">🎉 マイルストーン！ formStage が +1 されます</p>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <AvatarDisplay hp={hp} formStage={formStage} />
        </div>
      </section>

      {/* 全パターン一覧 */}
      <section className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">全パターン一覧</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2 text-left pl-2">formStage</th>
                {CONDITIONS.map((c) => (
                  <th key={c.hp} className="py-2 px-2">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAGES.map((stage) => (
                <tr key={stage} className="border-b last:border-0">
                  <td className="py-3 text-left pl-2 text-gray-500">
                    Stage {stage}
                    <span className="block text-xs text-gray-400">
                      {stage === 0 ? "初期" : stage === 1 ? "3日目" : stage === 2 ? "7日目" : "30日目"}
                    </span>
                  </td>
                  {CONDITIONS.map((c) => (
                    <td key={c.hp} className="py-3 px-2">
                      <div className="flex justify-center">
                        <AvatarDisplay hp={c.hp} formStage={stage} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
