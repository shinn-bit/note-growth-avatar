"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BotanicalCorners } from "../components/BotanicalCorners";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const BG    = "#EAE3D6";
const GREEN = "#3D7A50";
const DARK  = "#1A1A18";

type OgpData = { title: string; image: string };

export default function SubmitPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [url, setUrl]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [focused, setFocused] = useState(false);
  const [ogp, setOgp]       = useState<OgpData | null>(null);
  const [ogpLoading, setOgpLoading] = useState(false);

  useEffect(() => {
    setOgp(null);
    if (!url.includes("note.com")) return;
    setOgpLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
        const data: OgpData = await res.json();
        setOgp(data.title || data.image ? data : null);
      } catch {
        setOgp(null);
      } finally {
        setOgpLoading(false);
      }
    }, 700);
    return () => { clearTimeout(timer); setOgpLoading(false); };
  }, [url]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!url.includes("note.com")) {
      setError("note.com の URL を入力してください");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        return;
      }

      let prevFormStage = 0;
      let prevAvatarLevel = 0;
      const prevRaw = localStorage.getItem("note_avatar_prev_state");
      if (prevRaw) {
        try {
          const prev = JSON.parse(prevRaw);
          prevFormStage   = prev.formStage  ?? 0;
          prevAvatarLevel = prev.avatarLevel ?? 0;
        } catch {}
      }

      const evolved =
        !!(data.isMilestone && !data.alreadySubmitted) ||
        (data.state?.formStage !== undefined && data.state.formStage > prevFormStage);

      localStorage.setItem("note_avatar_last_message", JSON.stringify({
        message: data.message,
        isMilestone: data.isMilestone,
        alreadySubmitted: data.alreadySubmitted ?? false,
        evolved,
        prevFormStage,
        newFormStage:   data.state?.formStage   ?? prevFormStage,
        prevAvatarLevel,
        newAvatarLevel: data.state?.avatarLevel ?? prevAvatarLevel,
      }));

      router.push("/result");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 390, margin: "0 auto", minHeight: "100dvh", background: BG, position: "relative", overflow: "hidden", animation: "fadeIn 0.3s ease" }}>
      <BotanicalCorners phase={3} />

      <div style={{ position: "relative", zIndex: 2, padding: "0 0 80px" }}>
        {/* header */}
        <div style={{ padding: "52px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: DARK }}>投稿を記録する</div>
          <div
            onClick={() => router.back()}
            style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: "#8A9882" }}
          >✕</div>
        </div>

        <div style={{ padding: "0 24px", marginTop: 24 }}>
          <div style={{ fontSize: 13, color: "#8A9080", marginBottom: 9 }}>Note記事のURLを貼り付けてください</div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://note.com/..."
              style={{
                width: "100%", height: 50, borderRadius: 14,
                border: `1.5px solid ${url ? GREEN : focused ? GREEN : "#C8C0B0"}`,
                background: "rgba(255,255,255,0.7)",
                padding: "0 14px", fontSize: 14, color: DARK,
                outline: "none", transition: "border 0.2s",
                boxSizing: "border-box", fontFamily: "var(--font-noto), sans-serif",
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />

            {/* OGP preview */}
            {ogpLoading && (
              <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 14, padding: "12px 14px", fontSize: 13, color: "#A09080" }}>
                記事を取得中...
              </div>
            )}
            {!ogpLoading && ogp && (
              <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "flex", gap: 12, alignItems: "center", padding: 12 }}>
                {ogp.image && (
                  <img src={ogp.image} alt="OGP" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
                )}
                <p style={{ fontSize: 13, color: DARK, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
                  {ogp.title || "（タイトルなし）"}
                </p>
              </div>
            )}

            {error && (
              <div style={{ background: "rgba(180,60,40,0.08)", border: "1px solid rgba(180,60,40,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#A04030" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !url.trim()}
              style={{
                width: "100%", height: 56, borderRadius: 28,
                background: loading || !url.trim() ? "#C0B8AE" : GREEN,
                color: "white", border: "none",
                fontSize: 16, fontWeight: 700,
                cursor: loading || !url.trim() ? "default" : "pointer",
                boxShadow: loading || !url.trim() ? "none" : "0 6px 22px rgba(61,122,80,0.4)",
                animation: loading || !url.trim() ? "none" : "pulseGlow 2.5s ease-in-out infinite",
                transition: "all 0.25s", fontFamily: "var(--font-noto), sans-serif",
              }}
            >
              {loading ? "記録中 …" : "記録する 🌱"}
            </button>
          </form>
        </div>

        {/* avatar hint */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
          <div style={{ width: 120, height: 120, borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1.5px solid rgba(200,185,155,0.55)", background: BG, opacity: 0.7 }}>
            <img src="/avatars/avatar_s1_normal.png" alt="avatar" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#9A9080" }}>投稿するたびに木が育ちます</div>
      </div>
    </div>
  );
}
