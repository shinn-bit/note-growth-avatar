export function CloseButton({ onClick, tone = "light" }: { onClick: () => void; tone?: "light" | "dark" }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        background: tone === "dark" ? "rgba(239,232,212,0.1)" : "rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 13,
        color: tone === "dark" ? "#A9B194" : "#8A9882",
      }}
    >
      ✕
    </div>
  );
}
