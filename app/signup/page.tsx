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
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {/* パスワード条件 */}
          {password.length > 0 && (
            <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "3px" }}>
              {[
                { label: "8文字以上",          ok: password.length >= 8 },
                { label: "大文字を含む（A-Z）", ok: /[A-Z]/.test(password) },
                { label: "小文字を含む（a-z）", ok: /[a-z]/.test(password) },
                { label: "数字を含む（0-9）",   ok: /[0-9]/.test(password) },
                { label: "記号を含む（!@#$ など）", ok: /[^A-Za-z0-9]/.test(password) },
              ].map(({ label, ok }) => (
                <li key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: ok ? "#5a7a5a" : "#aaa" }}>
                  <span style={{ fontWeight: 700 }}>{ok ? "✓" : "○"}</span>
                  {label}
                </li>
              ))}
            </ul>
          )}
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
