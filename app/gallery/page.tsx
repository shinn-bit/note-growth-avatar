"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "../lib/deviceId";
import { BG, GREEN, GOLD, DARK } from "../lib/theme";
import { PLANT_NAMES, getMaxStage, getPlantImageSrc } from "../lib/plant";
import { FullScreenLoader } from "../components/ui/LoadingDots";
import { Card } from "../components/ui/Card";
import { CloseButton } from "../components/ui/CloseButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type PlantState = {
  currentPlantType: number;
  currentPlantStage: number;
  completedPlants: number[];
};

type GalleryEntry = {
  plantType: number;
  maxUnlockedStage: number;
  isCurrentlyGrowing: boolean;
  completedCount: number;
};

export default function GalleryPage() {
  const router = useRouter();
  const [state, setState] = useState<PlantState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<GalleryEntry | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    const id = getDeviceId();
    fetch(`${API_URL}/state?deviceId=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(data => {
        setState(data as PlantState);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <FullScreenLoader />;
  }

  // Build gallery entries: current plant + all unique completed plants
  const entries: GalleryEntry[] = [];
  const seen = new Set<number>();

  const currentType = state?.currentPlantType ?? 0;
  const currentStage = state?.currentPlantStage ?? 1;
  const completedPlants = state?.completedPlants ?? [];

  // Current in-progress plant
  entries.push({
    plantType: currentType,
    maxUnlockedStage: currentStage,
    isCurrentlyGrowing: true,
    completedCount: completedPlants.filter(t => t === currentType).length,
  });
  seen.add(currentType);

  // Completed plants (unique, not already shown)
  for (const t of [...completedPlants].reverse()) {
    if (!seen.has(t)) {
      entries.push({
        plantType: t,
        maxUnlockedStage: getMaxStage(t),
        isCurrentlyGrowing: false,
        completedCount: completedPlants.filter(x => x === t).length,
      });
      seen.add(t);
    }
  }

  if (selectedPlant) {
    return (
      <div style={{ width: "100%", maxWidth: 390, margin: "0 auto", minHeight: "100dvh", background: BG, display: "flex", flexDirection: "column" }}>
        {/* Lightbox */}
        {lightboxSrc && (
          <div
            onClick={() => setLightboxSrc(null)}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,14,10,0.85)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }}
          >
            <img
              src={lightboxSrc}
              alt=""
              style={{ maxWidth: "90vw", maxHeight: "90dvh", objectFit: "contain", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
            />
            <div style={{ position: "absolute", top: 20, right: 20, width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16, cursor: "pointer" }}>✕</div>
          </div>
        )}

        <div style={{ padding: "52px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {selectedPlant.isCurrentlyGrowing
              ? <div style={{ fontSize: 15, color: GREEN, fontWeight: 700 }}>🌱 育成中</div>
              : <div style={{ fontSize: 15, color: GOLD, fontWeight: 700 }}>✅ 完成済み × {selectedPlant.completedCount}</div>
            }
          </div>
          <CloseButton onClick={() => setSelectedPlant(null)} />
        </div>

        {/* Stages — vertical list of square cards */}
        <div style={{ padding: "0 24px 60px", display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.from({ length: getMaxStage(selectedPlant.plantType) }).map((_, i) => {
            const stage = i + 1;
            const unlocked = stage <= selectedPlant.maxUnlockedStage;
            const isCurrent = selectedPlant.isCurrentlyGrowing && stage === selectedPlant.maxUnlockedStage;
            const src = getPlantImageSrc(selectedPlant.plantType, stage);
            return (
              <Card
                key={stage}
                onClick={unlocked ? () => setLightboxSrc(src) : undefined}
                borderRadius={20}
                border={isCurrent ? `2px solid ${GREEN}` : "none"}
                style={{ opacity: unlocked ? 1 : 0.38, position: "relative" }}
              >
                <div style={{ width: "100%", aspectRatio: "1", borderRadius: 14, overflow: "hidden", background: BG }}>
                  {unlocked ? (
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🔒</div>
                  )}
                </div>
                {isCurrent && (
                  <div style={{ position: "absolute", top: 18, right: 18, background: GREEN, borderRadius: 10, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "white" }}>現在</div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 390, margin: "0 auto", minHeight: "100dvh", background: BG, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 700, color: DARK }}>育てた植物</div>
          <div style={{ fontSize: 12, color: "#9A9080", marginTop: 2 }}>植物を選ぶとステージを確認できます</div>
        </div>
        <CloseButton onClick={() => router.push("/")} />
      </div>

      {entries.length === 0 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9A9080", fontSize: 14, gap: 12 }}>
          <div style={{ fontSize: 48 }}>🌱</div>
          <div>まだ植物が育っていません</div>
          <div style={{ fontSize: 12 }}>投稿を記録すると植物が育ちます</div>
        </div>
      )}

      <div style={{ padding: "0 24px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {entries.map((entry) => (
          <Card
            key={entry.plantType}
            onClick={() => setSelectedPlant(entry)}
            padding={12}
            border={entry.isCurrentlyGrowing ? `2px solid ${GREEN}` : "1.5px solid rgba(200,192,176,0.5)"}
            style={{ transition: "transform 0.15s" }}
          >
            <div style={{ width: "100%", aspectRatio: "1", borderRadius: 12, overflow: "hidden", background: BG }}>
              <img
                src={getPlantImageSrc(entry.plantType, entry.maxUnlockedStage)}
                alt={PLANT_NAMES[entry.plantType]}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              {entry.isCurrentlyGrowing ? (
                <div style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>🌱 育成中 · S{entry.maxUnlockedStage}/{getMaxStage(entry.plantType)}</div>
              ) : (
                <div style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>✅ 完成 × {entry.completedCount}</div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
