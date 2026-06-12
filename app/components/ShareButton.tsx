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
        width: 32, height: 32, borderRadius: 16,
        background: "rgba(234,227,214,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, cursor: sharing ? "default" : "pointer",
        border: "1px solid rgba(0,0,0,0.08)", opacity: sharing ? 0.6 : 1,
      }}
      title="育成記録をシェア"
    >
      {sharing ? "…" : "📤"}
    </div>
  );
}
