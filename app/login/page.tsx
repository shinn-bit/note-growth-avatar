"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BotanicalCorners } from "../components/BotanicalCorners";
import { getDeviceId } from "../lib/deviceId";

const BG    = "#EAE3D6";
const GREEN = "#3D7A50";
const DARK  = "#1A1A18";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [focE, setFocE]         = useState(false);
  const [focP, setFocP]         = useState(false);

  const ready = email.trim() && password.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
    } else {
      router.push("/");
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    const deviceId = getDeviceId();
    const result = await signIn("guest", { deviceId, redirect: false });
    setGuestLoading(false);
    if (!result?.error) router.push("/");
  };

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: "100%", height: 50, borderRadius: 14,
    border: `1.5px solid ${focused ? GREEN : "#C8C0B0"}`,
    background: "rgba(255,255,255,0.7)",
    padding: "0 16px", fontSize: 15, color: DARK,
    outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box", fontFamily: "var(--font-noto), sans-serif",
  });

  return (
    <div style={{ width: "100%", maxWidth: 390, margin: "0 auto", minHeight: "100dvh", background: BG, position: "relative", overflow: "hidden", animation: "fadeIn 0.4s ease" }}>
      <BotanicalCorners phase={3} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* avatar header */}
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0 0", animation: "fadeInUp 0.5s 0.05s both" }}>
          <div style={{ width: 140, height: 140, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "1.5px solid rgba(200,185,155,0.55)", background: BG }}>
            <img src="/avatars/avatar_s1_normal.png" alt="avatar" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        </div>

        <div style={{ textAlign: "center", animation: "fadeInUp 0.5s 0.1s both" }}>
          <div style={{ fontFamily: "var(--font-dancing), cursive", fontSize: 36, fontWeight: 700, color: DARK, marginTop: 8, lineHeight: 1 }}>note tree</div>
          <div style={{ fontSize: 12, color: "#9A9080", letterSpacing: 2, marginTop: 5 }}>あなたのnoteを育てよう</div>
        </div>

        {/* form */}
        <div style={{ margin: "24px 28px 0", animation: "fadeInUp 0.5s 0.15s both" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: DARK, marginBottom: 2 }}>ログイン</div>
          <div style={{ fontSize: 13, color: "#9A9080", marginBottom: 18 }}>アカウントにサインイン</div>

          {error && (
            <div style={{ background: "rgba(180,60,40,0.08)", border: "1px solid rgba(180,60,40,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#A04030", marginBottom: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6A7A68", marginBottom: 5, letterSpacing: 0.4 }}>メールアドレス</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                style={inputStyle(focE)} onFocus={() => setFocE(true)} onBlur={() => setFocE(false)} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6A7A68", marginBottom: 5, letterSpacing: 0.4 }}>パスワード</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                style={inputStyle(focP)} onFocus={() => setFocP(true)} onBlur={() => setFocP(false)} required />
            </div>
            <button type="submit" disabled={!ready || loading} style={{
              width: "100%", height: 56, borderRadius: 28,
              background: !ready || loading ? "#C0B8AE" : GREEN,
              color: "white", border: "none", fontSize: 16, fontWeight: 700,
              cursor: !ready || loading ? "default" : "pointer",
              boxShadow: !ready || loading ? "none" : "0 6px 22px rgba(61,122,80,0.4)",
              animation: !ready || loading ? "none" : "pulseGlow 2.5s ease-in-out infinite",
              transition: "all 0.25s", fontFamily: "var(--font-noto), sans-serif",
            }}>
              {loading ? "ログイン中…" : "ログイン"}
            </button>
          </form>
        </div>

        {/* divider */}
        <div style={{ margin: "18px 28px", display: "flex", alignItems: "center", gap: 12, animation: "fadeIn 0.5s 0.2s both" }}>
          <div style={{ flex: 1, height: 1, background: "#C8C0B0" }} />
          <span style={{ fontSize: 12, color: "#B0A898" }}>または</span>
          <div style={{ flex: 1, height: 1, background: "#C8C0B0" }} />
        </div>

        <div style={{ margin: "0 28px", display: "flex", flexDirection: "column", gap: 10, animation: "fadeInUp 0.5s 0.25s both" }}>
          {/* ゲストボタン */}
          <button
            onClick={handleGuest}
            disabled={guestLoading}
            style={{
              height: 50, borderRadius: 25, border: "1.5px solid #C0B8AC",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 600, color: "#6A7A68",
              background: "rgba(255,255,255,0.4)", transition: "background 0.2s",
              cursor: guestLoading ? "default" : "pointer",
              fontFamily: "var(--font-noto), sans-serif",
            }}
          >
            {guestLoading ? "準備中…" : "ゲストで始める"}
          </button>

          {/* 新規登録 */}
          <Link href="/signup" style={{
            display: "flex", height: 50, borderRadius: 25,
            border: "1.5px solid #C0B8AC",
            alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 600, color: "#6A7A68",
            textDecoration: "none",
            background: "rgba(255,255,255,0.4)", transition: "background 0.2s",
          }}>
            新規登録
          </Link>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#B0A898", marginTop: 14, paddingBottom: 40, animation: "fadeIn 0.5s 0.3s both", padding: "12px 28px 40px" }}>
          ゲストはこのブラウザのデータに紐づきます。削除すると引き継げません。
        </div>
      </div>
    </div>
  );
}
