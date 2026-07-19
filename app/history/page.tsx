"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "../lib/deviceId";
import { SOIL_TOP, SOIL_BOTTOM, PARCHMENT, PARCH_MUTED, SOIL_RULE, SOIL_GOLD, SOIL_LEAF } from "../lib/theme";
import { SproutIcon } from "../components/ui/icons";
import { Heatmap } from "../components/ui/Heatmap";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Post = {
  date: string;
  url: string;
  createdAt: string | null;
};

type OgpData = {
  title: string;
  image: string;
};

function getTodayJST(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

async function fetchOgp(url: string): Promise<OgpData> {
  try {
    const res = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
    if (res.ok) return await res.json();
  } catch {}
  return { title: "", image: "" };
}

function PostRow({ post, ogp }: { post: Post; ogp: OgpData | null }) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "rgba(239,232,212,0.06)",
        border: "1px solid rgba(239,232,212,0.12)",
        borderRadius: 14, padding: "10px 14px",
        textDecoration: "none",
      }}
    >
      {ogp?.image
        ? <img src={ogp.image} alt="" style={{ width: 46, height: 46, borderRadius: 9, objectFit: "cover", flexShrink: 0, opacity: 0.92 }} />
        : <div style={{ width: 46, height: 46, borderRadius: 9, background: "rgba(239,232,212,0.07)", border: "1px solid rgba(239,232,212,0.14)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><SproutIcon size={20} color={SOIL_GOLD} /></div>
      }
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div style={{ fontSize: 10, color: PARCH_MUTED, letterSpacing: 1.5, marginBottom: 3 }}>{post.date.replace(/-/g, "/")}</div>
        <div style={{ fontSize: 13, color: PARCHMENT, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ogp?.title || "タイトルを取得中..."}
        </div>
      </div>
      <span style={{ color: PARCH_MUTED, fontSize: 13, flexShrink: 0 }}>→</span>
    </a>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [ogpMap, setOgpMap] = useState<Record<string, OgpData>>({});
  const [loading, setLoading] = useState(true);
  const [today] = useState(getTodayJST);

  useEffect(() => {
    const deviceId = getDeviceId();

    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/history?deviceId=${encodeURIComponent(deviceId)}`);
        if (!res.ok) return;
        const data = await res.json();
        setPosts(data.posts ?? []);

        const entries = await Promise.all(
          (data.posts ?? []).map(async (p: Post) => {
            const ogp = await fetchOgp(p.url);
            return [p.url, ogp] as [string, OgpData];
          })
        );
        setOgpMap(Object.fromEntries(entries));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cutoff12w = (() => {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 12 * 7);
    return d.toISOString().slice(0, 10);
  })();
  const days12w = new Set(posts.filter(p => p.date >= cutoff12w).map(p => p.date)).size;

  return (
    <div style={{
      width: "100%", maxWidth: 390, margin: "0 auto", minHeight: "100dvh",
      background: `linear-gradient(180deg, ${SOIL_TOP} 0%, ${SOIL_BOTTOM} 100%)`,
      display: "flex", flexDirection: "column", padding: "52px 24px 40px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--font-shippori), serif", fontSize: 11, fontWeight: 600, color: SOIL_GOLD, letterSpacing: 3 }}>
          記録帳
        </span>
        <div onClick={() => router.push("/")} style={{ width: 30, height: 30, borderRadius: 15, background: "rgba(239,232,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: PARCH_MUTED }}>✕</div>
      </div>
      <div style={{ fontFamily: "var(--font-shippori), serif", fontSize: 22, fontWeight: 600, color: PARCHMENT, letterSpacing: 2, marginBottom: 20 }}>
        投稿の記録
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: PARCH_MUTED, fontSize: 13 }}>
          読み込み中...
        </div>
      ) : (
        <>
          {/* 12-week heatmap */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: PARCH_MUTED, letterSpacing: 2 }}>この12週間</span>
              <span style={{ fontSize: 11, color: PARCH_MUTED }}>
                <span style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 16, color: PARCHMENT }}>{days12w}</span> 日記録
                <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
                通算 <span style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 16, color: PARCHMENT }}>{posts.length}</span> 篇
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", overflowX: "auto", paddingBottom: 4 }}>
              <Heatmap dates={posts.map(p => p.date)} today={today} weeks={12} cellSize={22} gap={4} showMonthLabels />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 9, color: PARCH_MUTED, letterSpacing: 1 }}>記録なし</span>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(239,232,212,0.09)" }} />
              <div style={{ width: 10, height: 10, borderRadius: 3, background: SOIL_LEAF }} />
              <span style={{ fontSize: 9, color: PARCH_MUTED, letterSpacing: 1 }}>記録あり</span>
            </div>
          </div>

          <div style={{ height: 1, background: SOIL_RULE, margin: "14px 0 18px" }} />

          {/* Post list */}
          {posts.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, paddingBottom: 40 }}>
              <SproutIcon size={40} color={PARCH_MUTED} />
              <div style={{ fontSize: 13, color: PARCH_MUTED, letterSpacing: 1 }}>まだ記録がありません</div>
              <div onClick={() => router.push("/")} style={{ fontSize: 13, color: SOIL_GOLD, cursor: "pointer", letterSpacing: 1 }}>
                ホームで最初の一歩を記録する →
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {posts.map(post => (
                <PostRow key={post.date} post={post} ogp={ogpMap[post.url] ?? null} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
