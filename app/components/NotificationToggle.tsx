"use client";

import { useEffect, useState } from "react";
import { subscribePush, unsubscribePush, isPushSubscribed } from "../lib/push";

type Props = {
  accessToken: string;
};

export function NotificationToggle({ accessToken }: Props) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);

    if (Notification.permission === "denied") {
      setDenied(true);
      return;
    }

    isPushSubscribed().then(setSubscribed);
  }, []);

  // 非対応ブラウザは何も表示しない
  if (!supported) return null;

  async function handleToggle() {
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribePush();
        setSubscribed(false);
      } else {
        if (Notification.permission === "denied") {
          setDenied(true);
          return;
        }
        const ok = await subscribePush(accessToken);
        if (ok) {
          setSubscribed(true);
        } else if (Notification.permission === "denied") {
          setDenied(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  if (denied) {
    return (
      <p className="text-xs text-gray-400 text-center">
        🔕 通知はブラウザ設定からONにできます
      </p>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-500 transition-colors disabled:opacity-50"
    >
      <span>{subscribed ? "🔔" : "🔕"}</span>
      <span>{subscribed ? "通知ON（夜8時にリマインド）" : "通知をONにする"}</span>
    </button>
  );
}
