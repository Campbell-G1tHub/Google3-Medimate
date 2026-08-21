-- Runs once on first boot of a fresh Postgres data directory
-- (see /docker-entrypoint-initdb.d/ in the postgres image).
--
-- The application schema itself is managed by Prisma migrations
-- (prisma/migrations) and is applied on container start, so nothing
-- schema-related lives here. This file only enables useful extensions.

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- provides gen_random_uuid()
