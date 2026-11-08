import { NextResponse } from "next/server"
import { requireApiUser } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
	const { response } = await requireApiUser(request, { admin: true })
	if (response) {
		return response
	}

	const events = await prisma.event.findMany({
		where: { status: "OPEN" },
		orderBy: { startsAt: "asc" },
		select: {
			id: true,
			title: true,
			location: true,
			startsAt: true,
		},
	})

	return NextResponse.json({
		events: events.map((event) => ({
			...event,
			startsAt: event.startsAt?.toISOString() ?? null,
		})),
	})
}
