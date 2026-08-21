# Dev-stage image for `docker compose up` — hot reload via bind mount.
# node:22-alpine matches the local runtime; pnpm comes via corepack and is
# pinned by the `packageManager` field in package.json (pnpm@11.3.0).
FROM node:22-alpine

# Prisma needs OpenSSL at runtime on alpine.
RUN apk add --no-cache openssl

# Husky would fail during install without a .git dir (not part of the
# container build context), so skip it here.
ENV HUSKY=0

# Activate the pnpm version pinned in package.json.
RUN corepack enable

WORKDIR /app

# Install dependencies first (better layer caching). `prisma generate` runs
# via the postinstall script and only needs the schema + config, so those are
# copied before `pnpm install`.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile

# Remaining sources. At runtime compose bind-mounts the repo over /app for
# hot reload; this COPY keeps the image self-contained for plain `docker run`.
COPY . .

EXPOSE 3000

# compose.yaml overrides the command to apply migrations before starting.
CMD ["pnpm", "dev"]
