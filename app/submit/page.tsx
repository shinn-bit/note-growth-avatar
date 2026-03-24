"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "../lib/deviceId";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SubmitPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!url.includes("note.com")) {
      setError("note.com の URL を入力してください");
      return;
    }

    setLoading(true);

    try {
      const deviceId = getDeviceId();
      const res = await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        return;
      }

      // 状態をローカルに保存してホームへ
      localStorage.setItem("note_avatar_state", JSON.stringify(data.state));
      localStorage.setItem("note_avatar_last_message", JSON.stringify({
        message: data.message,
        isMilestone: data.isMilestone,
        alreadySubmitted: data.alreadySubmitted ?? false,
      }));

      router.push("/result");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-12 gap-8">
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
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-bold py-4 rounded-xl text-lg transition-colors"
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
