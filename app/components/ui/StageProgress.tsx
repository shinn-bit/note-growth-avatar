import { GREEN } from "../../lib/theme";

const UNFILLED = "#C8C0B0";

type StageProgressProps = {
  stage: number;
  maxStage: number;
  variant?: "pills" | "bars";
  color?: string;
  unfilledColor?: string;
  activeWidth?: number;
};

export function StageProgress({
  stage,
  maxStage,
  variant = "pills",
  color = GREEN,
  unfilledColor = UNFILLED,
  activeWidth = 24,
}: StageProgressProps) {
  if (variant === "bars") {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: maxStage }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i + 1 <= stage ? color : unfilledColor, transition: "all 0.3s" }} />
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
      {Array.from({ length: maxStage }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i + 1 === stage ? activeWidth : 10,
            height: 10,
            borderRadius: 5,
            background: i + 1 <= stage ? color : unfilledColor,
            transition: "all 0.3s",
          }}
        />
      ))}
    </div>
  );
}
