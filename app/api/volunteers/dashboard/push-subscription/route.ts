import { NextResponse } from "next/server"
import { z } from "zod"
import { invalidRequest, readJsonBody, requireApiUser } from "@/lib/auth-guards"
import { removePushSubscription, savePushSubscription } from "@/lib/push"
import { pushSubscriptionSchema } from "@/lib/validation/announcement"

export async function POST(request: Request) {
	const { user, response } = await requireApiUser(request)
	if (response) {
		return response
	}

	const parsed = pushSubscriptionSchema.safeParse(await readJsonBody(request))
	if (!parsed.success) {
		return invalidRequest(parsed.error, "That push subscription is not valid.")
	}

	await savePushSubscription(user.id, parsed.data)

	return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
	const { user, response } = await requireApiUser(request)
	if (response) {
		return response
	}

	const parsed = z.object({ endpoint: z.string().min(1) }).safeParse(await readJsonBody(request))
	if (!parsed.success) {
		return invalidRequest(parsed.error, "Send the subscription endpoint to remove.")
	}

	await removePushSubscription(user.id, parsed.data.endpoint)

	return NextResponse.json({ success: true })
}
