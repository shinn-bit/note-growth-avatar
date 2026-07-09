import { DARK } from "../../lib/theme";
import { Card } from "./Card";

type StatTileProps = {
  label: string;
  value: number | string;
  sublabel: string;
};

export function StatTile({ label, value, sublabel }: StatTileProps) {
  return (
    <Card style={{ flex: 1 }}>
      <div style={{ fontSize: 10, color: "#A09080", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: DARK, fontFamily: "var(--font-dm-serif), serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9A9080", marginTop: 2 }}>{sublabel}</div>
    </Card>
  );
}
