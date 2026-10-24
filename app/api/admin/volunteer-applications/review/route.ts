import { NextResponse } from "next/server"
import { invalidRequest, readJsonBody, requireApiUser } from "@/lib/auth-guards"
import { reviewApplication } from "@/lib/volunteer-applications"
import { reviewApplicationSchema } from "@/lib/validation/volunteer-application"

export async function POST(request: Request) {
	const { user, response } = await requireApiUser(request, { admin: true })
	if (response) {
		return response
	}

	const parsed = reviewApplicationSchema.safeParse(await readJsonBody(request))
	if (!parsed.success) {
		return invalidRequest(parsed.error)
	}

	const result = await reviewApplication(user.id, parsed.data.applicationId, parsed.data.decision)

	if (result.outcome === "not_found") {
		return NextResponse.json(
			{ success: false, error: "That application could not be found." },
			{ status: 404 },
		)
	}

	if (result.outcome === "already_reviewed") {
		return NextResponse.json(
			{
				success: false,
				error: `This application has already been ${result.status.toLowerCase()}.`,
				status: result.status,
			},
			{ status: 409 },
		)
	}

	return NextResponse.json({ success: true, status: result.status })
}
