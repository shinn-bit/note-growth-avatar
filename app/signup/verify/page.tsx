"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "../../styles/auth.module.css";

function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. 認証コード確認
    const res = await fetch("/api/cognito/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "認証に失敗しました");
      return;
    }

    // 2. 確認後そのままサインイン → ホームへ
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("認証は完了しました。ログイン画面からログインしてください。");
    } else {
      router.push("/");
    }
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      {error && <p className={styles.error}>{error}</p>}

      <p className={styles.hint}>
        <strong>{email}</strong> に6桁の認証コードを送りました。
        <br />
        メールをご確認ください。
      </p>

      <div className={styles.formGroup}>
        <label className={styles.label}>認証コード</label>
        <input
          className={`${styles.input} ${styles.codeInput}`}
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>パスワード（確認のため再入力）</label>
        <input
          className={styles.input}
          type="password"
          placeholder="登録したパスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button className={styles.button} type="submit" disabled={loading || code.length !== 6}>
        {loading ? "確認中..." : "認証してはじめる"}
      </button>
    </form>
  );
}

export default function VerifyPage() {
  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <span className={styles.avatar}>📩</span>
        <h1 className={styles.title}>メール認証</h1>
        <p className={styles.subtitle}>届いたコードを入力してください</p>
      </div>

      <Suspense fallback={<div className={styles.card}>読み込み中...</div>}>
        <VerifyForm />
      </Suspense>
    </main>
  );
}
