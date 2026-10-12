# Playwright test runner. Run with: docker compose --profile test run --rm playwright
# Debian rather than alpine because Playwright's browsers need glibc.
FROM node:22-bookworm-slim

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

ENV HUSKY=0
ENV CI=true

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile

# Installs the Chromium build matching the locked @playwright/test version.
RUN pnpm exec playwright install --with-deps chromium

COPY . .

CMD ["pnpm", "exec", "playwright", "test"]
