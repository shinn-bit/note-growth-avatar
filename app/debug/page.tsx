"use client";

import { useState } from "react";
import Link from "next/link";

// ---- ロジック (page.tsx と同じ) ----

function isDamaged(stageProgress: number, stagePeak: number, stageMax: number): boolean {
  return stagePeak >= stageMax / 3 && stageProgress < stageMax / 3;
}

function getStreakTier(streak: number): "none" | "bronze" | "silver" | "gold" | "rainbow" {
  if (streak >= 30) return "rainbow";
  if (streak >= 14) return "gold";
  if (streak >= 7) return "silver";
  if (streak >= 3) return "bronze";
  return "none";
}

const STREAK_FRAME: Record<string, { border: string; shadow: string; badge?: string; label: string }> = {
  none:    { border: "border-gray-200", shadow: "", label: "なし" },
  bronze:  { border: "border-blue-300", shadow: "shadow-[0_0_12px_2px_rgba(147,197,253,0.6)]", label: "青グロー" },
  silver:  { border: "border-yellow-300", shadow: "shadow-[0_0_16px_4px_rgba(253,224,71,0.5)]", badge: "✨", label: "✨ゴールド" },
  gold:    { border: "border-yellow-400", shadow: "shadow-[0_0_24px_6px_rgba(251,191,36,0.7)]", badge: "✨", label: "強ゴールド" },
  rainbow: { border: "border-pink-400", shadow: "shadow-[0_0_28px_8px_rgba(244,114,182,0.6)]", badge: "🌈", label: "🌈レインボー" },
};

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

function getMilestones(courseType: string, freqTimes: number, freqDays: number): number[] {
  const courseDays = courseType === "3month" ? 90 : 30;
  const totalSlots = Math.max(5, Math.ceil(courseDays * freqTimes / freqDays));
  return Array.from({ length: 5 }, (_, i) =>
    Math.ceil(totalSlots * (i + 1) / 5)
  );
}

function getStageMax(formStage: number, milestones: number[]): number {
  if (formStage >= milestones.length) return milestones[milestones.length - 1];
  const prev = formStage > 0 ? milestones[formStage - 1] : 0;
  return milestones[formStage] - prev;
}

// ---- シミュレーター状態 ----
type SimState = {
  formStage: number;
  stageProgress: number;
  stagePeak: number;
  streak: number;
  avatarLevel: number;
  avatarDamage: number;
  log: string[];
};

function simulate(state: SimState, action: "post" | "miss", milestones: number[]): SimState {
  let { formStage, stageProgress, stagePeak, streak, avatarLevel, avatarDamage, log } = state;

  if (action === "post") {
    avatarLevel += 1;
    streak += 1;
    stageProgress += 1;
    const stageMax = getStageMax(formStage, milestones);

    if (stageProgress >= stageMax && formStage < milestones.length) {
      formStage += 1;
      stageProgress = 0;
      stagePeak = 0;
      log = [`🎉 形態チェンジ！ → Stage ${formStage}`, ...log.slice(0, 9)];
    } else {
      stagePeak = Math.max(stagePeak, stageProgress);
      log = [`✅ 投稿成功 (progress: ${stageProgress}/${stageMax})`, ...log.slice(0, 9)];
    }
  } else {
    streak = 0;
    stageProgress = Math.max(0, stageProgress - 1);
    avatarDamage += 1;
    const stageMax = getStageMax(formStage, milestones);
    const damaged = isDamaged(stageProgress, stagePeak, stageMax);
    log = [
      `❌ ミス (progress: ${stageProgress}/${stageMax}) ${damaged ? "→ ダメージ状態！" : ""}`,
      ...log.slice(0, 9),
    ];
  }

  return { formStage, stageProgress, stagePeak, streak, avatarLevel, avatarDamage, log };
}

// ---- コンポーネント ----

function AvatarCard({
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
    <div className="relative flex flex-col items-center gap-1">
      {frame.badge && (
        <span className="absolute -top-2 -right-2 text-lg z-10">{frame.badge}</span>
      )}
      <div className={`flex items-center justify-center w-24 h-24 rounded-full border-4 bg-white
        text-5xl ${frame.border} ${frame.shadow} transition-all duration-300`}>
        <span>{emoji}</span>
      </div>
      <span className={`text-xs font-medium ${damaged ? "text-red-400" : "text-gray-400"}`}>
        {damaged ? "ダメージ" : "通常"}
      </span>
    </div>
  );
}

