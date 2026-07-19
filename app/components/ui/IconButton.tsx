import Link from "next/link";
import { ReactNode } from "react";

type IconButtonProps = {
  href: string;
  icon: ReactNode;
  label: string;
};

export function IconButton({ href, icon, label }: IconButtonProps) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        width: 40,
        textDecoration: "none",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          background: "rgba(234,227,214,0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(0,0,0,0.08)",
          color: "rgba(26,26,24,0.72)",
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: "rgba(26,26,24,0.6)",
          letterSpacing: 0.5,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </Link>
  );
}
