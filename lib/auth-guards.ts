import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { hasAppAccess } from "@/lib/volunteer-access"

export type SessionUser = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"]

export function isAdmin(user: Pick<SessionUser, "role"> | null | undefined) {
	return user?.role === "ADMIN"
}

type GuardResult = { user: SessionUser; response?: never } | { user?: never; response: NextResponse }

/**
 * Returns 401 when signed out, and 403 when `admin` is required but missing or the
 * volunteer's application is not approved.
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

	if (!(await hasAppAccess(session.user))) {
		return {
			response: NextResponse.json(
				{ success: false, error: "Your volunteer application has not been approved yet." },
				{ status: 403 },
			),
		}
	}

	return { user: session.user }
}

/** A `userId` sent by the client must belong to the signed-in user. */
export function forbidOtherUser(user: SessionUser, userId: string | undefined) {
	if (userId && userId !== user.id) {
		return NextResponse.json(
			{ success: false, error: "You can only access your own notifications." },
			{ status: 403 },
		)
	}
}

export function invalidRequest(error: z.ZodError, message = "Check the highlighted fields.") {
	return NextResponse.json(
		{ success: false, error: message, fieldErrors: z.flattenError(error).fieldErrors },
		{ status: 400 },
	)
}

/** Empty or malformed bodies are treated as `{}`. */
export async function readJsonBody(request: Request): Promise<unknown> {
	try {
		return await request.json()
	} catch {
		return {}
	}
}
