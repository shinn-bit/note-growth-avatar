"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../styles/auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/cognito/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "登録に失敗しました");
    } else {
      // メール確認画面へ、emailをクエリで渡す
      router.push(`/signup/verify?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <img src="/icons/favicon.ico" alt="icon" className={styles.avatar} />
        <h1 className={styles.title}>新規登録</h1>
        <p className={styles.subtitle}>アカウントを作成してアバターを育てよう</p>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.formGroup}>
          <label className={styles.label}>メールアドレス</label>
          <input
            className={styles.input}
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>パスワード</label>
          <input
            className={styles.input}
            type="password"
            placeholder="8文字以上"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "登録中..." : "登録する"}
        </button>
      </form>

      <p className={styles.footer}>
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className={styles.link}>
          ログイン
        </Link>
      </p>
    </main>
  );
}
