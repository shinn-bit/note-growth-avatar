import { SOIL_LEAF } from "../../lib/theme";

// Binary posting heatmap on the soil surface.
// Single-hue fill (posted / not); "today" is marked by a cream ring — shape, not
// a second color, because leaf-green vs gold fills fail CVD/normal-vision separation.

type HeatmapProps = {
  dates: string[];        // YYYY-MM-DD of days with a post
  today: string;          // YYYY-MM-DD (JST)
  weeks?: number;         // columns (or rows when horizontal)
  cellSize?: number;
  gap?: number;
  showMonthLabels?: boolean;
  horizontal?: boolean;   // calendar-style: weeks as rows, Mon→Sun as columns
};

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Monday-start weekday index: Mon=0 … Sun=6
function mondayIndex(iso: string): number {
  return (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export function Heatmap({ dates, today, weeks = 12, cellSize = 14, gap = 4, showMonthLabels = false, horizontal = false }: HeatmapProps) {
  const posted = new Set(dates);
  const gridStart = addDays(today, -(mondayIndex(today) + (weeks - 1) * 7));

  const columns = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d))
  );

  const monthLabel = (weekDays: string[], w: number): string | null => {
    if (!showMonthLabels) return null;
    const firstOfMonth = weekDays.find(d => d.endsWith("-01"));
    if (w === 0) return `${parseInt(columns[0][0].slice(5, 7), 10)}月`;
    return firstOfMonth ? `${parseInt(firstOfMonth.slice(5, 7), 10)}月` : null;
  };

  return (
    <div style={{ display: "flex", flexDirection: horizontal ? "column" : "row", gap }}>
      {columns.map((weekDays, w) => (
        <div key={w} style={{ display: "flex", flexDirection: horizontal ? "row" : "column", gap }}>
          {showMonthLabels && (
            <div style={{ height: 12, fontSize: 9, color: "rgba(239,232,212,0.5)", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
              {monthLabel(weekDays, w)}
            </div>
          )}
          {weekDays.map(day => {
            const isFuture = day > today;
            const isPosted = posted.has(day);
            const isToday = day === today;
            return (
              <div
                key={day}
                title={isFuture ? undefined : `${day.replace(/-/g, "/")} ${isPosted ? "· 記録あり" : "· 記録なし"}`}
                style={{
                  width: cellSize, height: cellSize, borderRadius: 3.5,
                  background: isFuture
                    ? "rgba(239,232,212,0.03)"
                    : isPosted ? SOIL_LEAF : "rgba(239,232,212,0.09)",
                  boxShadow: isToday ? "inset 0 0 0 1.5px rgba(239,232,212,0.85)" : "none",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
