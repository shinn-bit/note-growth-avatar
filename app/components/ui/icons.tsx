import { CSSProperties } from "react";

// Hand-drawn thin-line icon set for note TREE.
// All icons: 24x24 viewBox, stroke = currentColor (set `color` on a parent or pass color).

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
};

function svgProps(size: number, color: string | undefined, strokeWidth: number, style?: CSSProperties) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color ?? "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style,
  };
}

/** Five-petal flower — gallery (植物図鑑) */
export function FlowerIcon({ size = 18, color, strokeWidth = 1.5, style }: IconProps) {
  const petal = "M12 9.4 C10 7.8 10 4.8 12 3 C14 4.8 14 7.8 12 9.4 Z";
  return (
    <svg {...svgProps(size, color, strokeWidth, style)}>
      {[0, 72, 144, 216, 288].map(a => (
        <path key={a} d={petal} transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2.1" />
    </svg>
  );
}

/** Journal page with entry lines — post history */
export function JournalIcon({ size = 18, color, strokeWidth = 1.5, style }: IconProps) {
  return (
    <svg {...svgProps(size, color, strokeWidth, style)}>
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <path d="M8.5 9 H15.5" />
      <path d="M8.5 12.5 H15.5" />
      <path d="M8.5 16 H12.5" />
    </svg>
  );
}

/** Two-row sliders — settings */
export function SlidersIcon({ size = 18, color, strokeWidth = 1.5, style }: IconProps) {
  return (
    <svg {...svgProps(size, color, strokeWidth, style)}>
      <path d="M4.5 8.5 H7.6" />
      <circle cx="10" cy="8.5" r="2.2" />
      <path d="M12.4 8.5 H19.5" />
      <path d="M4.5 15.5 H12.3" />
      <circle cx="14.7" cy="15.5" r="2.2" />
      <path d="M17.1 15.5 H19.5" />
    </svg>
  );
}

/** Single leaf with midrib — "posted today" */
export function LeafIcon({ size = 18, color, strokeWidth = 1.5, style }: IconProps) {
  return (
    <svg {...svgProps(size, color, strokeWidth, style)}>
      <path d="M5 19.5 C5 11.5 10.5 6 20 4.5 C18.5 14.5 13 19.5 5 19.5 Z" />
      <path d="M5 19.5 C8.5 14.5 12.5 10.5 16.5 7.5" />
    </svg>
  );
}

/** Young sprout — "not yet posted" / growth */
export function SproutIcon({ size = 18, color, strokeWidth = 1.5, style }: IconProps) {
  return (
    <svg {...svgProps(size, color, strokeWidth, style)}>
      <path d="M12 21 V13.5" />
      <path d="M12 14 C7.5 14 5.2 10.8 5 7 C9.5 7.2 12 9.8 12 14 Z" />
      <path d="M12 12.5 C15.5 12.5 17.6 10 17.8 7 C14.2 7.2 12 9.3 12 12.5 Z" />
    </svg>
  );
}

/** Padlock — locked gallery stage */
export function LockIcon({ size = 18, color, strokeWidth = 1.5, style }: IconProps) {
  return (
    <svg {...svgProps(size, color, strokeWidth, style)}>
      <rect x="6" y="10.5" width="12" height="9" rx="2.5" />
      <path d="M8.8 10.5 V8.2 A3.2 3.2 0 0 1 15.2 8.2 V10.5" />
      <path d="M12 14 V16" />
    </svg>
  );
}

/** Check in a circle — completed */
export function CheckCircleIcon({ size = 18, color, strokeWidth = 1.5, style }: IconProps) {
  return (
    <svg {...svgProps(size, color, strokeWidth, style)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.4 12.2 L11 14.8 L15.8 9.6" />
    </svg>
  );
}

/** Round-canopy tree — total posts / long-term growth */
export function TreeIcon({ size = 18, color, strokeWidth = 1.5, style }: IconProps) {
  return (
    <svg {...svgProps(size, color, strokeWidth, style)}>
      <path d="M12 3.5 C7.5 3.5 5 6.8 5 10 C5 13.2 8 15.3 12 15.3 C16 15.3 19 13.2 19 10 C19 6.8 16.5 3.5 12 3.5 Z" />
      <path d="M12 15.3 V20.5" />
      <path d="M12 12 L9.5 9.5" />
      <path d="M12 10 L14 8" />
    </svg>
  );
}

/** Four-point sparkle — milestone / evolution */
export function SparkleIcon({ size = 18, color, strokeWidth = 1.5, style }: IconProps) {
  return (
    <svg {...svgProps(size, color, strokeWidth, style)}>
      <path d="M12 3.5 L13.7 10.3 L20.5 12 L13.7 13.7 L12 20.5 L10.3 13.7 L3.5 12 L10.3 10.3 Z" />
      <path d="M18.5 4.5 L18.9 6.1 L20.5 6.5 L18.9 6.9 L18.5 8.5 L18.1 6.9 L16.5 6.5 L18.1 6.1 Z" />
    </svg>
  );
}

/** Bell with a slash — notifications off */
export function BellOffIcon({ size = 18, color, strokeWidth = 1.5, style }: IconProps) {
  return (
    <svg {...svgProps(size, color, strokeWidth, style)}>
      <path d="M12 4.5 C15.2 4.5 17 7 17 10 C17 14 18 15.5 18.8 16.5 H8" />
      <path d="M7 12.5 C7 14.8 6.4 15.8 5.2 16.5" />
      <path d="M10.3 19.5 A1.8 1.8 0 0 0 13.7 19.5" />
      <path d="M4.5 4.5 L19.5 19.5" />
    </svg>
  );
}

/** Bell — notification settings */
export function BellIcon({ size = 18, color, strokeWidth = 1.5, style }: IconProps) {
  return (
    <svg {...svgProps(size, color, strokeWidth, style)}>
      <path d="M12 4.5 C15.2 4.5 17 7 17 10 C17 14 18 15.5 18.8 16.5 H5.2 C6 15.5 7 14 7 10 C7 7 8.8 4.5 12 4.5 Z" />
      <path d="M10.3 19.5 A1.8 1.8 0 0 0 13.7 19.5" />
    </svg>
  );
}
