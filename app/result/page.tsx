"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LastMessage = {
  message: string;
  isMilestone: boolean;
  alreadySubmitted: boolean;
};

export default function ResultPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<LastMessage | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("note_avatar_last_message");
    if (raw) {
      setMsg(JSON.parse(raw));
    } else {
      router.replace("/");
    }
  }, [router]);

  if (!msg) return null;

  const bgColor = msg.isMilestone
    ? "bg-yellow-50"
    : msg.alreadySubmitted
    ? "bg-[#f5f0eb]"
    : "bg-green-50";

  const icon = msg.isMilestone ? "🎉" : msg.alreadySubmitted ? "✅" : "📝";

  return (
    <main className={`flex flex-col items-center justify-center min-h-screen ${bgColor} px-4 gap-8`}>
      <span className="text-7xl">{icon}</span>

      <p className="text-xl font-bold text-gray-800 text-center">{msg.message}</p>

      {msg.isMilestone && (
        <p className="text-sm text-yellow-600 font-medium">マイルストーン達成！</p>
      )}

      <button
        onClick={() => router.push("/")}
        className="w-full max-w-xs bg-[#5a7a5a] hover:bg-[#4a6a4a] text-white font-bold py-4 rounded-xl text-lg transition-colors"
      >
        ホームに戻る
      </button>
    </main>
  );
}
