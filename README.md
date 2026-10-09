# Video Speed Reader

> 上傳影片，三分鐘內拿到逐字稿。
> Upload your video, get a clean transcript in three minutes.

SaaS landing page + authenticated app shell (Milestone 1). Built with Vite + React + TypeScript + Tailwind CSS v4, with Supabase Auth (email + password).

## Routes

| Path      | Access          | Description                                         |
| --------- | --------------- | --------------------------------------------------- |
| `/`       | Public          | Landing page: hero, 3 feature cards, footer         |
| `/signup` | Guests only     | Email + password sign-up                            |
| `/signin` | Guests only     | Email + password sign-in                            |
| `/app`    | Signed-in only  | "Hi {email}" + placeholder dashboard, Sign out      |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL + publishable key
npm run dev
```

## Supabase

- Auth only — uses Supabase's built-in `auth.users`. **No custom tables** in this milestone.
- Email confirmation is expected to be **off** for v1 (Authentication → Sign In / Providers → Email → *Confirm email*). If it's on, sign-up shows a "check your inbox" message instead of signing in directly.
- Any future schema change goes in `supabase/migrations/` as a timestamped migration file — never ad-hoc SQL in the dashboard.
- Only the **publishable** key (`sb_publishable_…`) belongs in `VITE_*` env vars. Never the secret / service_role key.

## Project conventions

- React component files: `PascalCase.tsx`
- Hooks / utils: `camelCase.ts`
- No real emails or names in code or fixtures — use `user@example.com`

## Out of scope (later milestones)

Video upload, transcript display, payments, `profiles` / `videos` tables.

## Deploying (later)

`vercel.json` already contains the SPA rewrite. On Vercel, set the framework preset to **Vite** and add `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables.