function ProgressBar({ stageProgress, stagePeak, stageMax, formStage }: {
  stageProgress: number; stagePeak: number; stageMax: number; formStage: number;
}) {
  const damaged = isDamaged(stageProgress, stagePeak, stageMax);
  const pct = stageMax > 0 ? Math.min(100, (stageProgress / stageMax) * 100) : 0;
  const barColor = damaged ? "bg-red-400" : "bg-indigo-400";

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Stage {formStage} → {formStage + 1}</span>
        <span>{stageProgress} / {stageMax}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className={`${barColor} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>peak: {stagePeak}</span>
        <span>1/3ライン: {Math.ceil(stageMax / 3)}</span>
      </div>
    </div>
  );
}

export default function DebugPage() {
  const [courseType, setCourseType] = useState<"1month" | "3month">("1month");
  const [freqTimes, setFreqTimes] = useState(1);
  const [freqDays, setFreqDays] = useState(1);

  const milestones = getMilestones(courseType, freqTimes, freqDays);

  const initState: SimState = {
    formStage: 0, stageProgress: 0, stagePeak: 0,
    streak: 0, avatarLevel: 0, avatarDamage: 0, log: [],
  };
  const [sim, setSim] = useState<SimState>(initState);

  const stageMax = getStageMax(sim.formStage, milestones);

  function handlePost() { setSim((s) => simulate(s, "post", milestones)); }
  function handleMiss() { setSim((s) => simulate(s, "miss", milestones)); }
  function handleReset() { setSim(initState); }

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-8 gap-6">
      <div className="flex items-center gap-4 w-full max-w-lg">
        <h1 className="text-lg font-bold text-gray-700">デバッグ画面</h1>
        <Link href="/" className="text-sm text-indigo-500 hover:underline">← ホームへ</Link>
      </div>

      {/* ===== シミュレーター ===== */}
      <section className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-700">🎮 ロジック シミュレーター</h2>

        {/* コース・頻度設定 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">コース</p>
            <div className="flex gap-2">
              {(["1month", "3month"] as const).map((c) => (
                <button key={c} onClick={() => { setCourseType(c); handleReset(); }}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors
                    ${courseType === c
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-white text-gray-600 border-gray-200"}`}>
                  {c === "1month" ? "1ヶ月" : "3ヶ月"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">頻度</p>
            <div className="flex items-center gap-1 text-sm">
              <select value={freqDays}
                onChange={(e) => { setFreqDays(Number(e.target.value)); handleReset(); }}
                className="border rounded px-1 py-1 text-indigo-600 font-bold">
                {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="text-gray-500">日に</span>
              <select value={freqTimes}
                onChange={(e) => { setFreqTimes(Number(e.target.value)); handleReset(); }}
                className="border rounded px-1 py-1 text-indigo-600 font-bold">
                {Array.from({length: freqDays}, (_, i) => i+1).map(t =>
                  <option key={t} value={t}>{t}</option>
                )}
              </select>
              <span className="text-gray-500">回</span>
            </div>
          </div>
        </div>

        {/* マイルストーン */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
          <span className="font-semibold">マイルストーン（累計）: </span>
          {milestones.map((m, i) => {
            const prevM = i > 0 ? milestones[i - 1] : 0;
            const inThisStage = sim.avatarLevel > prevM && sim.avatarLevel <= m;
            return (
              <span key={i} className={`mr-2 ${inThisStage ? "text-indigo-600 font-bold" : ""}`}>
                {i+1}回目:{m}
              </span>
            );
          })}
          <span className="block mt-0.5">現在 Stage{sim.formStage}・目標 {stageMax}投稿</span>
        </div>

        {/* アバター + バー */}
        <div className="flex items-start gap-5">
          <AvatarCard
            formStage={sim.formStage} stageProgress={sim.stageProgress}
            stagePeak={sim.stagePeak} stageMax={stageMax} streak={sim.streak}
          />
          <div className="flex-1 flex flex-col gap-3">
            <ProgressBar
              stageProgress={sim.stageProgress} stagePeak={sim.stagePeak}
              stageMax={stageMax} formStage={sim.formStage}
            />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-lg font-bold text-gray-700">{sim.streak}</p>
                <p className="text-xs text-gray-400">連続</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-lg font-bold text-gray-700">Lv.{sim.avatarLevel}</p>
                <p className="text-xs text-gray-400">レベル</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-lg font-bold text-red-400">{sim.avatarDamage}</p>
                <p className="text-xs text-gray-400">ダメージ</p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={handlePost}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-colors">
            ✅ 投稿
          </button>
          <button onClick={handleMiss}
            className="bg-red-400 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors">
            ❌ ミス
          </button>
          <button onClick={handleReset}
            className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-3 rounded-xl transition-colors">
            🔄 リセット
          </button>
        </div>

        {/* ログ */}
        {sim.log.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-1 max-h-40 overflow-y-auto">
            {sim.log.map((l, i) => (
              <p key={i} className={`text-xs ${i === 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                {l}
              </p>
            ))}
          </div>
        )}
      </section>

      {/* ===== 全パターン一覧 ===== */}
      <section className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-700 mb-4">🗂 6段階 × 2状態 一覧</h2>
        <div className="flex flex-col gap-2">
          {[0,1,2,3,4,5].map((stage) => (
            <div key={stage} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-12 text-right">Stage {stage}</span>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-3xl">{getAvatarEmoji(stage, false)}</span>
                <span className="text-xs text-gray-400">通常</span>
              </div>
              <div className="flex-1 h-px bg-gray-100" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-3xl">{getAvatarEmoji(stage, true)}</span>
                <span className="text-xs text-red-300">ダメージ</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== streakフレーム一覧 ===== */}
      <section className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-700 mb-4">⭐ streakフレーム一覧</h2>
        <div className="flex flex-wrap justify-around gap-4">
          {([
            { streak: 0,  label: "0〜2連続" },
            { streak: 3,  label: "3〜6連続" },
            { streak: 7,  label: "7〜13連続" },
            { streak: 14, label: "14〜29連続" },
            { streak: 30, label: "30+連続" },
          ] as const).map(({ streak, label }) => (
            <div key={streak} className="flex flex-col items-center gap-1">
              <AvatarCard
                formStage={1} stageProgress={4} stagePeak={5} stageMax={6} streak={streak}
              />
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xs text-gray-400">{STREAK_FRAME[getStreakTier(streak)].label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
