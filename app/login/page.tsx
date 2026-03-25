"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 gap-8">
      <div className="text-center">
        <div className="text-6xl mb-4">🥚</div>
        <h1 className="text-2xl font-bold text-gray-800">note継続アプリ</h1>
        <p className="text-gray-500 mt-2 text-sm">
          投稿するたびに自分の分身が成長する
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <button
          onClick={() => signIn("cognito", { callbackUrl: "/" })}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl text-center text-lg transition-colors"
        >
          ログイン / 新規登録
        </button>
        <p className="text-xs text-gray-400 text-center">
          メールアドレスで登録できます
        </p>
      </div>
    </main>
  );
}
