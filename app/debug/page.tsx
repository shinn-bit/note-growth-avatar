"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "../lib/deviceId";
import { BG, GREEN, GOLD, DARK, RED } from "../lib/theme";
import { PLANT_NAMES, getMaxStage, getPlantImageSrc } from "../lib/plant";
import { StageProgress } from "../components/ui/StageProgress";
import { Card } from "../components/ui/Card";
import { GachaOverlay, type GachaState } from "../components/GachaOverlay";
import { GrowthOverlay, type GrowthState } from "../components/GrowthOverlay";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type PlantState = {
  streak: number;
  currentPlantType: number;
  currentPlantStage: number;
  completedPlants: number[];
  lastPostDate: string | null;
};

export default function DebugPage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState("");
  const [state, setState] = useState<PlantState | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [previewGacha, setPreviewGacha] = useState<GachaState | null>(null);
  const [previewGrowth, setPreviewGrowth] = useState<GrowthState | null>(null);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    loadState(id);
  }, []);

  async function loadState(id: string) {
    try {
      const r = await fetch(`${API_URL}/state?deviceId=${encodeURIComponent(id)}`);
      const d = await r.json();
      setState(d);
    } catch (e) {
      addLog(`❌ 取得エラー: ${e}`);
    }
  }

  function addLog(msg: string) {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 29)]);
  }

  async function advance(times: number) {
    if (busy) return;
    setBusy(true);
    for (let i = 0; i < times; i++) {
      try {
        const r = await fetch(`${API_URL}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, url: "https://note.com/debug/test_post", debugMode: true }),
        });
        const d = await r.json();
        if (d.alreadySubmitted) {
          addLog("⚠️ 本日投稿済み → リセット後に再試行してください");
          break;
        }
        if (d.completedPlantType !== null) {
          addLog(`🎉 植物完成！ type${d.completedPlantType} → ガチャ → type${d.newPlantType} (${PLANT_NAMES[d.newPlantType]})`);
        } else {
          addLog(`✅ stage進行: type=${d.state?.currentPlantType} stage=${d.state?.currentPlantStage}/${getMaxStage(d.state?.currentPlantType ?? 0)}  streak=${d.state?.streak}`);
        }
        if (d.state) setState(d.state);
      } catch (e) {
        addLog(`❌ エラー: ${e}`);
        break;
      }
      // 連続投稿では日付チェックが同じ日なのでループ後半で止まる
    }
    setBusy(false);
  }

  async function resetState() {
    if (!confirm("リセットしますか？")) return;
    try {
      await fetch(`${API_URL}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      addLog("🔄 リセット完了");
      await loadState(deviceId);
    } catch (e) {
      addLog(`❌ リセットエラー: ${e}`);
    }
  }

  const s = state;

  return (
    <div style={{ width: "100%", maxWidth: 500, margin: "0 auto", minHeight: "100dvh", background: BG, padding: "24px 20px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: DARK, fontFamily: "monospace" }}>🛠 Debug</div>
        <button onClick={() => router.push("/")} style={{ padding: "6px 14px", borderRadius: 12, border: "none", background: "rgba(0,0,0,0.08)", cursor: "pointer", fontSize: 13, color: DARK }}>← ホーム</button>
      </div>

      {/* Current state */}
      <Card background="rgba(255,255,255,0.85)" padding={16} style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#9A9080", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>CURRENT STATE</div>
        {s ? (
          <>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", border: `2px solid ${GREEN}`, flexShrink: 0 }}>
                <img src={getPlantImageSrc(s.currentPlantType, s.currentPlantStage)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.8, color: DARK }}>
                <div><b style={{ color: GOLD }}>{PLANT_NAMES[s.currentPlantType]}</b></div>
                <div>type: {s.currentPlantType} · stage: <b>{s.currentPlantStage}</b>/{getMaxStage(s.currentPlantType)}</div>
                <div>streak: {s.streak}</div>
                <div style={{ fontSize: 11, color: "#9A9080" }}>lastPost: {s.lastPostDate ?? "なし"}</div>
                <div style={{ fontSize: 11, color: "#9A9080" }}>completed: [{s.completedPlants.join(", ")}]</div>
              </div>
            </div>
            {/* Stage progress dots */}
            <StageProgress stage={s.currentPlantStage} maxStage={getMaxStage(s.currentPlantType)} variant="bars" />
            <div style={{ fontSize: 11, color: "#9A9080", marginTop: 4, textAlign: "right" }}>ステージ {s.currentPlantStage}/{getMaxStage(s.currentPlantType)}</div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: "#9A9080" }}>読み込み中...</div>
        )}
      </Card>

      {/* Action buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <button
          onClick={() => advance(1)}
          disabled={busy}
          style={{ padding: "14px 0", borderRadius: 14, border: "none", background: busy ? "#C0B8AE" : GREEN, color: "white", fontWeight: 700, fontSize: 15, cursor: busy ? "default" : "pointer", transition: "all 0.2s" }}
        >
          {busy ? "処理中…" : "▶ 1回進める"}
        </button>
        <button
          onClick={() => advance(5)}
          disabled={busy}
          style={{ padding: "14px 0", borderRadius: 14, border: "none", background: busy ? "#C0B8AE" : GOLD, color: "white", fontWeight: 700, fontSize: 15, cursor: busy ? "default" : "pointer", transition: "all 0.2s" }}
        >
          {busy ? "処理中…" : "▶▶ 5回進める"}
        </button>
        <button
          onClick={() => advance(10)}
          disabled={busy}
          style={{ padding: "14px 0", borderRadius: 14, border: "none", background: busy ? "#C0B8AE" : "#5A6A9A", color: "white", fontWeight: 700, fontSize: 15, cursor: busy ? "default" : "pointer", transition: "all 0.2s" }}
        >
          {busy ? "処理中…" : "▶▶▶ 10回進める"}
        </button>
        <button
          onClick={resetState}
          style={{ padding: "14px 0", borderRadius: 14, border: "none", background: RED, color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
        >
          🔄 リセット
        </button>
      </div>

      <div style={{ fontSize: 11, color: GREEN, marginBottom: 12, padding: "8px 12px", background: "rgba(61,122,80,0.08)", borderRadius: 10 }}>
        ✅ debugMode=true で日付制限バイパス済み — 何回でも進めます
      </div>

      {/* Gacha animation preview (no API) */}
      <button
        onClick={() => {
          const completed = s?.currentPlantType ?? 0;
          const candidates = [...Array(PLANT_NAMES.length).keys()].filter(t => t !== completed);
          const next = candidates[Math.floor(Math.random() * candidates.length)];
          setPreviewGacha({ completedPlantType: completed, newPlantType: next });
        }}
        style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: `1.5px dashed ${GOLD}`, background: "rgba(196,146,42,0.08)", color: GOLD, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 14 }}
      >
        🌙 ガチャ演出プレビュー（API送信なし）
      </button>
      <button
        onClick={() => {
          const type = s?.currentPlantType ?? 0;
          const max = getMaxStage(type);
          const from = Math.min(s?.currentPlantStage ?? 1, max - 1);
          setPreviewGrowth({ plantType: type, fromStage: from, toStage: from + 1 });
        }}
        style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: `1.5px dashed ${GREEN}`, background: "rgba(61,122,80,0.08)", color: GREEN, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 14 }}
      >
        🌱 成長演出プレビュー（API送信なし）
      </button>

      {/* All plant type previews */}
      <Card background="rgba(255,255,255,0.85)" padding={16} style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#9A9080", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>ALL PLANT TYPES (stage 1)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => (
            <div key={t} style={{ textAlign: "center" }}>
              <div style={{ width: "100%", aspectRatio: "1", borderRadius: 10, overflow: "hidden", background: BG, border: t === s?.currentPlantType ? `2px solid ${GREEN}` : "1.5px solid rgba(200,192,176,0.5)" }}>
                <img src={getPlantImageSrc(t, 1)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ fontSize: 10, color: "#9A9080", marginTop: 3 }}>type {t}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Log */}
      <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 10, color: "#9A9080", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>LOG</div>
        {log.length === 0 && <div style={{ fontSize: 12, color: "#A09080", fontFamily: "monospace" }}>まだ操作がありません</div>}
        {log.map((l, i) => (
          <div key={i} style={{ fontSize: 12, color: i === 0 ? DARK : "#9A9080", marginBottom: 4, fontFamily: "monospace", wordBreak: "break-all" }}>{l}</div>
        ))}
      </div>

      {previewGacha && (
        <GachaOverlay gacha={previewGacha} onDone={() => setPreviewGacha(null)} />
      )}
      {previewGrowth && (
        <GrowthOverlay growth={previewGrowth} onDone={() => setPreviewGrowth(null)} />
      )}
    </div>
  );
}
