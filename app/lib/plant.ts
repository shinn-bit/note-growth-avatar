export const PLANT_NAMES = ["ふじの木", "アオモミジ", "アカモミジ", "ルミナ", "トキスナ", "MINT", "ハモンサン", "ササネ", "シロカサネ", "カスミタマ", "スミエ"];

// Plant type 0 (starter) gets 6 stages as a special case; types 1-10 have 5
export function getMaxStage(plantType: number): number {
  return plantType === 0 ? 6 : 5;
}

export function getPlantImageSrc(plantType: number, stage: number): string {
  return `/avatars/${PLANT_NAMES[plantType]}-${Math.min(stage, getMaxStage(plantType))}.png`;
}
