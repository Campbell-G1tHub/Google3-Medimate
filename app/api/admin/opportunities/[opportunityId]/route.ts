import { NextResponse } from "next/server"
import { invalidRequest, readJsonBody, requireApiUser } from "@/lib/auth-guards"
import { cancelOpportunity, updateOpportunity } from "@/lib/opportunities"
import { opportunityIdSchema, updateOpportunitySchema } from "@/lib/validation/opportunity"

const NOT_FOUND_MESSAGE = "That opportunity could not be found."

/** Only the admin who created an opportunity can edit or delete it. */
async function readParams(context: { params: Promise<{ opportunityId: string }> }) {
	return opportunityIdSchema.safeParse((await context.params).opportunityId)
}

export async function PATCH(
	request: Request,
	context: { params: Promise<{ opportunityId: string }> },
) {
	const { user, response } = await requireApiUser(request, { admin: true })
	if (response) {
		return response
	}

	const params = await readParams(context)
	if (!params.success) {
		return invalidRequest(params.error, params.error.issues[0]?.message)
	}

	const parsed = updateOpportunitySchema.safeParse(await readJsonBody(request))
	if (!parsed.success) {
		return invalidRequest(parsed.error)
	}

	const opportunity = await updateOpportunity(user.id, params.data, parsed.data)
	if (!opportunity) {
		return NextResponse.json({ success: false, error: NOT_FOUND_MESSAGE }, { status: 404 })
	}

	return NextResponse.json({ success: true, opportunity })
}

export async function DELETE(
	request: Request,
	context: { params: Promise<{ opportunityId: string }> },
) {
	const { user, response } = await requireApiUser(request, { admin: true })
	if (response) {
		return response
	}

	const params = await readParams(context)
	if (!params.success) {
		return invalidRequest(params.error, params.error.issues[0]?.message)
	}

	if (!(await cancelOpportunity(user.id, params.data))) {
		return NextResponse.json({ success: false, error: NOT_FOUND_MESSAGE }, { status: 404 })
	}

	return NextResponse.json({ success: true })
}
