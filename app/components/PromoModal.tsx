"use client";

import { useEffect, useState } from "react";
import { subscribePush, isPushSubscribed } from "../lib/push";

type Platform = "ios" | "other";

type Props = {
  accessToken: string;
};

export function PromoModal({ accessToken }: Props) {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    const isStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isIOS) {
      if (isStandalone) return;
      if (localStorage.getItem("note_ios_promo_dismissed")) return;
      setPlatform("ios");
      setVisible(true);
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (localStorage.getItem("note_noti_promo_dismissed")) return;

    isPushSubscribed().then((subscribed) => {
      if (!subscribed) {
        setPlatform("other");
        setVisible(true);
      }
    });
  }, []);

  function dismiss() {
    const key = platform === "ios" ? "note_ios_promo_dismissed" : "note_noti_promo_dismissed";
    localStorage.setItem(key, "1");
    setVisible(false);
  }

  async function handleEnableNotification() {
    await subscribePush(accessToken);
    localStorage.setItem("note_noti_promo_dismissed", "1");
    setVisible(false);
  }

  if (!visible || !platform) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-6">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-sm font-bold text-gray-700">
            {platform === "ios" ? "ホーム画面に追加しよう" : "投稿リマインドを受け取ろう"}
          </p>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none pb-1"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* 非iOS: 動画 */}
        {platform === "other" && (
          <video
            src="/demo/notification.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-h-72 object-contain bg-[#0f172a]"
          />
        )}

        {/* iOS: 画像（後で差し替え） */}
        {platform === "ios" && (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            {/* iOS用画像をここに追加予定 */}
          </div>
        )}

        {/* CTA */}
        <div className="px-4 pb-5 pt-3 flex flex-col gap-2">
          {platform === "other" && (
            <button
              onClick={handleEnableNotification}
              className="w-full bg-[#5a7a5a] hover:bg-[#4a6a4a] text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              🔔 通知をONにする
            </button>
          )}
          <button
            onClick={dismiss}
            className="text-xs text-gray-400 hover:text-gray-500 text-center py-1"
          >
            今はしない
          </button>
        </div>
      </div>
    </div>
  );
}
