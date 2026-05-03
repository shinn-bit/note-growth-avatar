"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "../styles/setup.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Preset = { label: string; freqTimes: number; freqDays: number };

const PRESETS: Preset[] = [
  { label: "毎日", freqTimes: 1, freqDays: 1 },
  { label: "2日に1回", freqTimes: 1, freqDays: 2 },
  { label: "週3回", freqTimes: 3, freqDays: 7 },
  { label: "週2回", freqTimes: 2, freqDays: 7 },
  { label: "週1回", freqTimes: 1, freqDays: 7 },
];

const COURSES = [
  {
    type: "1month",
    label: "1ヶ月コース",
    days: "30日間",
    desc: "まず1ヶ月続けてみる",
    milestones: "7日・15日・30日",
  },
  {
    type: "3month",
    label: "3ヶ月コース",
    days: "90日間",
    desc: "本気で習慣にする",
    milestones: "7日・30日・60日・90日",
  },
] as const;

function freqSummary(freqTimes: number, freqDays: number): string {
  if (freqDays === 1) return "毎日投稿";
  if (freqTimes === 1) return `${freqDays}日に1回投稿`;
  return `${freqDays}日に${freqTimes}回投稿`;
}

export default function SetupPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [courseType, setCourseType] = useState<"1month" | "3month" | null>(null);
  const [freqTimes, setFreqTimes] = useState(1);
  const [freqDays, setFreqDays] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function applyPreset(idx: number) {
    const p = PRESETS[idx];
    setFreqTimes(p.freqTimes);
    setFreqDays(p.freqDays);
    setSelectedPreset(idx);
  }

  function handleCustomDays(val: number) {
    setFreqDays(val);
    // freqTimes cannot exceed freqDays
    if (freqTimes > val) setFreqTimes(val);
    setSelectedPreset("custom");
  }

  function handleCustomTimes(val: number) {
    setFreqTimes(val);
    // freqDays cannot be less than freqTimes
    if (freqDays < val) setFreqDays(val);
    setSelectedPreset("custom");
  }

  async function handleSubmit() {
    if (!courseType) {
      setError("コースを選んでください");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ courseType, freqTimes, freqDays }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "エラーが発生しました");
        return;
      }

      router.push("/");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <img src="/avatars/avatar_s2_normal.png" alt="avatar" className={styles.avatar} />
        <h1 className={styles.title}>コースを設定しよう</h1>
        <p className={styles.subtitle}>あなたのペースで続けられるプランを選ぼう</p>
      </div>

      {/* Course selection */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>チャレンジ期間</p>
        <div className={styles.courseGrid}>
          {COURSES.map((c) => (
            <div
              key={c.type}
              className={`${styles.courseCard} ${courseType === c.type ? styles.courseCardSelected : ""}`}
              onClick={() => setCourseType(c.type)}
            >
              <p className={styles.courseCardTitle}>{c.label}</p>
              <p className={styles.courseCardDays}>{c.days}</p>
              <p className={styles.courseCardDesc}>{c.desc}</p>
              <p className={styles.courseCardMilestone}>🏆 {c.milestones}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequency selection */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>投稿ペース</p>
        <div className={styles.presets}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              className={`${styles.presetBtn} ${selectedPreset === i ? styles.presetBtnSelected : ""}`}
              onClick={() => applyPreset(i)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className={`${styles.freqCustom} ${selectedPreset === "custom" ? styles.freqCustomSelected : ""}`}>
          <span className={styles.freqLabel}>カスタム：</span>
          <select
            className={styles.freqSelect}
            value={freqDays}
            onChange={(e) => handleCustomDays(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <span className={styles.freqLabel}>日に</span>
          <select
            className={styles.freqSelect}
            value={freqTimes}
            onChange={(e) => handleCustomTimes(Number(e.target.value))}
          >
            {Array.from({ length: freqDays }, (_, i) => i + 1).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className={styles.freqLabel}>回</span>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        {courseType
          ? `${courseType === "1month" ? "1ヶ月" : "3ヶ月"}コース・${freqSummary(freqTimes, freqDays)}`
          : `${freqSummary(freqTimes, freqDays)}（コースを選んでください）`}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.button}
        onClick={handleSubmit}
        disabled={loading || !courseType}
      >
        {loading ? "設定中..." : "はじめる"}
      </button>
    </main>
  );
}
