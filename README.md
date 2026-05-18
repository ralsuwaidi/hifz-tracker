# Baqarah Hifz Tracker

Personal spaced-repetition tracker for memorising the 48 pages of Surah
Al-Baqarah. React + Supabase. No backend to host.

## Stack

- **Frontend**: Vite + React + TypeScript, deployed to Cloudflare Pages
- **Backend / DB**: Supabase (Postgres + Auth)
- **Auth**: Supabase magic-link, RLS-scoped per user
- **Cost**: $0/month on free tiers

## One-time setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql),
   run it. This creates `pages` and `daily_done` with RLS, plus a
   `seed_pages_for_current_user()` function.
3. In **Project Settings → API**, copy:
   - `Project URL` → goes into `VITE_SUPABASE_URL`
   - `anon` `public` key → goes into `VITE_SUPABASE_ANON_KEY`
4. In **Authentication → URL Configuration**, set:
   - **Site URL** to your deployed origin (e.g. `https://baqarah.pages.dev`)
   - Add `http://localhost:5173` to **Redirect URLs** for local dev

### 2. Local dev

```bash
cd frontend
cp .env.example .env.local        # paste your two Supabase values
npm install
npm run dev
```

Open <http://localhost:5173>, enter your email, click the magic link, you're in.
The first sign-in auto-seeds the 48 pages with your starting status grid.

### 3. Deploy to Cloudflare Pages

Connect this repo in the Cloudflare Pages dashboard, or push and run:

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=baqarah-track
```

Project settings on Cloudflare:

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `frontend`
- **Env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Then go back to Supabase → Auth → URL Configuration and add your `*.pages.dev`
domain to **Site URL** and **Redirect URLs**.

## Data model

Two tables, both scoped to `auth.uid()` via RLS:

- `pages(user_id, page_number 1-48, status, last_reviewed)` — the per-page
  state used by the session builder.
- `daily_done(user_id, done_date, page_number)` — one row per page ticked off
  today. The "done today" state on the UI is the set of rows where
  `done_date = current local date`. Old rows just stop matching when the date
  rolls — no cleanup needed.

Status values: `red` (Forgotten, 10×), `ram` (RAM, 4×), `trigger` (Trigger,
1×), `cold` (Cold Storage, 1×), `new` (Not Started). Session-building logic
lives client-side in [`frontend/src/lib/session.ts`](frontend/src/lib/session.ts).
