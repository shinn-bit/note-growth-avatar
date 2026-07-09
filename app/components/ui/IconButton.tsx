import Link from "next/link";
import { ReactNode } from "react";

type IconButtonProps = {
  href: string;
  icon: ReactNode;
  tooltip: string;
};

export function IconButton({ href, icon, tooltip }: IconButtonProps) {
  return (
    <div style={{ position: "relative" }} className="tooltip-wrap">
      <Link
        href={href}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          background: "rgba(234,227,214,0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          border: "1px solid rgba(0,0,0,0.08)",
          textDecoration: "none",
        }}
      >
        {icon}
      </Link>
      <div
        style={{
          position: "absolute",
          top: 38,
          right: 0,
          background: "rgba(26,26,24,0.85)",
          color: "white",
          fontSize: 11,
          fontWeight: 600,
          padding: "4px 8px",
          borderRadius: 8,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.15s",
        }}
        className="tooltip"
      >
        {tooltip}
      </div>
    </div>
  );
}
