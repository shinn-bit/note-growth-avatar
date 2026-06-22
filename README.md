# note tree 🌱

**継続を、成長に変える** — noteの投稿継続をアバターの成長として可視化する、創作モチベーション支援Webアプリです。

---

## スクリーンショット

<div align="center">
  <img src="docs/screenshots/splash.png" width="220" alt="スプラッシュ画面" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/home.png" width="220" alt="ホーム画面（アバター成長）" />
</div>

> 左：スプラッシュ画面　右：アバター成長ホーム画面（STREAK 7日、次のステージまであと1回）

---

## アプリ概要

noteに記事を投稿するたびに、アプリ内の植物アバターが成長します。  
継続を「木を育てる体験」として可視化することで、「もう1記事書きたい」という気持ちを自然に引き出します。

| ステージ | 状態 |
|----------|------|
| 🌰 種 | 何も始まっていない |
| 🌱 発芽 | ようやく芽が出た |
| 🍃 若葉 | 安定して育ち始めた |
| 🌸 小さな植物 | 青い花が咲いてきた |
| 🌳 小さな木 | 資産感が出てきた |
| 🌲 大樹（藤） | 藤の大樹になった！ |

投稿をさぼると植物がダメージを受け、逆に続けるほど健康的に育ちます。

---

## 主な機能

- **アバター成長の可視化** — 6ステージ × 正常/ダメージの12種類の植物画像
- **ストリーク管理** — 連続投稿日数のカウントと次のレベルまでの進捗表示
- **コース設定** — 1ヶ月 / 3ヶ月コース・投稿頻度を自由に設定
- **OGPプレビュー** — note URLを貼るだけで記事サムネイルと題名を自動取得
- **投稿履歴** — 過去の投稿をカード形式で振り返り
- **Webプッシュ通知** — 投稿忘れを防ぐリマインダー通知
- **SNSシェア** — 成長状況を画像付きでシェア
- **ゲストモード** — アカウント登録なしで試用可能

---

## 技術スタック

| カテゴリ | 使用技術 |
|----------|---------|
| フロントエンド | Next.js 16 (App Router) / React 19 / TypeScript |
| スタイリング | Tailwind CSS v4 / CSS Modules |
| 認証 | NextAuth v4 + Amazon Cognito |
| バックエンド | AWS API Gateway + AWS Lambda（サーバーレス） |
| 通知 | Web Push API（VAPID） |
| ホスティング | Vercel |

---

## セットアップ

### 依存パッケージのインストール

```bash
npm install
```

### 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` に以下の値を設定してください：

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_API_URL` | ✅ | API Gateway のベース URL（末尾スラッシュなし） |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ✅ | Web Push 用 VAPID 公開鍵 |
| `NEXTAUTH_URL` | ✅ | アプリの URL（ローカルは `http://localhost:3000`） |
| `NEXTAUTH_SECRET` | ✅ | NextAuth のセッション署名用シークレット |
| `GUEST_JWT_SECRET` | ゲストモード使用時 | ゲスト JWT 署名用シークレット（バックエンドと同一値） |
| `COGNITO_CLIENT_ID` | ✅ | Amazon Cognito アプリクライアント ID |
| `COGNITO_CLIENT_SECRET` | ✅ | Amazon Cognito アプリクライアントシークレット |

### 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

---

## 便利なコマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run lint     # ESLint
npx tsc --noEmit # 型チェック
```

---

## セキュリティ

- `.env.local` / `.env.production` / `.vercel` はコミットしないでください（`.gitignore` で除外済み）
- `NEXT_PUBLIC_` プレフィックスの変数はブラウザにバンドルされます。プライベートなシークレットは設定しないでください
- `GUEST_JWT_SECRET` はフロントエンドとバックエンドで同一の値にしてください
- シークレットを誤ってコミットした場合は、リポジトリを公開する前に必ずローテーションしてください

---

## English README

👉 [README\_EN.md](./README_EN.md)

---

## ライセンス

MIT
