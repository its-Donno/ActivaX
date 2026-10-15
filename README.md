# Activa

**Turn ideas into action.** Activa is a responsive social platform where people
discover and create real-world actions — asking for help, trying something new,
joining a group, offering help, sharing resources, or starting a project — then
join in, comment, follow, and message each other.

## Highlights

- **Action-driven feed** — six action types (`ask`, `try`, `join`, `help`,
  `share`, `project`), each with its own call-to-action and participation role.
- **Discover** — search and filter by category, tag, and skill; trending and
  recommended sections; suggested people with mutual connections.
- **Participate** — join/leave actions with participant limits, like, save,
  comment, and share.
- **People** — profiles with interests, skills offered/wanted, follow/unfollow,
  follower stats, and activity.
- **Messaging** — 1:1 conversations with member-only access.
- **Notifications** — activity feed for follows, likes, comments, and joins.
- **Auth** — email/password with hashed credentials and signed session cookies;
  Google sign-in via Supabase when configured.
- **Responsive** — desktop sidebar + right rail, mobile bottom navigation and
  sheets.

## Tech stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** and **shadcn/ui**
- **Zod** for validation, **react-hook-form**
- **Supabase** (Auth + Postgres + Storage) — optional
- **Local file-backed store** — zero-config default for development

## Getting started

```bash
npm install
cp .env.example .env.local   # optional; the app runs without it
npm run dev
```

Open http://localhost:3000 and sign in with the demo account:

```
email:    rojin@activa.app
password: password123
```

### How data works

Activa runs in one of two modes:

1. **Local mode (default).** With no Supabase credentials, data is persisted to
   a JSON file at `.data/activa.json` (gitignored). The store seeds itself with
   demo profiles, actions, comments, follows, notifications, and conversations
   on first run. Delete the file to reset to the seed state.

2. **Supabase mode.** Set the environment variables below and apply the schema
   in `supabase/migrations/0001_init.sql` (see `docs/supabase.md`). Email and
   Google sign-in are then handled by Supabase Auth, and the full Postgres
   schema with Row Level Security ships ready for moving persistence off the
   local store.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase mode | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase mode | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Server-only key for admin tasks |
| `SESSION_SECRET` | recommended | Signs local session cookies |

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run start      # run the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Project structure

```
src/
  app/
    (auth)/            login, signup, forgot-password
    (app)/             authenticated shell: home, explore, actions, create,
                       activity, messages, saved, profile, u/[username]
    auth/callback/     Supabase OAuth / email code exchange
  components/
    action/ create/ feed/ layout/ messages/ notifications/ profile/ common/ ui/
  lib/
    actions/           server actions (mutations)
    auth/              password hashing + session cookies
    data/              server-side data access
    store/             local file-backed store + seed data
    supabase/          browser + server clients
    constants.ts types.ts validation.ts format.ts env.ts
supabase/migrations/    SQL schema, RLS policies, and storage buckets
```

## Security notes

- Passwords are hashed with `scrypt` (salted) in local mode.
- Sessions are HMAC-signed, `httpOnly` cookies; verify with `SESSION_SECRET`.
- Supabase mode enables **Row Level Security** on every table, including
  conversation membership checks, so users can only read/write their own data.
- Server Actions verify the session (`requireUser`) before mutating data.

## License

MIT
