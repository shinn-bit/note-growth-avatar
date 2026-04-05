"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type OgpData = { title: string; image: string };

export default function SubmitPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ogp, setOgp] = useState<OgpData | null>(null);
  const [ogpLoading, setOgpLoading] = useState(false);

  // OGP 自動取得（note.com URL が入力されたら debounce で取得）
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

    return () => {
      clearTimeout(timer);
      setOgpLoading(false);
    };
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

      // 進化演出のために投稿前の状態を読み出す
      let prevFormStage = 0;
      let prevAvatarLevel = 0;
      const prevRaw = localStorage.getItem("note_avatar_prev_state");
      if (prevRaw) {
        try {
          const prev = JSON.parse(prevRaw);
          prevFormStage  = prev.formStage  ?? 0;
          prevAvatarLevel = prev.avatarLevel ?? 0;
        } catch {}
        // ここでは削除しない（ホーム画面のゲージアニメーションに使う）
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
    <main className="flex flex-col items-center min-h-screen bg-[#f5f0eb] px-4 py-12 gap-8">
      <h1 className="text-2xl font-bold text-gray-800">今日の投稿を記録</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            note の記事 URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://note.com/..."
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8aaa8a]"
          />
        </div>

        {/* OGP プレビュー */}
        {ogpLoading && (
          <div className="w-full rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-400 animate-pulse">
            記事を取得中...
          </div>
        )}
        {!ogpLoading && ogp && (
          <div className="w-full rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm flex gap-3 items-center p-3">
            {ogp.image && (
              <img
                src={ogp.image}
                alt="OGP"
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <p className="text-sm text-gray-700 font-medium line-clamp-3 leading-snug">
              {ogp.title || "（タイトルなし）"}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5a7a5a] hover:bg-[#4a6a4a] disabled:bg-[#8aaa8a] text-white font-bold py-4 rounded-xl text-lg transition-colors"
        >
          {loading ? "送信中..." : "記録する"}
        </button>
      </form>

      <button
        onClick={() => router.back()}
        className="text-sm text-gray-400 hover:text-gray-600"
      >
        戻る
      </button>
    </main>
  );
}
