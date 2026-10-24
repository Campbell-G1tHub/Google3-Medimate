import { NextResponse } from "next/server"
import { requireApiUser } from "@/lib/auth-guards"
import { getApplication } from "@/lib/volunteer-applications"
import { applicationIdSchema } from "@/lib/validation/volunteer-application"

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ applicationId: string }> },
) {
	const { response } = await requireApiUser(request, { admin: true })
	if (response) {
		return response
	}

	const parsed = applicationIdSchema.safeParse((await params).applicationId)
	if (!parsed.success) {
		return NextResponse.json(
			{ success: false, error: "Application ID must be a UUID" },
			{ status: 400 },
		)
	}

	const application = await getApplication(parsed.data)
	if (!application) {
		return NextResponse.json(
			{ success: false, error: "That application could not be found." },
			{ status: 404 },
		)
	}

	return NextResponse.json({ success: true, application })
}
