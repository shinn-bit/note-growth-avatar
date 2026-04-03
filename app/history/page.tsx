"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

async function fetchOgp(url: string): Promise<OgpData> {
  try {
    const res = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
    if (res.ok) return await res.json();
  } catch {}
  return { title: "", image: "" };
}

function PostCard({ post, ogp }: { post: Post; ogp: OgpData | null }) {
  const dateLabel = post.date.replace(/-/g, "/");

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* サムネイル */}
      <div className="w-full h-36 bg-gray-100 overflow-hidden">
        {ogp?.image ? (
          <img
            src={ogp.image}
            alt={ogp.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🌱
          </div>
        )}
      </div>

      {/* テキスト */}
      <div className="p-3 flex flex-col gap-1">
        <p className="text-xs text-gray-400">{dateLabel}</p>
        <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
          {ogp?.title || "タイトルを取得中..."}
        </p>
        <span className="text-xs text-indigo-400 mt-1">noteで見る →</span>
      </div>
    </a>
  );
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [ogpMap, setOgpMap] = useState<Record<string, OgpData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/history`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setPosts(data.posts ?? []);

        // OGPを並列取得
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
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-10 gap-6">
      {/* Header */}
      <div className="w-full max-w-xs flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">投稿履歴</h1>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← ホーム
        </Link>
      </div>

      {/* 合計 */}
      <div className="w-full max-w-xs bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center gap-3">
        <span className="text-3xl">🌳</span>
        <div>
          <p className="text-2xl font-bold text-gray-800">{posts.length}</p>
          <p className="text-xs text-gray-500">合計投稿数</p>
        </div>
      </div>

      {/* 投稿リスト */}
      {posts.length === 0 ? (
        <div className="w-full max-w-xs text-center py-16">
          <p className="text-5xl mb-4">🌱</p>
          <p className="text-gray-500 text-sm">まだ投稿がありません</p>
          <Link
            href="/submit"
            className="mt-4 inline-block text-sm text-indigo-500 font-medium"
          >
            最初の投稿を記録する →
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-xs flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.date}
              post={post}
              ogp={ogpMap[post.url] ?? null}
            />
          ))}
        </div>
      )}
    </main>
  );
}
