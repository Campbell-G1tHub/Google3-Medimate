import { NextResponse } from "next/server"
import { invalidRequest, readJsonBody, requireApiUser } from "@/lib/auth-guards"
import { createOpportunity, listCreatedOpportunities } from "@/lib/opportunities"
import { createOpportunitySchema } from "@/lib/validation/opportunity"

/** Opportunities created by the signed-in admin. */
export async function GET(request: Request) {
	const { user, response } = await requireApiUser(request, { admin: true })
	if (response) {
		return response
	}

	return NextResponse.json({
		success: true,
		opportunities: await listCreatedOpportunities(user.id),
	})
}

export async function POST(request: Request) {
	const { user, response } = await requireApiUser(request, { admin: true })
	if (response) {
		return response
	}

	const parsed = createOpportunitySchema.safeParse(await readJsonBody(request))
	if (!parsed.success) {
		return invalidRequest(parsed.error)
	}

	return NextResponse.json(
		{ success: true, opportunity: await createOpportunity(user.id, parsed.data) },
		{ status: 201 },
	)
}
