# Postgres 17 image for local development.
# Thin wrapper around the official image: init scripts placed in
# /docker-entrypoint-initdb.d/ run automatically on first boot (empty data dir).
FROM postgres:17-alpine

COPY docker/postgres/init/01-init.sql /docker-entrypoint-initdb.d/01-init.sql
