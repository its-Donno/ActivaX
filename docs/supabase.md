# Supabase setup

Activa runs without any external services by default, using a local
file-backed store. This guide covers enabling Supabase for authentication
(email and Google) and preparing Postgres persistence.

## How the integration is wired

- **Auth is integrated.** Sign-in and Google OAuth are handled by Supabase. On
  the `/auth/callback` redirect the app exchanges the code, upserts a matching
  profile in the app store, and issues its own signed session cookie.
- **Persistence is ready.** `supabase/migrations/0001_init.sql` defines the full
  Postgres schema, indexes, triggers, and Row Level Security policies. The
  server-side data layer currently reads and writes the local store; point it at
  Supabase (via `src/lib/data/*`) to use Postgres in production.

## 1. Create a project

Create a project at https://supabase.com and copy from **Project Settings → API**:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, optional)

Add them to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SESSION_SECRET=$(openssl rand -hex 32)
```

## 2. Apply the schema

The complete schema, indexes, triggers, and Row Level Security policies live in
`supabase/migrations/0001_init.sql`.

**Option A — Dashboard:** open **SQL Editor**, paste the file's contents, run.

**Option B — Supabase CLI:**

```bash
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

Applying the migration creates:

- `profiles`, `actions`, `action_participants`, `comments`, `likes`,
  `saved_items`, `follows`, `notifications`
- `conversations`, `conversation_members`, `messages`
- `projects`, `project_members` (optional collaboration tables)
- `avatars` and `media` storage buckets with owner-scoped write policies
- a trigger that creates a `profiles` row whenever a user signs up

## 3. Configure authentication

In **Authentication → Providers**, enable **Email** (and **Google** if you want
social login). For Google, add the OAuth client ID/secret and set the redirect
URL to:

```
https://YOUR-PROJECT.supabase.co/auth/v1/callback
```

The app exchanges the auth code at `/auth/callback`.

## 4. Row Level Security

RLS is enabled on every table. Key rules:

- Profiles are publicly readable; users update only their own row.
- Actions are publicly readable; only the author can edit or delete them.
- Likes, saved items, and follows are writable only by the signed-in user.
- Notifications are visible only to their recipient.
- Conversations and messages are restricted to conversation members via the
  `is_conversation_member()` helper.
- Storage uploads are restricted to a folder named after the user's id.

## 5. Verify

Restart the dev server and sign in with Google (or email). The callback creates
a matching profile and session; a `profiles` row is created automatically by the
database trigger for Supabase-side identity.

```bash
npm run dev
```
