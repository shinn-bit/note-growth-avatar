export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        background: "rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 13,
        color: "#8A9882",
      }}
    >
      ✕
    </div>
  );
}
