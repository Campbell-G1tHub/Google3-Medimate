This is our group repository for Google3 IT Project working on: Medimate for Medical Pantry 

# Development Tips:
- Branches are cheap, merge conflicts are not - separate logical features into individual branches (i.e feat/add-new-auth-method)
- When on a feature branch, frequently **rebase** with main (rather than merge to ensure clean git history). 
Example
```
git switch main
git pull
git switch feat/add-new-auth-method
git rebase origin/main
git push --force-with-lease
```
The force flag is incredibly important as it ensures your commits remain contiguous rather than fragmented and mixed with commits from main.

- Try follow these [standards](https://www.conventionalcommits.org/en/v1.0.0/) standards for commits 
Example
```
git commit -m "feat: add new authentication method"
git commit -m "fix: fix stale closure bug in dashboard"
git commit -m "chore: Removed dead code"
git commit -m "refactor: Simplified backend logic for changing membership"
```

- Formatting is already handled using Biome. Any code committed will be formatted automatically.

# Local Development With Docker

## Prerequisites

- Docker with Compose v2 (`docker compose version`)

## Setup

```bash
cp .env.example .env      # required for host-side Prisma tooling (studio/migrate)
docker compose up --build -d
```

- App: http://localhost:3000
- Postgres: `localhost:5432`
- Mailpit inbox: http://localhost:8025

The `app` service waits for the database healthcheck, then runs
`prisma migrate deploy` (applies `prisma/migrations/`) before starting
`next dev`.

## Credentials

Defaults (overridable by editing values in `.env`):

| Variable          | Default   |
| ----------------- | --------- |
| `POSTGRES_USER`   | `medimate`|
| `POSTGRES_PASSWORD` | `medimate`|
| `POSTGRES_DB`     | `medimate`|
| `DATABASE_URL` (host) | `postgresql://medimate:medimate@localhost:5432/medimate`|

Inside the container the app uses `DATABASE_URL=postgresql://…@db:5432/…`
(`db` is the compose service name), set in `compose.yaml`.

## Useful commands

```bash
pnpm run db:generate # regenerate prisma client to use in application code 
pnpm run db:migrate # Apply migrations to your local DB
docker compose logs -f app        # follow app logs
docker compose ps                 # status / health
docker compose up db # run database only
docker compose exec db psql -U medimate -d medimate   # psql shell
docker compose down               # stop 
```

## Prisma

- Edit models in `schema.prisma`, then create a migration with
  `prisma migrate dev --name <name>` (or `db:migrate` in package.json).
- The Prisma client is generated into `lib/generated/prisma` by
  `prisma generate` — it runs automatically on install (postinstall).
- Host-side tooling (e.g. `prisma studio`) uses the `DATABASE_URL` in `.env`
  and talks to the compose db on `localhost:5432`.

# Authentication

Authentication uses Better Auth with the existing Prisma client. Copy the Better Auth and SMTP
variables from `.env.example` into `.env`, then replace the example secret and mail server values.

Generate a development secret with:

```bash
openssl rand -base64 32
```

The auth API is available at `/api/auth/*`. Client Components can use the exports from
`lib/auth-client.ts`:

```tsx
"use client"

import { signIn, signOut, signUp, useSession } from "@/lib/auth-client"
```

Email/password sign-up requires email verification. The verification link is sent through the SMTP
server configured by `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASSWORD`.

For local development, Docker Compose starts Mailpit and routes authentication emails to its inbox.
After all services are running, execute the complete sign-up and session smoke test with:

```bash
pnpm test:auth
```

The test covers sign-up, blocked login before verification, an incorrect password, an expired email
verification link, successful email verification, login, session retrieval, logout, and session
revocation.
