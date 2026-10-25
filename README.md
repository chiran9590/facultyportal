# Faculty Development Portal

React + TypeScript + Vite front end on Supabase (PostgreSQL, Auth, Realtime).
Three roles: Faculty (log activities), HoD (review their department), Admin (manage people and departments).
Access rules live in the database as Row Level Security, not only in the UI.

## Run it in Windsurf

1. Unzip, then File > Open Folder and pick `faculty-portal`.
2. Open a terminal (Ctrl + `) and run:

```bash
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env
```

3. Create a free project at https://supabase.com, then:
   - SQL Editor: paste `supabase/schema.sql` and run it.
   - SQL Editor: paste `supabase/seed.sql` and run it (adds sample departments).
   - Project Settings > API: copy the Project URL and anon public key into `.env`.
   - Authentication > Providers > Email: turn off "Confirm email" while developing.

4. Start the app:

```bash
npm run dev
```

Open http://localhost:5173

## Make your first Admin and HoD

Sign up in the app, then run in the Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Sign in again. From the Admin screen you can promote other users to HoD and assign departments.
Sign up a second account to see the Faculty view; open two browser windows to watch Realtime updates
(submit as faculty, the HoD list updates instantly; approve, and the faculty status badge flips).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build into `dist/` |

## Deploy (Vercel)

Import the repo, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, framework preset Vite.
Add a `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }` so client routes work.
Add your deployed URL under Supabase > Authentication > URL Configuration.

## Structure

```
supabase/schema.sql      tables, enums, RLS policies, triggers, realtime publication
src/types/database.ts    typed Database definition used by createClient<Database>
src/context/AuthContext  session + profile, live role updates
src/hooks/               useActivities / useProfiles with Realtime subscriptions
src/pages/               Login, FacultyDashboard, HodDashboard, AdminDashboard
```
