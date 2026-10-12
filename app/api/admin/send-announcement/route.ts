import { after, NextResponse } from "next/server"
import { createAnnouncement } from "@/lib/announcements"
import { invalidRequest, readJsonBody, requireApiUser } from "@/lib/auth-guards"
import { sendPushToVolunteers } from "@/lib/push"
import { announcementSchema } from "@/lib/validation/announcement"

export async function POST(request: Request) {
	const { user, response } = await requireApiUser(request, { admin: true })
	if (response) {
		return response
	}

	const parsed = announcementSchema.safeParse(await readJsonBody(request))
	if (!parsed.success) {
		return invalidRequest(parsed.error)
	}

	try {
		const { post, recipientIds } = await createAnnouncement(user.id, parsed.data)

		// Pushes go out after the response so the admin is not kept waiting.
		after(() =>
			sendPushToVolunteers(recipientIds, {
				title: post.title,
				body: post.body,
				url: "/home",
			}),
		)

		return NextResponse.json({
			success: true,
			postId: post.id,
			recipientCount: recipientIds.length,
		})
	} catch (error) {
		console.error("Failed to send announcement:", error)
		return NextResponse.json(
			{ success: false, error: "The announcement could not be sent. Please try again." },
			{ status: 500 },
		)
	}
}
