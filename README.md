# Video Speed Reader

> 上傳影片，三分鐘內拿到逐字稿。
> Upload your video, get a clean transcript in three minutes.

SaaS landing page + Supabase email auth (M0), now on **Next.js 16 (App Router)** + Tailwind CSS v4 + `@supabase/ssr` as the base for M1 (AI video transcript).

## Routes

| Path       | Access          | Description                                         |
| ---------- | --------------- | --------------------------------------------------- |
| `/`        | Public          | Landing page: hero, 3 feature cards, footer         |
| `/sign-up` | Guests only     | Email + password sign-up                            |
| `/sign-in` | Guests only     | Email + password sign-in                            |
| `/app`     | Signed-in only  | "Hi {email}" + placeholder dashboard, Sign out      |

`/signin` and `/signup` (the old Vite routes) permanently redirect to the new names.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in from Supabase, or from AWS Secrets Manager (us-east-1)
npm run dev                  # http://localhost:3000
```

## Environment variables

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser + server | `sb_publishable_…`, RLS-gated |
| `SUPABASE_SECRET_KEY` | **server only** | `sb_secret_…`, bypasses RLS — never `NEXT_PUBLIC_`, never in a Client Component |

Vercel has all three (the secret key only for Production + Preview, marked Sensitive). Vercel snapshots env vars at build time — redeploy after changing them.

## Project layout

- `app/` — Next.js routes (`layout.tsx`, `page.tsx`, `sign-in/`, `sign-up/`, `app/`)
- `src/components/` — UI components (`PascalCase.tsx`)
- `src/lib/supabase/client.ts` / `server.ts` — browser / server Supabase clients (`@/lib/...` alias → `src/`)
- `middleware.ts` — refreshes the Supabase session cookie on every request
- `supabase/migrations/` — every schema change as a timestamped migration (never ad-hoc SQL)
- `.claude/skills/` — course skills (M0/M1 walkthroughs, checklists, AWS / Supabase / Whisper rules)

## Supabase

- Email confirmation is **off** (Authentication → Sign In / Providers → Confirm email).
- Any schema change goes in `supabase/migrations/` as a timestamped migration file.

## Conventions

- React component files: `PascalCase.tsx`; hooks / utils: `camelCase.ts`
- No real emails or names in code or fixtures — use `user@example.com`
- Secrets live in AWS Secrets Manager / Vercel env, never in git
