import { NextResponse } from "next/server"
import { invalidRequest, readJsonBody, requireApiUser } from "@/lib/auth-guards"
import { searchApplications } from "@/lib/volunteer-applications"
import { searchApplicationsSchema } from "@/lib/validation/volunteer-application"

export async function POST(request: Request) {
	const { response } = await requireApiUser(request, { admin: true })
	if (response) {
		return response
	}

	const parsed = searchApplicationsSchema.safeParse(await readJsonBody(request))
	if (!parsed.success) {
		return invalidRequest(parsed.error)
	}

	return NextResponse.json({ success: true, applications: await searchApplications(parsed.data) })
}
