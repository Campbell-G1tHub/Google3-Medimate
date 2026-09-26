import { NextResponse } from "next/server"
import { submitOnboarding } from "../actions"

export async function POST(request: Request) {
	const body = await request.json()
	const result = await submitOnboarding(body)
	return NextResponse.json(result ?? { success: true })
}
