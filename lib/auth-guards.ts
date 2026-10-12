import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export type SessionUser = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"]

export function isAdmin(user: Pick<SessionUser, "role"> | null | undefined) {
	return user?.role === "ADMIN"
}

type GuardResult = { user: SessionUser; response?: never } | { user?: never; response: NextResponse }

/**
 * Resolves the signed-in user for an API route handler. Returns a ready-made JSON
 * error response instead when the caller is signed out (401) or, with `admin`, is
 * not a Medical Pantry staff member (403).
 */
export async function requireApiUser(
	request: Request,
	{ admin = false }: { admin?: boolean } = {},
): Promise<GuardResult> {
	const session = await auth.api.getSession({ headers: request.headers })

	if (!session) {
		return {
			response: NextResponse.json(
				{ success: false, error: "You need to sign in to do that." },
				{ status: 401 },
			),
		}
	}

	if (admin && !isAdmin(session.user)) {
		return {
			response: NextResponse.json(
				{ success: false, error: "Only admins can do that." },
				{ status: 403 },
			),
		}
	}

	return { user: session.user }
}

/** Reads a JSON body, treating an empty or malformed body as `{}`. */
export async function readJsonBody(request: Request): Promise<unknown> {
	try {
		return await request.json()
	} catch {
		return {}
	}
}
