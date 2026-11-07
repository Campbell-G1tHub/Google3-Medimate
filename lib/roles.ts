/**
 * Client-safe role helpers. Kept free of server imports (`next/server`, `zod`, `@/lib/auth`)
 * so Client Components can use them without dragging the Prisma-backed auth module into the
 * browser bundle. Server-only guards live in `lib/auth-guards.ts`.
 */

export type RoleHolder = { role?: string | null }

export function isAdmin(user: RoleHolder | null | undefined) {
	return user?.role === "ADMIN"
}
