import { NextResponse } from "next/server"
import { listNotifications } from "@/lib/announcements"
import { forbidOtherUser, invalidRequest, readJsonBody, requireApiUser } from "@/lib/auth-guards"
import { listNotificationsSchema } from "@/lib/validation/announcement"

export async function POST(request: Request) {
	const { user, response } = await requireApiUser(request)
	if (response) {
		return response
	}

	const parsed = listNotificationsSchema.safeParse(await readJsonBody(request))
	if (!parsed.success) {
		return invalidRequest(parsed.error)
	}

	const forbidden = forbidOtherUser(user, parsed.data.userId)
	if (forbidden) {
		return forbidden
	}

	return NextResponse.json({ success: true, ...(await listNotifications(user.id)) })
}
