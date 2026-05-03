export function BotanicalCorners({ phase }: { phase: number }) {
  const vine = "#2A3A28";
  const lf1  = "#2A4A30";
  const lf2  = "#3D6A46";
  const lf3  = "#4A7A54";

  return (
    <svg
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <style>{`
          .vine2{stroke-dasharray:600;animation:vineGrow 1.4s cubic-bezier(0.4,0,0.2,1) both;}
          .lf2{animation:leafPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;}
          .sw2{animation:leafSway 3.5s ease-in-out infinite;}
        `}</style>
      </defs>

      {/* TOP-LEFT */}
      <g style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.6s" }}>
        <path className="vine2" d="M-10 8 Q 22 -4 62 6 Q 104 18 136 8 Q 168 -1 190 16" stroke={vine} strokeWidth="2.2" fill="none" strokeLinecap="round" style={{ animationDelay: "0s" }} />
        <path className="vine2" d="M-10 28 Q 32 14 74 20 Q 118 26 150 16 Q 178 8 196 22" stroke={vine} strokeWidth="1.4" fill="none" strokeLinecap="round" style={{ animationDelay: "0.1s" }} />
        <ellipse className="lf2 sw2" cx="30"  cy="12" rx="26" ry="10" fill={lf1} transform="rotate(-50 30 12)"  style={{ animationDelay: "0.3s", transformOrigin: "30px 12px" }} />
        <ellipse className="lf2 sw2" cx="70"  cy="5"  rx="22" ry="9"  fill={lf2} transform="rotate(-30 70 5)"   style={{ animationDelay: "0.4s", transformOrigin: "70px 5px" }} />
        <ellipse className="lf2 sw2" cx="114" cy="3"  rx="20" ry="8"  fill={lf1} transform="rotate(-14 114 3)"  style={{ animationDelay: "0.5s", transformOrigin: "114px 3px" }} />
        <ellipse className="lf2 sw2" cx="156" cy="7"  rx="17" ry="7"  fill={lf3} transform="rotate(-4 156 7)"   style={{ animationDelay: "0.55s", transformOrigin: "156px 7px" }} />
        <ellipse className="lf2" cx="48"  cy="24" rx="14" ry="6"  fill={lf3} transform="rotate(-56 48 24)"  style={{ animationDelay: "0.5s" }} />
        <ellipse className="lf2" cx="92"  cy="16" rx="13" ry="5.5" fill={lf2} transform="rotate(-34 92 16)" style={{ animationDelay: "0.6s" }} />
        <ellipse className="lf2" cx="136" cy="18" rx="12" ry="5"  fill={lf1} transform="rotate(-17 136 18)" style={{ animationDelay: "0.65s" }} />
        <path className="vine2" d="M50 22 Q40 42 34 58" stroke={vine} strokeWidth="1.1" fill="none" strokeLinecap="round" style={{ animationDelay: "0.6s" }} />
        <ellipse cx="32" cy="60" rx="7" ry="3" fill={lf3} transform="rotate(-50 32 60)" style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s 0.8s" }} />
      </g>

      {/* TOP-RIGHT */}
      <g style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.6s 0.1s" }}>
        <path className="vine2" d="M400 6 Q 366 -4 328 6 Q 286 16 254 7 Q 220 -1 200 16" stroke={vine} strokeWidth="2.2" fill="none" strokeLinecap="round" style={{ animationDelay: "0.08s" }} />
        <path className="vine2" d="M400 26 Q 362 12 322 18 Q 276 25 246 14 Q 216 6 196 22" stroke={vine} strokeWidth="1.4" fill="none" strokeLinecap="round" style={{ animationDelay: "0.18s" }} />
        <ellipse className="lf2 sw2" cx="360" cy="10" rx="26" ry="10" fill={lf1} transform="rotate(48 360 10)"  style={{ animationDelay: "0.32s", transformOrigin: "360px 10px" }} />
        <ellipse className="lf2 sw2" cx="320" cy="3"  rx="22" ry="9"  fill={lf3} transform="rotate(28 320 3)"   style={{ animationDelay: "0.42s", transformOrigin: "320px 3px" }} />
        <ellipse className="lf2 sw2" cx="276" cy="3"  rx="20" ry="8"  fill={lf1} transform="rotate(14 276 3)"   style={{ animationDelay: "0.5s",  transformOrigin: "276px 3px" }} />
        <ellipse className="lf2 sw2" cx="234" cy="7"  rx="17" ry="7"  fill={lf2} transform="rotate(4 234 7)"    style={{ animationDelay: "0.56s", transformOrigin: "234px 7px" }} />
        <ellipse className="lf2" cx="342" cy="23" rx="14" ry="6"  fill={lf2} transform="rotate(54 342 23)"  style={{ animationDelay: "0.5s" }} />
        <ellipse className="lf2" cx="298" cy="15" rx="13" ry="5.5" fill={lf3} transform="rotate(32 298 15)" style={{ animationDelay: "0.6s" }} />
        <path className="vine2" d="M340 21 Q350 41 356 58" stroke={vine} strokeWidth="1.1" fill="none" strokeLinecap="round" style={{ animationDelay: "0.62s" }} />
      </g>

      {/* BOTTOM-LEFT */}
      <g style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.7s 0.4s" }}>
        <path d="M-10 838 Q 24 800 68 786 Q 108 772 142 780 Q 174 788 196 772" stroke={vine} strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="34"  cy="812" rx="24" ry="9" fill={lf1} transform="rotate(52 34 812)" />
        <ellipse cx="78"  cy="798" rx="21" ry="8" fill={lf2} transform="rotate(36 78 798)" />
        <ellipse cx="120" cy="794" rx="18" ry="7" fill={lf3} transform="rotate(18 120 794)" />
        <ellipse cx="160" cy="802" rx="15" ry="6" fill={lf1} transform="rotate(5 160 802)" />
        <path d="M32 798 Q22 778 18 758" stroke={vine} strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <ellipse cx="16" cy="756" rx="8" ry="3.5" fill={lf3} transform="rotate(70 16 756)" />
      </g>

      {/* BOTTOM-RIGHT */}
      <g style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.7s 0.5s" }}>
        <path d="M400 836 Q 366 798 322 784 Q 282 770 248 778 Q 216 786 194 770" stroke={vine} strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="356" cy="810" rx="24" ry="9" fill={lf2} transform="rotate(-52 356 810)" />
        <ellipse cx="312" cy="796" rx="21" ry="8" fill={lf1} transform="rotate(-36 312 796)" />
        <ellipse cx="270" cy="792" rx="18" ry="7" fill={lf3} transform="rotate(-18 270 792)" />
        <ellipse cx="230" cy="800" rx="15" ry="6" fill={lf1} transform="rotate(-5 230 800)" />
        <path d="M358 796 Q370 776 374 756" stroke={vine} strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <ellipse cx="376" cy="754" rx="8" ry="3.5" fill={lf3} transform="rotate(-68 376 754)" />
      </g>
    </svg>
  );
}
