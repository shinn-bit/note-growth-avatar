"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../styles/auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
    } else {
      router.push("/");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <img src="/icons/favicon.ico" alt="icon" className={styles.avatar} />
        <h1 className={styles.title}>ちょんまげマッチョ</h1>
        <p className={styles.subtitle}>ログインして続きから始めよう</p>
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
          />
        </div>

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <p className={styles.footer}>
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className={styles.link}>
          新規登録
        </Link>
      </p>
    </main>
  );
}
