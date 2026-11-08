import { after, NextResponse } from "next/server"
import { invalidRequest, readJsonBody, requireApiUser } from "@/lib/auth-guards"
import { createOpportunity, listCreatedOpportunities } from "@/lib/opportunities"
import { createOpportunitySchema } from "@/lib/validation/opportunity"
import { sendPushToVolunteers } from "@/lib/push"
import { createAnnouncement } from "@/lib/announcements"

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
	const { post, recipientIds } = await createAnnouncement(user.id, parsed.data)
	after(() =>
		sendPushToVolunteers(recipientIds, {
			title: post.title,
			body: post.body,
			url: "/home",
		}),
	)

	return NextResponse.json(
		{ success: true, opportunity: await createOpportunity(user.id, parsed.data) },
		{ status: 201 },
	)
}
