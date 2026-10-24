import { NextResponse } from "next/server"
import { markNotificationsRead } from "@/lib/announcements"
import { forbidOtherUser, invalidRequest, readJsonBody, requireApiUser } from "@/lib/auth-guards"
import { markReadSchema } from "@/lib/validation/announcement"

export async function POST(request: Request) {
	const { user, response } = await requireApiUser(request)
	if (response) {
		return response
	}

	const parsed = markReadSchema.safeParse(await readJsonBody(request))
	if (!parsed.success) {
		return invalidRequest(parsed.error)
	}

	const forbidden = forbidOtherUser(user, parsed.data.userId)
	if (forbidden) {
		return forbidden
	}

	const unreadCount = await markNotificationsRead(user.id, parsed.data.notificationIds)

	return NextResponse.json({ success: true, unreadCount })
}
