# note tree frontend

投稿継続をアバターの成長として可視化する note 継続サポートアプリのフロントエンドです。

## Stack

- Next.js App Router
- React
- TypeScript
- NextAuth
- Amazon Cognito
- AWS API Gateway / Lambda backend
- Web Push notifications

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill `.env.local` with values from your deployed backend, Cognito app client, and VAPID key pair.

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Environment Variables

| Name | Required | Scope | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Browser/server | API Gateway base URL, without a trailing slash. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Yes | Browser | Public VAPID key used for push notification subscription. |
| `NEXTAUTH_URL` | Yes | Server | App URL used by NextAuth. Use `http://localhost:3000` locally. |
| `NEXTAUTH_SECRET` | Yes | Server | Random secret for NextAuth session/JWT signing. Keep private. |
| `GUEST_JWT_SECRET` | Yes for guest mode | Server/backend | Secret used to sign guest JWTs. This must match the backend `GuestJwtSecret` / `GUEST_JWT_SECRET` value. |
| `COGNITO_CLIENT_ID` | Yes | Server | Amazon Cognito app client ID. |
| `COGNITO_CLIENT_SECRET` | Yes | Server | Amazon Cognito app client secret. Keep private. |
| `COGNITO_ISSUER` | Currently optional | Server | Cognito issuer URL. Present in local env for compatibility; the current credentials flow uses client ID/secret directly. |

## Security Notes

- Do not commit `.env.local`, `.env.production`, `.vercel`, or other generated secret files.
- `.env*` and `.vercel` are intentionally ignored by `.gitignore`.
- Values exposed with `NEXT_PUBLIC_` are bundled for the browser. Do not put private secrets in `NEXT_PUBLIC_*` variables.
- Keep `GUEST_JWT_SECRET` identical between the frontend host and the deployed Lambda backend, otherwise guest login will produce 401 responses from the API.
- If a secret was ever committed or shared, rotate it before making the repository public.
- The backend deployment config lives outside this frontend repository. If backend files are later published, sanitize files such as `samconfig.toml` and provide example config files instead of real secrets.

## Useful Commands

```bash
npm run dev
npm run lint
npm run build
npx tsc --noEmit
```
