import { BG, GREEN } from "../../lib/theme";

export function LoadingDots({ size = 8, color = GREEN }: { size?: number; color?: string }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: size, height: size, borderRadius: "50%", background: color, animation: `shimmerDot 1.2s ${i * 0.22}s ease-in-out infinite` }} />
      ))}
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", background: BG }}>
      <LoadingDots />
    </div>
  );
}
