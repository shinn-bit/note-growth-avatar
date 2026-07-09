import { CSSProperties, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  onClick?: () => void;
  background?: string;
  borderRadius?: number;
  padding?: string | number;
  border?: string;
  style?: CSSProperties;
};

export function Card({
  children,
  onClick,
  background = "rgba(255,255,255,0.7)",
  borderRadius = 18,
  padding = "12px 16px",
  border = "none",
  style,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background,
        borderRadius,
        padding,
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        border,
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
