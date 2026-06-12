"use client";

import { useState } from "react";
import { generateShareImage } from "../lib/shareImage";

export function ShareButton({
  imgSrc,
  stageName,
  stageDesc,
  streak,
}: {
  imgSrc: string;
  stageName: string;
  stageDesc: string;
  streak: number;
}) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const blob = await generateShareImage({ imgSrc, stageName, stageDesc, streak });
      const file = new File([blob], "note-tree.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "note tree",
          text: "書くたびに、育つ。 #notetree",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "note-tree.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") console.error(e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      onClick={sharing ? undefined : handleShare}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        height: 32, padding: "0 12px", borderRadius: 16,
        background: "rgba(234,227,214,0.75)", backdropFilter: "blur(4px)",
        fontSize: 12, fontWeight: 700, color: "#1A1A18",
        cursor: sharing ? "default" : "pointer",
        border: "1px solid rgba(0,0,0,0.08)", opacity: sharing ? 0.6 : 1,
      }}
      title="育成記録をシェア"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
        <path d="M16 6l-4-4-4 4" />
        <path d="M12 2v13" />
      </svg>
      {sharing ? "…" : "シェア"}
    </div>
  );
}
